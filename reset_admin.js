// 비상용 관리자 비밀번호 초기화. 대표관리자가 모두 비밀번호를 잊었을 때 서버에서 직접:
//   runuser -u kband -- node /srv/kband/reset_admin.js admin
// 임의 비밀번호를 만들어 한 번만 출력(셸 기록에 안 남게), 꺼진 계정이면 다시 켬. 아이디 없이 실행하면 계정 목록
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const file = process.env.DB_FILE || path.join(__dirname, 'data', 'kband.db');
// 경로가 틀리면 SQLite가 빈 DB를 새로 만들어 버리므로 먼저 확인
if (!require('fs').existsSync(file)) { console.log(`DB 없음: ${file}`); process.exit(1); }
const db = new DatabaseSync(file);
if (!db.prepare(`SELECT 1 FROM sqlite_master WHERE name = 'admins'`).get()) { console.log('admins 테이블 없음 — 새 server.js를 한 번 띄운 DB인지 확인'); process.exit(1); }
const username = process.argv[2];
const row = username && db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
if (!row) {
  console.log(username ? `없는 아이디: ${username}` : '사용법: node reset_admin.js <아이디>');
  for (const a of db.prepare('SELECT username, name, role, active FROM admins ORDER BY id').all())
    console.log(`  ${a.username}  ${a.name}  ${a.role}${a.active ? '' : '  (꺼짐)'}`);
  process.exit(1);
}
// server.js hashPw와 같은 형식("salt:hash" hex, scrypt 64바이트)
const pw = crypto.randomBytes(9).toString('base64url'); // 12자
const salt = crypto.randomBytes(16);
const hash = `${salt.toString('hex')}:${crypto.scryptSync(pw, salt, 64).toString('hex')}`;
db.prepare('UPDATE admins SET pwHash = ?, active = 1 WHERE id = ?').run(hash, row.id);
console.log(`${username} 새 비밀번호: ${pw}`);
console.log('로그인 뒤 계정 탭에서 바로 바꾸세요. 이미 로그인된 다른 세션까지 끊으려면: systemctl restart kband');
