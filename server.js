const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 8703; // c:/Programming/PORTS.md 등록
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data', 'kband.db');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const BUILD_DIR = path.join(__dirname, 'build');
const PROD = process.env.NODE_ENV === 'production';

// ---------- DB ----------
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
const db = new DatabaseSync(DB_FILE);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA secure_delete = ON; -- 지운 행을 0으로 덮어씀(처리방침 "복구할 수 없게 삭제")
  CREATE TABLE IF NOT EXISTS reservations (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    roomId    INTEGER NOT NULL,
    date      TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime   TEXT NOT NULL,
    name      TEXT NOT NULL,
    phone     TEXT NOT NULL,
    status    TEXT NOT NULL DEFAULT '신청',
    memo      TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
  CREATE INDEX IF NOT EXISTS idx_resv_room_date ON reservations(roomId, date);
  CREATE TABLE IF NOT EXISTS members (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    email     TEXT NOT NULL,
    phone     TEXT NOT NULL UNIQUE,
    band      TEXT NOT NULL DEFAULT '',
    role      TEXT NOT NULL DEFAULT '',
    location  TEXT NOT NULL DEFAULT '',
    birth     TEXT NOT NULL DEFAULT '',
    genre     TEXT NOT NULL DEFAULT '',
    intro     TEXT NOT NULL DEFAULT '',
    status    TEXT NOT NULL DEFAULT '신청',
    memo      TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
  -- 관리자 접속기록(안전성 확보조치 기준 제8조: 1년 이상 보관). 누가=IP(관리자 계정이 하나뿐), 언제, 무엇을(메서드·경로·결과)
  CREATE TABLE IF NOT EXISTS admin_log (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ip     TEXT NOT NULL,
    method TEXT NOT NULL,
    path   TEXT NOT NULL,
    status INTEGER NOT NULL
  );
  -- 팀·공연(2026-10-20). 개인정보 없음 → 공개 일정에 그대로 나감. 팀 연락처는 따로 안 받고 연결된 멤버(동의한 신청자)로
  CREATE TABLE IF NOT EXISTS teams (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    memo TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS events (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    date  TEXT NOT NULL,
    time  TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL,
    place TEXT NOT NULL DEFAULT '',
    note  TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS event_teams (
    eventId INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    teamId  INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    PRIMARY KEY (eventId, teamId)
  );
  PRAGMA foreign_keys = ON;
`);
// 운영진 계정(2026-10-30). 지우지 않고 active=0으로 끔 → 접속기록의 "누가"가 계속 풀림
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    username  TEXT NOT NULL UNIQUE,
    name      TEXT NOT NULL,
    role      TEXT NOT NULL,
    pwHash    TEXT NOT NULL,
    active    INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
`);
if (!db.prepare('PRAGMA table_info(admin_log)').all().some(c => c.name === 'adminId'))
  db.exec('ALTER TABLE admin_log ADD COLUMN adminId INTEGER'); // 그 전 기록은 NULL(공용 비밀번호 시절)
// 2026-10-18·20 추가 열. 기존 DB엔 ALTER로 (CREATE IF NOT EXISTS는 열을 안 늘림)
const memberCols = db.prepare('PRAGMA table_info(members)').all().map(c => c.name);
if (!memberCols.includes('leader')) db.exec('ALTER TABLE members ADD COLUMN leader INTEGER NOT NULL DEFAULT 0');
// 신청자가 적은 band(자유 글자)는 그대로 두고, 소속은 teamId 하나로만 본다(관리자 연결 또는 신청 때 이름 일치로 자동)
if (!memberCols.includes('teamId')) db.exec('ALTER TABLE members ADD COLUMN teamId INTEGER REFERENCES teams(id) ON DELETE SET NULL');
// 10-31: 아직 연결 안 된 멤버를 밴드 이름으로 팀에 붙임(공백·대소문자 무시). 기동마다 돌려도 됨 → 멤버보다 팀이 나중에 생겨도 다음 기동에 붙음
const TEAM_BY_BAND = '(SELECT id FROM teams WHERE lower(trim(name)) = lower(trim(?)))';
db.exec(`UPDATE members SET teamId = ${TEAM_BY_BAND.replace('?', 'members.band')} WHERE teamId IS NULL`);
// 10-31: 팀 소개 페이지에 이름·역할 공개 동의(선택). 지금은 저장·관리자 표시만, 공개 페이지는 아직 안 씀. 기존 신청자는 0 = 동의 안 받음
if (!memberCols.includes('publicOk')) db.exec('ALTER TABLE members ADD COLUMN publicOk INTEGER NOT NULL DEFAULT 0');
// 팀 소개 페이지(2026-10-30). 팀이 수정 링크(editKey)로 직접 고치고 바로 공개, 관리자는 숨김만. 개인정보 칸은 두지 않음
const teamCols = db.prepare('PRAGMA table_info(teams)').all().map(c => c.name);
for (const [c, def] of [['genre', "TEXT NOT NULL DEFAULT ''"], ['intro', "TEXT NOT NULL DEFAULT ''"],
  ['videos', "TEXT NOT NULL DEFAULT '[]'"], ['editKey', 'TEXT'], ['hidden', 'INTEGER NOT NULL DEFAULT 0'],
  ['links', "TEXT NOT NULL DEFAULT '[]'"]]) // 10-31: 유튜브 채널·인스타그램 주소(팀 공개 계정, 허용 호스트만)
  if (!teamCols.includes(c)) db.exec(`ALTER TABLE teams ADD COLUMN ${c} ${def}`);
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS teams_editKey ON teams(editKey)');

// 보유기간 경과분 자동 파기(개인정보처리방침 3절과 같은 숫자). 합류한 멤버는 활동 종료·철회 때 관리자가 삭제
function purgeExpired() {
  const m = db.prepare(`DELETE FROM members WHERE status != '합류' AND createdAt < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 year')`).run();
  const r = db.prepare(`DELETE FROM reservations WHERE date < date('now', '+9 hours', '-1 year')`).run();
  db.prepare(`DELETE FROM admin_log WHERE at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 years')`).run();
  if (m.changes || r.changes) console.log(`보유기간 경과 파기: 멤버 신청 ${m.changes}, 예약 ${r.changes}`);
}
purgeExpired();
setInterval(purgeExpired, 24 * 3600 * 1000).unref();

const RESV_STATUS = ['신청', '확정', '취소'];
const MEMBER_STATUS = ['신청', '연락함', '합류', '보류'];
const CONSENT_MSG = '개인정보 수집·이용 동의가 필요합니다.';
// 만 14세 미만은 법정대리인 동의가 필요(개인정보 보호법 제22조의2) → 받지 않음. 폼 체크(age14) + 생년월일로 이중 확인
const AGE_MSG = '만 14세 이상만 신청할 수 있습니다.';
const kstToday = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const under14 = birth => `${Number(birth.slice(0, 4)) + 14}${birth.slice(4)}` > kstToday(); // 14번째 생일 당일부터 허용
// 합류 안내문 재료. 서버 .env에만 둠(공개 저장소 금지). 관리자가 /admin에서 복사해 문자·카톡으로 직접 보냄 — 사이트는 신청자에게 메일·문자를 보내지 않음
const INVITE = {
  band: process.env.BAND_INVITE_URL || '',   // 네이버 밴드 초대 링크(가입 승인은 밴드에서)
  chat: process.env.KAKAO_OPEN_URL || '',    // 밴드 리더 오픈채팅 링크
  chatCode: process.env.KAKAO_OPEN_CODE || '', // 오픈채팅 참여코드
};
// 예약을 받는 방 = 여기 있는 id만. .env ROOM_NAMES='{"3":"연습실 A"}' (src/data/spaces.js rehearsal과 맞출 것).
// 2026-10-17 연습실 미확정 → 비어 있음 → 공개 예약 API는 전부 400 (화면만 막고 API가 열려 있던 구멍)
const ROOM_NAMES = JSON.parse(process.env.ROOM_NAMES || '{}');

// 신규 신청 텔레그램 알림. 두 env가 없으면 꺼짐. 개인정보는 넣지 않음(텔레그램 서버에 남으므로) → 상세는 /admin에서
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TG_CHAT = process.env.TELEGRAM_CHAT_ID || '';
// Node happy-eyeballs 기본 250ms가 서울→텔레그램 TCP 연결(≈280ms)보다 짧아 ETIMEDOUT. 측정 2026-10-17
require('net').setDefaultAutoSelectFamilyAttemptTimeout(3000);
function notify(text) {
  if (!TG_TOKEN || !TG_CHAT) return;
  fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_CHAT, text: `${text}\nhttps://kband.co.kr/admin` }),
  }).then(r => { if (!r.ok) console.error('telegram http', r.status); })
    .catch(e => console.error('telegram:', e.message));
}
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// 달력에 있는 날짜만. V8은 2010-02-30을 3월 2일로 넘겨버리므로 되돌린 문자열과 비교 (2026-99-99는 Invalid → throw 방지)
const isDate = s => DATE_RE.test(s || '') && !isNaN(new Date(s)) && new Date(s).toISOString().slice(0, 10) === s;
const TIME_RE = /^\d{2}:00$/;

