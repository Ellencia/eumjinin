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
`);
// 2026-10-18 추가 열. 기존 DB엔 ALTER로 (CREATE IF NOT EXISTS는 열을 안 늘림)
if (!db.prepare('PRAGMA table_info(members)').all().some(c => c.name === 'leader'))
  db.exec('ALTER TABLE members ADD COLUMN leader INTEGER NOT NULL DEFAULT 0');

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

// ponytail: 세션은 메모리 Map(토큰→마지막 요청 시각). 서버 재시작 = 전원 로그아웃, 관리자 한두 명이면 그걸로 충분
// 60분 동안 요청이 없으면 만료(안전성 확보조치 기준 제6조④: 일정 시간 업무 처리 없으면 접속 차단)
const IDLE_MS = 60 * 60 * 1000;
const sessions = new Map();
const COOKIE = 'kband_admin';
function getToken(req) {
  const m = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]+)`));
  return m ? m[1] : null;
}
function requireAdmin(req, res, next) {
  const token = getToken(req), last = sessions.get(token);
  if (last && Date.now() - last < IDLE_MS) { sessions.set(token, Date.now()); return next(); }
  sessions.delete(token);
  res.status(401).json({ error: '로그인이 필요합니다.' });
}
function safeEqual(a, b) {
  const h = s => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(a), h(b));
}

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
  const r = db.prepare(`INSERT INTO members (name, email, phone, band, role, location, birth, genre, intro, leader)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(f.name, f.email, phone, f.band, f.role, f.location, f.birth, f.genre, f.intro, leader);
  res.status(201).json({ success: true, id: Number(r.lastInsertRowid), band: INVITE.band }); // 완료 화면의 밴드 가입 링크(승인은 밴드에서)
  notify(`멤버 신청 #${r.lastInsertRowid} (역할: ${f.role || '미선택'}${leader ? ' · 밴드 리더' : ''})`);
});

// ---------- admin ----------
// 접속기록: 로그인 시도 포함 /api/admin 요청 전부. 점검은 README "관리자 접속기록"
app.use('/api/admin', (req, res, next) => {
  res.on('finish', () => db.prepare('INSERT INTO admin_log (ip, method, path, status) VALUES (?, ?, ?, ?)')
    .run(req.ip || '', req.method, req.originalUrl.slice(0, 500), res.statusCode));
  next();
});
app.post('/api/admin/login', rateLimit(10, 15 * 60 * 1000), (req, res) => {
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'ADMIN_PASSWORD가 설정되지 않았습니다.' });
  if (!safeEqual(req.body.password || '', ADMIN_PASSWORD)) return res.status(401).json({ error: '비밀번호가 틀렸습니다.' });
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now());
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: PROD, maxAge: 7 * 24 * 3600 * 1000 });
  res.json({ ok: true });
});
app.post('/api/admin/logout', (req, res) => {
  sessions.delete(getToken(req));
  res.clearCookie(COOKIE);
  res.json({ ok: true });
});
app.get('/api/admin/me', requireAdmin, (req, res) => res.json({ ok: true }));
app.get('/api/admin/invite', requireAdmin, (req, res) => res.json(INVITE));

app.get('/api/admin/reservations', requireAdmin, (req, res) => {
  const { from, to, roomId, status } = req.query;
  const where = [], args = [];
  if (isDate(from)) { where.push('date >= ?'); args.push(from); }
  if (isDate(to))   { where.push('date <= ?'); args.push(to); }
  if (parseInt(roomId))         { where.push('roomId = ?'); args.push(parseInt(roomId)); }
  if (status)                   { where.push('status = ?'); args.push(status); }
  const sql = `SELECT * FROM reservations ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY date, startTime`;
  res.json(db.prepare(sql).all(...args));
});

app.get('/api/admin/members', requireAdmin, (req, res) => {
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
    if (!statuses.includes(next.status)) return res.status(400).json({ error: '잘못된 상태값입니다.' });
    if ('phone' in req.body) { next.phone = normalizePhone(req.body.phone); if (!PHONE_RE.test(next.phone)) return res.status(400).json({ error: '올바른 전화번호 형식이 아닙니다.' }); }
    if (table === 'members') next.leader = Number(next.leader) ? 1 : 0;
    if (table === 'reservations') {
      next.roomId = parseInt(next.roomId);
      if (!isDate(next.date) || !TIME_RE.test(next.startTime) || !TIME_RE.test(next.endTime) || next.startTime >= next.endTime)
        return res.status(400).json({ error: '날짜 또는 시간 형식이 올바르지 않습니다.' });
      if (next.status !== '취소' && hasConflict(next.roomId, next.date, next.startTime, next.endTime, id))
        return res.status(409).json({ error: '해당 시간대에 이미 예약이 있습니다.' });
    }
    db.prepare(`UPDATE ${table} SET ${cols.map(c => `${c} = ?`).join(', ')} WHERE id = ?`).run(...cols.map(c => next[c]), id);
    res.json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id));
  };
}
app.patch('/api/admin/reservations/:id', requireAdmin,
  patchRoute('reservations', ['roomId', 'date', 'startTime', 'endTime', 'name', 'phone', 'status', 'memo'], RESV_STATUS));
app.patch('/api/admin/members/:id', requireAdmin,
  patchRoute('members', ['name', 'email', 'phone', 'band', 'role', 'location', 'birth', 'genre', 'intro', 'leader', 'status', 'memo'], MEMBER_STATUS));
app.delete('/api/admin/reservations/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM reservations WHERE id = ?').run(parseInt(req.params.id)); res.json({ ok: true });
});
app.delete('/api/admin/members/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM members WHERE id = ?').run(parseInt(req.params.id)); res.json({ ok: true });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ---------- 페이지 메타 (src/data/pages.json 한 곳. App.js pageTitle과 같은 규칙) ----------
// 첫 HTML에 페이지별 <title>·설명·og를 넣어 검색 결과·카톡 미리보기가 페이지마다 다르게. 본문은 여전히 JS가 그림
const PAGES = require('./src/data/pages.json');
const SITE = 'https://kband.co.kr';
const SUFFIX = ' — 음진인 협동조합';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function renderPage(tpl, key) {
  const p = PAGES[key];
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
    + Object.keys(PAGES).map(k => `  <url><loc>${SITE}${k}</loc></url>`).join('\n') + '\n</urlset>\n');
});

// ---------- static (build/가 있을 때만) ----------
if (fs.existsSync(BUILD_DIR)) {
  const tpl = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8'); // 배포 때 재시작하므로 시작 시 한 번
  app.use(express.static(BUILD_DIR, { maxAge: '1h', index: false }));
  app.get('/{*splat}', (req, res) => {
    const key = req.path.replace(/\/+$/, '') || '/';
    if (key === '/admin' || key.startsWith('/admin/'))
      return res.set('X-Robots-Tag', 'noindex').type('html').send(tpl);
    // 목록에 없는 주소는 404 상태로(화면은 앱의 NotFound). 검색엔진이 없는 페이지를 색인하지 않게
    res.status(PAGES[key] ? 200 : 404).type('html').send(renderPage(tpl, key));
  });
}

app.listen(PORT, () => {
  console.log(`kband 서버 실행 중 → http://localhost:${PORT}  (db: ${DB_FILE}, static: ${fs.existsSync(BUILD_DIR) ? 'on' : 'off'})`);
});
