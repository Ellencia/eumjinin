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
`);

const RESV_STATUS = ['신청', '확정', '취소'];
const MEMBER_STATUS = ['신청', '연락함', '합류', '보류'];
const CONSENT_MSG = '개인정보 수집·이용 동의가 필요합니다.';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:00$/;

// ---------- helpers ----------
function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  return digits.length <= 7
    ? digits
    : `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}
const PHONE_RE = /^\d{2,3}-\d{3,4}-\d{4}$/;

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

// ponytail: 세션은 메모리 Set. 서버 재시작 = 전원 로그아웃, 관리자 한두 명이면 그걸로 충분
const sessions = new Set();
const COOKIE = 'kband_admin';
function getToken(req) {
  const m = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]+)`));
  return m ? m[1] : null;
}
function requireAdmin(req, res, next) {
  if (sessions.has(getToken(req))) return next();
  res.status(401).json({ error: '로그인이 필요합니다.' });
}
function safeEqual(a, b) {
  const h = s => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(a), h(b));
}

// ---------- app ----------
const app = express();
app.set('trust proxy', 1); // Caddy 뒤에서 req.ip가 실제 클라이언트가 되도록
app.use(express.json({ limit: '32kb' }));

// 특정 방·날짜의 예약 목록 (전날에서 자정 넘어온 예약 포함). 개인정보는 내보내지 않음
app.get('/api/reservations', (req, res) => {
  const roomId = parseInt(req.query.roomId);
  const { date } = req.query;
  if (!roomId || !DATE_RE.test(date || '')) return res.status(400).json({ error: '잘못된 요청입니다.' });
  const rows = db.prepare(`
    SELECT date, startTime, endTime FROM reservations
    WHERE roomId = ? AND status != '취소' AND (date = ? OR (date = ? AND CAST(endTime AS INTEGER) > 24))
  `).all(roomId, date, shiftDate(date, -1));
  res.json(rows);
});

app.post('/api/reservations', rateLimit(20, 60 * 60 * 1000), (req, res) => {
  const { roomId, date, startTime, endTime } = req.body;
  const name = String(req.body.name || '').trim();
  const phone = normalizePhone(req.body.phone);
  if (!roomId || !date || !startTime || !endTime || !name || !phone)
    return res.status(400).json({ error: '모든 항목을 입력해주세요.' });
  if (req.body.consent !== true) return res.status(400).json({ error: CONSENT_MSG });
  if (!DATE_RE.test(date) || !TIME_RE.test(startTime) || !TIME_RE.test(endTime) || startTime >= endTime)
    return res.status(400).json({ error: '날짜 또는 시간 형식이 올바르지 않습니다.' });
  if (!PHONE_RE.test(phone)) return res.status(400).json({ error: '올바른 전화번호 형식이 아닙니다.' });
  if (hasConflict(parseInt(roomId), date, startTime, endTime))
    return res.status(409).json({ error: '해당 시간대에 이미 예약이 있습니다.' });
  // 단일 프로세스·동기 DB라 검사와 삽입 사이에 끼어들 요청이 없음
  const r = db.prepare('INSERT INTO reservations (roomId, date, startTime, endTime, name, phone) VALUES (?, ?, ?, ?, ?, ?)')
    .run(parseInt(roomId), date, startTime, endTime, name, phone);
  res.status(201).json({ success: true, id: Number(r.lastInsertRowid) });
});

app.post('/api/members', rateLimit(10, 60 * 60 * 1000), (req, res) => {
  const f = {};
  for (const k of ['name', 'email', 'band', 'role', 'location', 'birth', 'genre', 'intro']) f[k] = String(req.body[k] || '').trim();
  const phone = normalizePhone(req.body.phone);
  if (!f.name || !f.email || !phone) return res.status(400).json({ error: '이름, 이메일, 연락처는 필수 항목입니다.' });
  if (req.body.consent !== true) return res.status(400).json({ error: CONSENT_MSG });
  if (!PHONE_RE.test(phone)) return res.status(400).json({ error: '올바른 전화번호 형식이 아닙니다.' });
  if (db.prepare('SELECT 1 FROM members WHERE phone = ?').get(phone))
    return res.status(409).json({ error: '이미 같은 연락처로 신청된 내역이 있습니다.' });
  const r = db.prepare(`INSERT INTO members (name, email, phone, band, role, location, birth, genre, intro)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(f.name, f.email, phone, f.band, f.role, f.location, f.birth, f.genre, f.intro);
  res.status(201).json({ success: true, id: Number(r.lastInsertRowid) });
});

// ---------- admin ----------
app.post('/api/admin/login', rateLimit(10, 15 * 60 * 1000), (req, res) => {
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'ADMIN_PASSWORD가 설정되지 않았습니다.' });
  if (!safeEqual(req.body.password || '', ADMIN_PASSWORD)) return res.status(401).json({ error: '비밀번호가 틀렸습니다.' });
  const token = crypto.randomBytes(32).toString('hex');
  sessions.add(token);
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: PROD, maxAge: 7 * 24 * 3600 * 1000 });
  res.json({ ok: true });
});
app.post('/api/admin/logout', (req, res) => {
  sessions.delete(getToken(req));
  res.clearCookie(COOKIE);
  res.json({ ok: true });
});
app.get('/api/admin/me', requireAdmin, (req, res) => res.json({ ok: true }));

app.get('/api/admin/reservations', requireAdmin, (req, res) => {
  const { from, to, roomId, status } = req.query;
  const where = [], args = [];
  if (DATE_RE.test(from || '')) { where.push('date >= ?'); args.push(from); }
  if (DATE_RE.test(to || ''))   { where.push('date <= ?'); args.push(to); }
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
    if (table === 'reservations') {
      next.roomId = parseInt(next.roomId);
      if (!DATE_RE.test(next.date) || !TIME_RE.test(next.startTime) || !TIME_RE.test(next.endTime) || next.startTime >= next.endTime)
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
  patchRoute('members', ['name', 'email', 'phone', 'band', 'role', 'location', 'birth', 'genre', 'intro', 'status', 'memo'], MEMBER_STATUS));
app.delete('/api/admin/reservations/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM reservations WHERE id = ?').run(parseInt(req.params.id)); res.json({ ok: true });
});
app.delete('/api/admin/members/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM members WHERE id = ?').run(parseInt(req.params.id)); res.json({ ok: true });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ---------- static (build/가 있을 때만) ----------
if (fs.existsSync(BUILD_DIR)) {
  app.use(express.static(BUILD_DIR, { maxAge: '1h', index: false }));
  app.get('/{*splat}', (req, res) => res.sendFile(path.join(BUILD_DIR, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`kband 서버 실행 중 → http://localhost:${PORT}  (db: ${DB_FILE}, static: ${fs.existsSync(BUILD_DIR) ? 'on' : 'off'})`);
});