// ---------- helpers ----------
function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  return digits.length <= 7
    ? digits
    : `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}
const PHONE_RE = /^\d{2,3}-\d{3,4}-\d{4}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // Join.js와 같은 식
const NAME_MSG = '이름을 정확히 입력해주세요.';
// 글자(한글·영문 등)로 시작, 글자·공백·. ' · - 만, 글자 2자 이상. 자모만(ㅋㅋ)은 거부
function isName(s) {
  if (!/^\p{L}[\p{L}\s.'·-]*$/u.test(s) || /[ㄱ-ㆎ]/.test(s)) return false;
  return s.match(/\p{L}/gu).length >= 2;
}
// 메일 받을 서버(MX)가 없는 도메인 거부. DNS 장애·시간초과는 통과시킴(신청을 막는 쪽이 더 손해)
const mxResolver = new (require('dns').promises.Resolver)({ timeout: 3000, tries: 1 });
async function hasMailServer(email) {
  try {
    const mx = await mxResolver.resolveMx(email.split('@')[1]);
    return mx.some(r => r.exchange); // exchange '' = "메일 안 받음" 선언(null MX)
  } catch (e) {
    return !['ENOTFOUND', 'ENODATA'].includes(e.code);
  }
}

// 날짜 + 시간을 절대 분(minute)으로 변환 — 자정 경계(24:00~29:00) 비교에 사용
function toAbsMins(date, timeStr) {
  const [h] = timeStr.split(':').map(Number);
  return Math.floor(new Date(date).getTime() / 60000) + h * 60;
}

function shiftDate(dateStr, days) {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

// 같은 방, 전날~다음날 범위의 취소 아닌 예약과 겹치는지
function hasConflict(roomId, date, startTime, endTime, excludeId = 0) {
  const rows = db.prepare(`
    SELECT date, startTime, endTime FROM reservations
    WHERE roomId = ? AND status != '취소' AND id != ? AND date BETWEEN ? AND ?
  `).all(roomId, excludeId, shiftDate(date, -1), shiftDate(date, 1));
  const s = toAbsMins(date, startTime), e = toAbsMins(date, endTime);
  return rows.some(r => toAbsMins(r.date, r.startTime) < e && toAbsMins(r.date, r.endTime) > s);
}

// ponytail: 메모리 요청 제한. 프로세스 하나라 충분, 다중 프로세스면 Caddy rate_limit로 이동
const hits = new Map();
function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const key = `${req.path}:${req.ip}`;
    const now = Date.now();
    const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
    if (arr.length >= max) return res.status(429).json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' });
    arr.push(now);
    hits.set(key, arr);
    next();
  };
}

// 역할 = 고정 3단계(안전성 확보조치 기준 제5조: 업무에 따라 접근권한 차등). 탭별 체크박스는 역할이 안 맞는 사람이 생기면
//  events: 팀·공연·라인업 편집(개인정보 없음)
//  people: 멤버 신청·예약 열람, 상태·메모·팀·리더만 수정, 합류 안내문
//  people.full: 개인정보 항목 수정·삭제   accounts: 운영진 계정 관리
const ROLES = {
  owner: { label: '대표관리자', perms: ['events', 'people', 'people.full', 'accounts'] },
  staff: { label: '운영진', perms: ['events', 'people'] },
  event: { label: '공연 담당', perms: ['events'] },
};
const can = (admin, perm) => ROLES[admin.role]?.perms.includes(perm);
const MIN_PW = 10;

// 비밀번호 해시: scrypt(내장), "salt:hash" hex
function hashPw(pw) {
  const salt = crypto.randomBytes(16);
  return `${salt.toString('hex')}:${crypto.scryptSync(String(pw), salt, 64).toString('hex')}`;
}
const DUMMY_HASH = hashPw(crypto.randomBytes(16)); // 없는 아이디도 같은 시간 들게(아이디 존재 여부 노출 방지)
function checkPw(pw, stored) {
  const [salt, hash] = stored.split(':');
  return crypto.timingSafeEqual(crypto.scryptSync(String(pw), Buffer.from(salt, 'hex'), 64), Buffer.from(hash, 'hex'));
}
// 첫 대표관리자: 계정이 하나도 없을 때만 ADMIN_PASSWORD로 'admin' 생성. 그 뒤 ADMIN_PASSWORD는 안 씀
if (!db.prepare('SELECT 1 FROM admins').get() && ADMIN_PASSWORD) {
  db.prepare(`INSERT INTO admins (username, name, role, pwHash) VALUES ('admin', '대표관리자', 'owner', ?)`).run(hashPw(ADMIN_PASSWORD));
  console.log("첫 대표관리자 계정 'admin' 생성(비밀번호 = ADMIN_PASSWORD). 로그인 뒤 비밀번호를 바꾸세요.");
}

// ponytail: 세션은 메모리 Map(토큰→{adminId, last}). 서버 재시작 = 전원 로그아웃, 운영진 열 명 안팎이면 그걸로 충분
// 60분 동안 요청이 없으면 만료(안전성 확보조치 기준 제6조④: 일정 시간 업무 처리 없으면 접속 차단)
const IDLE_MS = 60 * 60 * 1000;
const sessions = new Map();
const COOKIE = 'kband_admin';
function getToken(req) {
  const m = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]+)`));
  return m ? m[1] : null;
}
const dropSessions = adminId => { for (const [t, s] of sessions) if (s.adminId === adminId) sessions.delete(t); };
// 계정은 요청마다 DB에서 다시 읽음 → 끄거나 역할을 바꾸면 다음 요청부터 바로 적용
function requireAdmin(req, res, next) {
  const token = getToken(req), s = sessions.get(token);
  const admin = s && Date.now() - s.last < IDLE_MS &&
    db.prepare('SELECT id, username, name, role FROM admins WHERE id = ? AND active = 1').get(s.adminId);
  if (!admin) { sessions.delete(token); return res.status(401).json({ error: '로그인이 필요합니다.' }); }
  s.last = Date.now();
  req.admin = admin;
  next();
}
const need = perm => [requireAdmin, (req, res, next) =>
  can(req.admin, perm) ? next() : res.status(403).json({ error: '권한이 없습니다.' })];

// ---------- app ----------
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Caddy 뒤에서 req.ip가 실제 클라이언트가 되도록
app.use(express.json({ limit: '32kb' }));

// 특정 방·날짜의 예약 목록 (전날에서 자정 넘어온 예약 포함). 개인정보는 내보내지 않음
app.get('/api/reservations', (req, res) => {
  const roomId = parseInt(req.query.roomId);
  const { date } = req.query;
  if (!roomId || !isDate(date)) return res.status(400).json({ error: '잘못된 요청입니다.' });
  const rows = db.prepare(`
    SELECT date, startTime, endTime FROM reservations
    WHERE roomId = ? AND status != '취소' AND (date = ? OR (date = ? AND CAST(endTime AS INTEGER) > 24))
  `).all(roomId, date, shiftDate(date, -1));
  res.json(rows);
});

app.post('/api/reservations', rateLimit(20, 60 * 60 * 1000), (req, res) => {
  const { roomId, date, startTime, endTime } = req.body;
  const name = String(req.body.name || '').trim().slice(0, 100);
  const phone = normalizePhone(req.body.phone);
  if (!roomId || !date || !startTime || !endTime || !name || !phone)
    return res.status(400).json({ error: '모든 항목을 입력해주세요.' });
  if (!Object.hasOwn(ROOM_NAMES, roomId)) return res.status(400).json({ error: '예약을 받지 않는 공간입니다.' });
  if (req.body.consent !== true) return res.status(400).json({ error: CONSENT_MSG });
  if (req.body.age14 !== true) return res.status(400).json({ error: AGE_MSG });
  if (!isName(name)) return res.status(400).json({ error: NAME_MSG });
  if (!isDate(date) || !TIME_RE.test(startTime) || !TIME_RE.test(endTime) || startTime >= endTime)
    return res.status(400).json({ error: '날짜 또는 시간 형식이 올바르지 않습니다.' });
  if (!PHONE_RE.test(phone)) return res.status(400).json({ error: '올바른 전화번호 형식이 아닙니다.' });
  if (hasConflict(parseInt(roomId), date, startTime, endTime))
    return res.status(409).json({ error: '해당 시간대에 이미 예약이 있습니다.' });
  // 단일 프로세스·동기 DB라 검사와 삽입 사이에 끼어들 요청이 없음
  const r = db.prepare('INSERT INTO reservations (roomId, date, startTime, endTime, name, phone) VALUES (?, ?, ?, ?, ?, ?)')
    .run(parseInt(roomId), date, startTime, endTime, name, phone);
  res.status(201).json({ success: true, id: Number(r.lastInsertRowid) });
  notify(`연습실 예약 신청 #${r.lastInsertRowid}\n${ROOM_NAMES[roomId]} · ${date} ${startTime}~${endTime}`);
});

// 공연 일정 + 라인업(팀 이름만). 공개 일정 페이지와 관리자 공연 탭이 같이 씀. 라인업 순서 = 넣은 순서(공지 순서)
app.get('/api/events', (req, res) => {
  const events = db.prepare('SELECT * FROM events ORDER BY date, time').all();
  // page = 소개 페이지로 링크할지(숨김 아니고 채운 내용이 있을 때)
  const lineup = db.prepare(`SELECT et.eventId, t.id, t.name, (t.hidden = 0 AND (t.intro != '' OR t.videos != '[]' OR t.links != '[]')) AS page
    FROM event_teams et JOIN teams t ON t.id = et.teamId ORDER BY et.rowid`).all();
  for (const e of events) e.teams = lineup.filter(l => l.eventId === e.id).map(({ id, name, page }) => ({ id, name, page: !!page }));
  res.json(events);
});

// 팀 소개 페이지. 숨긴 팀은 없는 것처럼 404. 출연 이력은 라인업에서
// 멤버는 공개 동의(publicOk=1)한 사람만. 소속은 teamId(관리자 연결 또는 신청 때 밴드 이름 일치로 자동 채움)
function publicTeam(id) {
  const t = db.prepare('SELECT id, name, genre, intro, videos, links FROM teams WHERE id = ? AND hidden = 0').get(id);
  if (!t) return null;
  t.videos = JSON.parse(t.videos); t.links = JSON.parse(t.links);
  t.members = db.prepare('SELECT name, role, leader FROM members WHERE publicOk = 1 AND teamId = ? ORDER BY leader DESC, name').all(id);
  t.events = db.prepare(`SELECT e.id, e.date, e.time, e.title, e.place FROM event_teams et JOIN events e ON e.id = et.eventId
    WHERE et.teamId = ? ORDER BY e.date DESC, e.time DESC`).all(id);
  return t;
}
app.get('/api/teams/:id', (req, res) => {
  const t = publicTeam(parseInt(req.params.id));
  t ? res.json(t) : res.status(404).json({ error: '없는 팀입니다.' });
});

// 팀이 수정 링크로 직접 고침. 로그인 대신 링크(관리자가 발급·재발급). 칸은 장르·소개·유튜브 영상·채널/인스타 주소만 → 개인정보를 받을 자리가 없음
const MAX_VIDEOS = 6, MAX_LINKS = 4;
// 외부 링크는 유튜브·인스타그램만. 다른 호스트는 거부(아무 주소나 받으면 공개 페이지가 광고판이 됨)
const LINK_HOSTS = ['youtube.com', 'youtu.be', 'instagram.com'];
const linkOf = u => { try { const x = new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`); x.protocol = 'https:'; return LINK_HOSTS.includes(x.hostname.replace(/^(www|m)\./, '')) ? x.href : null; } catch { return null; } };
// 유튜브 주소 → 영상 id(11자). watch?v= · youtu.be/ · shorts/ · live/ · embed/
const ytId = u => (String(u).trim().match(/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})(?![\w-])/) || [])[1];
const teamByKey = key => /^[a-f0-9]{32}$/.test(key) && db.prepare('SELECT * FROM teams WHERE editKey = ?').get(key);
app.get('/api/team-edit/:key', (req, res) => {
  const t = teamByKey(req.params.key);
  if (!t) return res.status(404).json({ error: '링크가 맞지 않습니다. 운영진에게 새 링크를 받아주세요.' });
  res.json({ id: t.id, name: t.name, genre: t.genre, intro: t.intro, hidden: !!t.hidden, videos: JSON.parse(t.videos).map(id => `https://youtu.be/${id}`), links: JSON.parse(t.links) });
});
app.put('/api/team-edit/:key', rateLimit(30, 60 * 60 * 1000), (req, res) => {
  const t = teamByKey(req.params.key);
  if (!t) return res.status(404).json({ error: '링크가 맞지 않습니다. 운영진에게 새 링크를 받아주세요.' });
  const genre = String(req.body.genre || '').trim().slice(0, 50);
  const intro = String(req.body.intro || '').trim().slice(0, 2000);
  const urls = (Array.isArray(req.body.videos) ? req.body.videos : []).map(u => String(u).trim()).filter(Boolean);
  const bad = urls.find(u => !ytId(u));
  if (bad) return res.status(400).json({ error: `유튜브 주소가 아닙니다: ${bad.slice(0, 100)}` });
  const videos = [...new Set(urls.map(ytId))];
  if (videos.length > MAX_VIDEOS) return res.status(400).json({ error: `영상은 ${MAX_VIDEOS}개까지입니다.` });
  const linkUrls = (Array.isArray(req.body.links) ? req.body.links : []).map(u => String(u).trim()).filter(Boolean);
  const badLink = linkUrls.find(u => !linkOf(u));
  if (badLink) return res.status(400).json({ error: `유튜브·인스타그램 주소만 넣을 수 있습니다: ${badLink.slice(0, 100)}` });
  const links = [...new Set(linkUrls.map(linkOf))];
  if (links.length > MAX_LINKS) return res.status(400).json({ error: `링크는 ${MAX_LINKS}개까지입니다.` });
  db.prepare('UPDATE teams SET genre = ?, intro = ?, videos = ?, links = ? WHERE id = ?').run(genre, intro, JSON.stringify(videos), JSON.stringify(links), t.id);
  res.json({ ok: true });
  notify(`팀 소개 수정: ${t.name}\nhttps://kband.co.kr/teams/${t.id}`); // 바로 공개라 운영진이 보고 이상하면 숨김
});

// 30회: 공연장 와이파이처럼 한 IP를 여럿이 쓰는 현장 가입 대비. 장난은 이름·이메일 검사와 연락처 중복이 거름
// 신청서 1단계 "다음"에서 메일 도메인만 미리 확인(주소 앞부분은 안 받음). 최종 판정은 아래 POST가 다시 함
app.get('/api/mx', rateLimit(60, 60 * 60 * 1000), async (req, res) =>
  res.json({ ok: await hasMailServer('@' + String(req.query.domain || '').slice(0, 253)) }));

app.post('/api/members', rateLimit(30, 60 * 60 * 1000), async (req, res) => {
  const f = {};
  for (const k of ['name', 'email', 'band', 'role', 'location', 'birth', 'genre', 'intro'])
    f[k] = String(req.body[k] || '').trim().slice(0, k === 'intro' ? 2000 : 100); // 폼은 select/input이지만 API 직접 호출 대비
  const phone = normalizePhone(req.body.phone);
  if (!f.name || !f.email || !phone) return res.status(400).json({ error: '이름, 이메일, 연락처는 필수 항목입니다.' });
  if (req.body.consent !== true) return res.status(400).json({ error: CONSENT_MSG });
  if (req.body.age14 !== true) return res.status(400).json({ error: AGE_MSG });
  if (f.birth && !isDate(f.birth)) return res.status(400).json({ error: '생년월일 형식이 올바르지 않습니다.' });
  if (f.birth && under14(f.birth)) return res.status(400).json({ error: AGE_MSG });
  if (!isName(f.name)) return res.status(400).json({ error: NAME_MSG });
  if (!EMAIL_RE.test(f.email)) return res.status(400).json({ error: '올바른 이메일 형식이 아닙니다.' });
  if (!PHONE_RE.test(phone)) return res.status(400).json({ error: '올바른 전화번호 형식이 아닙니다.' });
  if (!await hasMailServer(f.email)) return res.status(400).json({ error: '메일을 받을 수 없는 이메일 주소입니다. 주소를 확인해주세요.' });
  // 중복 검사는 await 뒤에: 기다리는 사이 같은 번호가 먼저 들어올 수 있음
  if (db.prepare('SELECT 1 FROM members WHERE phone = ?').get(phone))
    return res.status(409).json({ error: '이미 같은 연락처로 신청된 내역이 있습니다.' });
  const leader = req.body.leader === true ? 1 : 0;
  const publicOk = req.body.publicOk === true ? 1 : 0;
  // 밴드 이름이 기존 팀과 같으면 바로 소속(teamId). 관리자 화면·공개 페이지가 모두 이 열만 본다
  const r = db.prepare(`INSERT INTO members (name, email, phone, band, role, location, birth, genre, intro, leader, publicOk, teamId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${TEAM_BY_BAND})`).run(f.name, f.email, phone, f.band, f.role, f.location, f.birth, f.genre, f.intro, leader, publicOk, f.band);
  res.status(201).json({ success: true, id: Number(r.lastInsertRowid), band: INVITE.band }); // 완료 화면의 밴드 가입 링크(승인은 밴드에서)
  notify(`멤버 신청 #${r.lastInsertRowid} (역할: ${f.role || '미선택'}${leader ? ' · 밴드 리더' : ''})`);
});

// ---------- admin ----------
// 접속기록: 로그인 시도 포함 /api/admin 요청 전부. 점검은 README "관리자 접속기록"
app.use('/api/admin', (req, res, next) => {
  res.on('finish', () => db.prepare('INSERT INTO admin_log (ip, method, path, status, adminId) VALUES (?, ?, ?, ?, ?)')
    .run(req.ip || '', req.method, req.originalUrl.slice(0, 500), res.statusCode, req.admin?.id ?? null));
  next();
});
app.post('/api/admin/login', rateLimit(10, 15 * 60 * 1000), (req, res) => {
  const row = db.prepare('SELECT * FROM admins WHERE username = ? AND active = 1').get(String(req.body.username || '').trim());
  const ok = checkPw(req.body.password || '', row ? row.pwHash : DUMMY_HASH);
  if (!row || !ok) return res.status(401).json({ error: '아이디 또는 비밀번호가 틀렸습니다.' });
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { adminId: row.id, last: Date.now() });
  req.admin = row;
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: PROD, maxAge: 7 * 24 * 3600 * 1000 });
  res.json({ ok: true });
});
app.post('/api/admin/logout', (req, res) => {
  sessions.delete(getToken(req));
  res.clearCookie(COOKIE);
  res.json({ ok: true });
});
app.get('/api/admin/me', requireAdmin, (req, res) =>
  res.json({ ...req.admin, roleLabel: ROLES[req.admin.role]?.label, perms: ROLES[req.admin.role]?.perms || [] }));
app.post('/api/admin/me/password', requireAdmin, rateLimit(10, 15 * 60 * 1000), (req, res) => {
  const { pwHash } = db.prepare('SELECT pwHash FROM admins WHERE id = ?').get(req.admin.id);
  if (!checkPw(req.body.current || '', pwHash)) return res.status(400).json({ error: '현재 비밀번호가 틀렸습니다.' });
  if (String(req.body.next || '').length < MIN_PW) return res.status(400).json({ error: `새 비밀번호는 ${MIN_PW}자 이상이어야 합니다.` });
  db.prepare('UPDATE admins SET pwHash = ? WHERE id = ?').run(hashPw(req.body.next), req.admin.id);
  const token = getToken(req), mine = sessions.get(token);
  dropSessions(req.admin.id); sessions.set(token, mine); // 다른 기기 로그인은 끊고 지금 창은 유지
  res.json({ ok: true });
});

// 운영진 계정. 삭제 없음(끄기만). 마지막 활성 대표관리자는 끄거나 강등 못 함
app.get('/api/admin/accounts', need('accounts'), (req, res) =>
  res.json(db.prepare('SELECT id, username, name, role, active, createdAt FROM admins ORDER BY active DESC, id').all()));
app.get('/api/admin/roles', requireAdmin, (req, res) =>
  res.json(Object.entries(ROLES).map(([key, r]) => ({ key, label: r.label }))));
app.post('/api/admin/accounts', need('accounts'), (req, res) => {
  const username = String(req.body.username || '').trim(), name = String(req.body.name || '').trim().slice(0, 50);
  if (!/^[a-z0-9_.-]{3,30}$/.test(username)) return res.status(400).json({ error: '아이디는 영문 소문자·숫자·_.- 3–30자입니다.' });
  if (!name) return res.status(400).json({ error: '이름이 비었습니다.' });
  if (!ROLES[req.body.role]) return res.status(400).json({ error: '없는 역할입니다.' });
  if (String(req.body.password || '').length < MIN_PW) return res.status(400).json({ error: `비밀번호는 ${MIN_PW}자 이상이어야 합니다.` });
  try {
    const r = db.prepare('INSERT INTO admins (username, name, role, pwHash) VALUES (?, ?, ?, ?)').run(username, name, req.body.role, hashPw(req.body.password));
    res.status(201).json({ id: Number(r.lastInsertRowid) });
  } catch (e) { if (e.errcode === 2067) return res.status(409).json({ error: '같은 아이디가 있습니다.' }); throw e; }
});
app.patch('/api/admin/accounts/:id', need('accounts'), (req, res) => {
  const id = parseInt(req.params.id);
  const cur = db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
  if (!cur) return res.status(404).json({ error: '없는 계정입니다.' });
  const next = { name: cur.name, role: cur.role, active: cur.active };
  if ('name' in req.body) next.name = String(req.body.name || '').trim().slice(0, 50);
  if ('role' in req.body) next.role = req.body.role;
  if ('active' in req.body) next.active = req.body.active ? 1 : 0;
  if (!next.name) return res.status(400).json({ error: '이름이 비었습니다.' });
  if (!ROLES[next.role]) return res.status(400).json({ error: '없는 역할입니다.' });
  const owners = db.prepare(`SELECT COUNT(*) AS n FROM admins WHERE role = 'owner' AND active = 1 AND id != ?`).get(id).n;
  if (cur.role === 'owner' && cur.active && !(next.role === 'owner' && next.active) && owners === 0)
    return res.status(400).json({ error: '마지막 대표관리자는 끄거나 역할을 바꿀 수 없습니다.' });
  let pwHash = cur.pwHash;
  if ('password' in req.body) {
    if (String(req.body.password || '').length < MIN_PW) return res.status(400).json({ error: `비밀번호는 ${MIN_PW}자 이상이어야 합니다.` });
    pwHash = hashPw(req.body.password);
  }
  db.prepare('UPDATE admins SET name = ?, role = ?, active = ?, pwHash = ? WHERE id = ?').run(next.name, next.role, next.active, pwHash, id);
  if (!next.active || pwHash !== cur.pwHash) dropSessions(id); // 끄거나 비밀번호 초기화 = 그 사람 로그인 끊김
  res.json({ ok: true });
});

app.get('/api/admin/invite', need('people'), (req, res) => res.json(INVITE));

app.get('/api/admin/reservations', need('people'), (req, res) => {
  const { from, to, roomId, status } = req.query;
  const where = [], args = [];
  if (isDate(from)) { where.push('date >= ?'); args.push(from); }
  if (isDate(to))   { where.push('date <= ?'); args.push(to); }
  if (parseInt(roomId))         { where.push('roomId = ?'); args.push(parseInt(roomId)); }
  if (status)                   { where.push('status = ?'); args.push(status); }
  const sql = `SELECT * FROM reservations ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY date, startTime`;
  res.json(db.prepare(sql).all(...args));
});

app.get('/api/admin/members', need('people'), (req, res) => {
  const { q, status } = req.query;
  const where = [], args = [];
  if (q)      { where.push('(name LIKE ? OR phone LIKE ? OR band LIKE ? OR email LIKE ?)'); args.push(...Array(4).fill(`%${q}%`)); }
  if (status) { where.push('status = ?'); args.push(status); }
  const sql = `SELECT * FROM members ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY createdAt DESC`;
  res.json(db.prepare(sql).all(...args));
});

// 허용 컬럼만 골라 UPDATE. 예약은 시간 변경 시 충돌 재검사
function patchRoute(table, cols, statuses) {
  return (req, res) => {
    const id = parseInt(req.params.id);
    const cur = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    if (!cur) return res.status(404).json({ error: '없는 항목입니다.' });
    const next = { ...cur };
    for (const c of cols) if (c in req.body) next[c] = String(req.body[c] ?? '').trim();
    if (statuses && !statuses.includes(next.status)) return res.status(400).json({ error: '잘못된 상태값입니다.' });
    if ('phone' in req.body) { next.phone = normalizePhone(req.body.phone); if (!PHONE_RE.test(next.phone)) return res.status(400).json({ error: '올바른 전화번호 형식이 아닙니다.' }); }
    if (table === 'members') {
      next.leader = Number(next.leader) ? 1 : 0;
      next.teamId = parseInt(next.teamId) || null;
      if (next.teamId && !db.prepare('SELECT 1 FROM teams WHERE id = ?').get(next.teamId)) return res.status(400).json({ error: '없는 팀입니다.' });
    }
    if (table === 'teams' && !next.name) return res.status(400).json({ error: '팀 이름이 비었습니다.' });
    if (table === 'teams') next.hidden = Number(next.hidden) ? 1 : 0;
    if (table === 'events' && (!isDate(next.date) || !next.title)) return res.status(400).json({ error: '날짜와 제목은 필수입니다.' });
    if (table === 'reservations') {
      next.roomId = parseInt(next.roomId);
      if (!isDate(next.date) || !TIME_RE.test(next.startTime) || !TIME_RE.test(next.endTime) || next.startTime >= next.endTime)
        return res.status(400).json({ error: '날짜 또는 시간 형식이 올바르지 않습니다.' });
      if (next.status !== '취소' && hasConflict(next.roomId, next.date, next.startTime, next.endTime, id))
        return res.status(409).json({ error: '해당 시간대에 이미 예약이 있습니다.' });
    }
    try { db.prepare(`UPDATE ${table} SET ${cols.map(c => `${c} = ?`).join(', ')} WHERE id = ?`).run(...cols.map(c => next[c]), id); }
    catch (e) { if (e.errcode === 2067) return res.status(409).json({ error: '같은 값이 이미 있습니다.' }); throw e; } // SQLITE_CONSTRAINT_UNIQUE: 팀 이름·연락처
    res.json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id));
  };
}
// people 권한은 상태·메모(멤버는 팀·리더까지)만. 그 밖의 항목을 보내면 조용히 버리지 않고 403
function limitCols(full, light) {
  return (req, res, next) => {
    if (can(req.admin, 'people.full')) return next();
    const bad = Object.keys(req.body).filter(k => full.includes(k) && !light.includes(k));
    bad.length ? res.status(403).json({ error: `권한이 없는 항목: ${bad.join(', ')}` }) : next();
  };
}
const RESV_COLS = ['roomId', 'date', 'startTime', 'endTime', 'name', 'phone', 'status', 'memo'];
const MEMBER_COLS = ['name', 'email', 'phone', 'band', 'role', 'location', 'birth', 'genre', 'intro', 'leader', 'teamId', 'status', 'memo'];
app.patch('/api/admin/reservations/:id', need('people'), limitCols(RESV_COLS, ['status', 'memo']),
  patchRoute('reservations', RESV_COLS, RESV_STATUS));
app.patch('/api/admin/members/:id', need('people'), limitCols(MEMBER_COLS, ['status', 'memo', 'teamId', 'leader']),
  patchRoute('members', MEMBER_COLS, MEMBER_STATUS));
app.delete('/api/admin/reservations/:id', need('people.full'), (req, res) => {
  db.prepare('DELETE FROM reservations WHERE id = ?').run(parseInt(req.params.id)); res.json({ ok: true });
});
app.delete('/api/admin/members/:id', need('people.full'), (req, res) => {
  db.prepare('DELETE FROM members WHERE id = ?').run(parseInt(req.params.id)); res.json({ ok: true });
});

// 팀: 출연 이력은 따로 저장하지 않고 공연 라인업에서 셈(지난 공연·다음 공연). 연결된 멤버는 이름·리더 여부만
app.get('/api/admin/teams', need('events'), (req, res) => {
  const today = kstToday();
  const teams = db.prepare(`
    SELECT t.*, COUNT(e.id) AS shows,
      MAX(CASE WHEN e.date < ? THEN e.date END) AS last,
      MIN(CASE WHEN e.date >= ? THEN e.date END) AS next
    FROM teams t LEFT JOIN event_teams et ON et.teamId = t.id LEFT JOIN events e ON e.id = et.eventId
    GROUP BY t.id ORDER BY t.name`).all(today, today);
  const mems = db.prepare('SELECT id, name, leader, publicOk, teamId FROM members WHERE teamId IS NOT NULL ORDER BY leader DESC, name').all();
  const showMembers = can(req.admin, 'people'); // 공연 담당에겐 멤버 이름도 안 보냄
  for (const t of teams) t.members = showMembers ? mems.filter(m => m.teamId === t.id).map(({ id, name, leader, publicOk }) => ({ id, name, leader, publicOk })) : [];
  res.json(teams);
});
// 이름으로 팀 찾기, 없으면 만들기 → id
function teamIdByName(name) {
  db.prepare('INSERT OR IGNORE INTO teams (name) VALUES (?)').run(name);
  return db.prepare('SELECT id FROM teams WHERE name = ?').get(name).id;
}
app.post('/api/admin/teams', need('events'), (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 100);
  if (!name) return res.status(400).json({ error: '팀 이름이 비었습니다.' });
  if (db.prepare('SELECT 1 FROM teams WHERE name = ?').get(name)) return res.status(409).json({ error: '같은 이름의 팀이 있습니다.' });
  res.status(201).json({ id: teamIdByName(name) });
});
app.patch('/api/admin/teams/:id', need('events'), patchRoute('teams', ['name', 'memo', 'hidden']));
// 수정 링크 발급·재발급. 새로 만들면 예전 링크는 바로 안 먹음(팀원이 바뀌었거나 링크가 샜을 때)
app.post('/api/admin/teams/:id/key', need('events'), (req, res) => {
  const editKey = crypto.randomBytes(16).toString('hex');
  const r = db.prepare('UPDATE teams SET editKey = ? WHERE id = ?').run(editKey, parseInt(req.params.id));
  r.changes ? res.json({ editKey }) : res.status(404).json({ error: '없는 팀입니다.' });
});
app.delete('/api/admin/teams/:id', need('events'), (req, res) => {
  db.prepare('DELETE FROM teams WHERE id = ?').run(parseInt(req.params.id)); res.json({ ok: true });
});

app.post('/api/admin/events', need('events'), (req, res) => {
  const f = {};
  for (const k of ['date', 'time', 'title', 'place', 'note']) f[k] = String(req.body[k] || '').trim().slice(0, k === 'note' ? 500 : 100);
  if (!isDate(f.date) || !f.title) return res.status(400).json({ error: '날짜와 제목은 필수입니다.' });
  const r = db.prepare('INSERT INTO events (date, time, title, place, note) VALUES (?, ?, ?, ?, ?)').run(f.date, f.time, f.title, f.place, f.note);
  res.status(201).json({ id: Number(r.lastInsertRowid) });
});
app.patch('/api/admin/events/:id', need('events'), patchRoute('events', ['date', 'time', 'title', 'place', 'note']));
app.delete('/api/admin/events/:id', need('events'), (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(parseInt(req.params.id)); res.json({ ok: true });
});
// 라인업에 팀 추가. teamId 또는 name(없는 팀이면 새로 만듦 — 공지 보고 그대로 칠 수 있게)
app.post('/api/admin/events/:id/teams', need('events'), (req, res) => {
  const eventId = parseInt(req.params.id);
  if (!db.prepare('SELECT 1 FROM events WHERE id = ?').get(eventId)) return res.status(404).json({ error: '없는 공연입니다.' });
  const name = String(req.body.name || '').trim().slice(0, 100);
  const teamId = name ? teamIdByName(name) : parseInt(req.body.teamId);
  if (!db.prepare('SELECT 1 FROM teams WHERE id = ?').get(teamId)) return res.status(400).json({ error: '없는 팀입니다.' });
  db.prepare('INSERT OR IGNORE INTO event_teams (eventId, teamId) VALUES (?, ?)').run(eventId, teamId);
  res.status(201).json({ ok: true });
});
app.delete('/api/admin/events/:id/teams/:teamId', need('events'), (req, res) => {
  db.prepare('DELETE FROM event_teams WHERE eventId = ? AND teamId = ?').run(parseInt(req.params.id), parseInt(req.params.teamId));
  res.json({ ok: true });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ---------- 페이지 메타 (src/data/pages.json 한 곳. App.js pageTitle과 같은 규칙) ----------
// 첫 HTML에 페이지별 <title>·설명·og를 넣어 검색 결과·카톡 미리보기가 페이지마다 다르게. 본문은 여전히 JS가 그림
const PAGES = require('./src/data/pages.json');
const SITE = 'https://kband.co.kr';
const SUFFIX = ' — 음진인 협동조합';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function renderPage(tpl, key, p = PAGES[key]) {
  const title = !p ? '페이지를 찾을 수 없습니다' + SUFFIX : key === '/' ? p.title : p.title + SUFFIX;
  const desc = (p || PAGES['/']).desc;
  const links = Object.entries(PAGES).map(([k, v]) => `<a href="${k}">${esc(v.title)}</a>`).join(' · ');
  return tpl
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${SITE}${p ? key : '/'}`)
    .replace(/<noscript>[\s\S]*?<\/noscript>/,
      `<noscript><h1>${esc(title)}</h1><p>${esc(desc)}</p><p>전체 내용은 자바스크립트를 켜야 보입니다.</p><nav>${links}</nav></noscript>`);
}

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + [...Object.keys(PAGES), ...db.prepare(`SELECT id FROM teams WHERE hidden = 0 AND (intro != '' OR videos != '[]' OR links != '[]')`).all().map(t => `/teams/${t.id}`)]
      .map(k => `  <url><loc>${SITE}${k}</loc></url>`).join('\n') + '\n</urlset>\n');
});

// ---------- static (build/가 있을 때만) ----------
if (fs.existsSync(BUILD_DIR)) {
  const tpl = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8'); // 배포 때 재시작하므로 시작 시 한 번
  app.use(express.static(BUILD_DIR, { maxAge: '1h', index: false }));
  app.get('/{*splat}', (req, res) => {
    const key = req.path.replace(/\/+$/, '') || '/';
    if (key === '/admin' || key.startsWith('/admin/'))
      return res.set('X-Robots-Tag', 'noindex').type('html').send(tpl);
    if (key.startsWith('/team-edit/')) // 수정 링크 = 비밀 주소. 색인 금지
      return res.set('X-Robots-Tag', 'noindex').type('html').send(renderPage(tpl, key, { title: '팀 소개 수정', desc: '음진인 출연 팀 소개 수정' }));
    const tm = key.match(/^\/teams\/(\d+)$/);
    if (tm) { // 카톡·검색 미리보기에 팀 이름·소개
      const t = publicTeam(Number(tm[1]));
      const p = t && { title: t.name, desc: [t.genre, t.intro.replace(/\s+/g, ' ').slice(0, 100)].filter(Boolean).join(' · ') || '음진인 공연 출연 팀' };
      return res.status(t ? 200 : 404).type('html').send(renderPage(tpl, key, p));
    }
    // 목록에 없는 주소는 404 상태로(화면은 앱의 NotFound). 검색엔진이 없는 페이지를 색인하지 않게
    res.status(PAGES[key] ? 200 : 404).type('html').send(renderPage(tpl, key));
  });
}

app.listen(PORT, () => {
  console.log(`kband 서버 실행 중 → http://localhost:${PORT}  (db: ${DB_FILE}, static: ${fs.existsSync(BUILD_DIR) ? 'on' : 'off'})`);
});
