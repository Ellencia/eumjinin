// 서버 스모크 테스트: node test_api.js  (임시 DB·임시 포트로 서버를 띄우고 전부 지움)
const { spawn } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kband-'));
const PORT = 30000 + Math.floor(Math.random() * 20000);
const BASE = `http://localhost:${PORT}`;
const PW = 'test-pw';

const srv = spawn(process.execPath, ['server.js'], {
  cwd: __dirname,
  env: { ...process.env, PORT, DB_FILE: path.join(tmp, 't.db'), ADMIN_PASSWORD: PW, NODE_ENV: '', ROOM_NAMES: '{"3":"A","4":"B"}' },
  stdio: ['ignore', 'pipe', 'inherit'],
});

let cookie = '';
async function req(method, p, body, auth = true) {
  const res = await fetch(BASE + p, {
    method, headers: { 'Content-Type': 'application/json', ...(auth && cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const sc = res.headers.get('set-cookie');
  if (sc) cookie = sc.split(';')[0];
  return { status: res.status, data: await res.json().catch(() => null) };
}

async function main() {
  await new Promise(r => srv.stdout.on('data', d => String(d).includes('실행 중') && r())); // 첫 계정 생성 로그가 먼저 나옴

  // 공개 예약
  let r = await req('POST', '/api/reservations', { roomId: 3, date: '2026-11-01', startTime: '20:00', endTime: '26:00', name: '테스트', phone: '01012345678', consent: true, age14: true });
  assert.equal(r.status, 201, '예약 생성');
  const resvId = r.data.id;
  r = await req('POST', '/api/reservations', { roomId: 3, date: '2026-11-01', startTime: '22:00', endTime: '23:00', name: '겹침', phone: '010-1111-2222', consent: true, age14: true });
  assert.equal(r.status, 409, '같은 날 겹침');
  r = await req('POST', '/api/reservations', { roomId: 3, date: '2026-11-02', startTime: '01:00', endTime: '03:00', name: '다음날', phone: '010-1111-2222', consent: true, age14: true });
  assert.equal(r.status, 409, '자정 넘긴 예약과 다음날 새벽 겹침');
  r = await req('POST', '/api/reservations', { roomId: 4, date: '2026-11-01', startTime: '22:00', endTime: '23:00', name: '다른방', phone: '010-1111-2222', consent: true, age14: true });
  assert.equal(r.status, 201, '다른 방은 OK');
  for (const roomId of [5, '__proto__', 'constructor'])
    assert.equal((await req('POST', '/api/reservations', { roomId, date: '2026-11-05', startTime: '10:00', endTime: '11:00', name: '없는방', phone: '010-1111-2222', consent: true, age14: true })).status, 400, `ROOM_NAMES에 없는 방 거부: ${roomId}`);
  r = await req('POST', '/api/reservations', { roomId: 3, date: '2026-11-01', startTime: '23:00', endTime: '22:00', name: 'x', phone: '010-1111-2222', consent: true, age14: true });
  assert.equal(r.status, 400, '시작>종료');
  r = await req('POST', '/api/reservations', { roomId: 4, date: '2026-11-03', startTime: '10:00', endTime: '11:00', name: '동의없음', phone: '010-1111-2222' });
  assert.equal(r.status, 400, '동의 없으면 400');
  r = await req('GET', '/api/reservations?roomId=3&date=2026-11-02');
  assert.equal(r.data.length, 1, '다음날 조회에 전날 자정 넘김 예약 포함');
  assert.ok(!('phone' in r.data[0]) && !('name' in r.data[0]), '공개 조회에 개인정보 없음');

  // 공개 멤버
  for (const name of ["''", 'ㅋㅋ', '123'])
    assert.equal((await req('POST', '/api/members', { name, email: 'a@gmail.com', phone: '010-7777-0000', consent: true, age14: true })).status, 400, `이름 거부: ${name}`);
  for (const email of ['2345@1.com', 'a@asdfqwer1234zz.com', 'abc'])
    assert.equal((await req('POST', '/api/members', { name: '홍길동', email, phone: '010-7777-0000', consent: true, age14: true })).status, 400, `이메일 거부: ${email}`);
  assert.equal((await req('GET', '/api/mx?domain=1.com')).data.ok, false, '1단계 MX 사전 확인: 메일 서버 없는 도메인');
  assert.equal((await req('GET', '/api/mx?domain=gmail.com')).data.ok, true, '1단계 MX 사전 확인: gmail');
  r = await req('POST', '/api/members', { name: '홍길동', email: 'a@gmail.com', phone: '010-9999-8888', band: '밴드', leader: true, consent: true, age14: true });
  assert.equal(r.status, 201, '멤버 생성');
  const memId = r.data.id;
  r = await req('POST', '/api/members', { name: "Mary O'Brien", email: 'm@naver.com', phone: '010-9999-7777', consent: true, age14: true });
  assert.equal(r.status, 201, '영문 이름·아포스트로피 허용');
  r = await req('POST', '/api/members', { name: '홍길순', email: 'a@gmail.com', phone: '01099998888', consent: true, age14: true });
  assert.equal(r.status, 409, '연락처 중복');

  // 만 14세 확인: 체크 없음·생년월일상 미만·형식 오류는 거부, 14번째 생일 당일은 허용
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  const ymd = (y, dayShift = 0) => { const d = new Date(kst); d.setUTCFullYear(d.getUTCFullYear() - y); d.setUTCDate(d.getUTCDate() + dayShift); return d.toISOString().slice(0, 10); };
  const kid = { name: '김아이', email: 'k@gmail.com', consent: true };
  assert.equal((await req('POST', '/api/members', { ...kid, phone: '010-5555-0001' })).status, 400, '14세 체크 없으면 400');
  assert.equal((await req('POST', '/api/members', { ...kid, phone: '010-5555-0002', age14: true, birth: ymd(14, 1) })).status, 400, '생년월일상 14세 하루 전 거부');
  assert.equal((await req('POST', '/api/members', { ...kid, phone: '010-5555-0003', age14: true, birth: '2010-02-30' })).status, 400, '생년월일 형식 오류 거부');
  assert.equal((await req('POST', '/api/members', { ...kid, phone: '010-5555-0004', age14: true, birth: ymd(14) })).status, 201, '14번째 생일 당일 허용');
  assert.equal((await req('POST', '/api/reservations', { roomId: 4, date: '2026-11-09', startTime: '10:00', endTime: '11:00', name: '김아이', phone: '010-5555-0005', consent: true })).status, 400, '예약도 14세 체크 필요');

  // 관리자 인증
  r = await req('GET', '/api/admin/reservations');
  assert.equal(r.status, 401, '비로그인 401');
  r = await req('POST', '/api/admin/login', { username: 'admin', password: 'wrong' });
  assert.equal(r.status, 401, '틀린 비밀번호');
  r = await req('POST', '/api/admin/login', { username: 'admin', password: PW });
  assert.equal(r.status, 200, '로그인');
  assert.ok(cookie.startsWith('kband_admin='), '쿠키 발급');

  // 관리자 조회·수정
  r = await req('GET', '/api/admin/reservations?from=2026-11-01&to=2026-11-30&roomId=3');
  assert.equal(r.data.length, 1, '필터 조회');
  assert.equal(r.data[0].phone, '010-1234-5678', '전화 정규화');
  r = await req('GET', '/api/admin/members?q=길동');
  assert.equal(r.data.length, 1, '멤버 검색');
  assert.equal(r.data[0].leader, 1, '리더 플래그 저장');
  r = await req('GET', '/api/admin/invite');
  assert.equal(r.status, 200); assert.ok('band' in r.data && 'chat' in r.data && 'chatCode' in r.data, '안내문 재료');
  r = await req('PATCH', `/api/admin/members/${memId}`, { status: '합류', memo: '드럼 가능', leader: 0 });
  assert.equal(r.data.status, '합류'); assert.equal(r.data.memo, '드럼 가능'); assert.equal(r.data.leader, 0, '리더 해제');
  r = await req('PATCH', `/api/admin/members/${memId}`, { status: '없는상태' });
  assert.equal(r.status, 400, '잘못된 상태 거부');
  // 팀·공연·라인업
  r = await req('POST', '/api/admin/teams', { name: '와락밴드' });
  assert.equal(r.status, 201, '팀 생성'); const teamId = r.data.id;
  assert.equal((await req('POST', '/api/admin/teams', { name: '와락밴드' })).status, 409, '팀 이름 중복');
  assert.equal((await req('POST', '/api/admin/events', { date: '2026-02-30', title: 'x' })).status, 400, '공연 날짜 검사');
  const past = (await req('POST', '/api/admin/events', { date: '2026-01-04', time: '15:00', title: '정기모임', place: 'Art Hall K' })).data.id;
  const future = (await req('POST', '/api/admin/events', { date: '2099-11-08', title: '정기모임' })).data.id;
  for (const ev of [past, future]) assert.equal((await req('POST', `/api/admin/events/${ev}/teams`, { teamId })).status, 201, '라인업에 팀');
  assert.equal((await req('POST', `/api/admin/events/${future}/teams`, { name: '청춘클럽' })).status, 201, '이름으로 넣으면 팀 자동 생성');
  r = await req('GET', '/api/events', null, false);
  assert.deepEqual(r.data.find(e => e.id === future).teams.map(t => t.name), ['와락밴드', '청춘클럽'], '공개 일정에 라인업(넣은 순서)');
  assert.equal((await req('PATCH', `/api/admin/members/${memId}`, { teamId: 9999 })).status, 400, '없는 팀 연결 거부');
  r = await req('PATCH', `/api/admin/members/${memId}`, { teamId: String(teamId) });
  assert.equal(r.data.teamId, teamId, '멤버를 팀에 연결');
  r = await req('GET', '/api/admin/teams');
  const t = r.data.find(x => x.id === teamId);
  assert.equal(t.shows, 2); assert.equal(t.last, '2026-01-04'); assert.equal(t.next, '2099-11-08', '팀 출연 이력은 라인업에서 셈');
  assert.deepEqual(t.members.map(m => m.name), ['홍길동'], '팀에 연결된 멤버');
  const other = r.data.find(x => x.name === '청춘클럽').id;
  assert.equal((await req('PATCH', `/api/admin/teams/${other}`, { name: '와락밴드' })).status, 409, '팀 이름을 겹치게 바꾸면 409');
  await req('DELETE', `/api/admin/teams/${teamId}`);
  r = await req('GET', '/api/events', null, false);
  assert.deepEqual(r.data.find(e => e.id === future).teams.map(t => t.name), ['청춘클럽'], '팀 삭제 시 라인업에서도 빠짐');
  r = await req('GET', '/api/admin/members?q=길동');
  assert.equal(r.data[0].teamId, null, '팀 삭제 시 멤버 연결 해제');
  await req('DELETE', `/api/admin/events/${future}`);
  assert.equal((await req('GET', '/api/events', null, false)).data.length, 1, '공연 삭제');

  r = await req('PATCH', `/api/admin/reservations/${resvId}`, { status: '취소' });
  assert.equal(r.data.status, '취소');
  r = await req('POST', '/api/reservations', { roomId: 3, date: '2026-11-01', startTime: '22:00', endTime: '23:00', name: '재시도', phone: '010-1111-2222', consent: true, age14: true });
  assert.equal(r.status, 201, '취소된 예약은 충돌 아님');
  r = await req('PATCH', `/api/admin/reservations/${resvId}`, { status: '확정' });
  assert.equal(r.status, 409, '취소→확정 복구 시 충돌 재검사');
  r = await req('DELETE', `/api/admin/reservations/${resvId}`);
  assert.equal(r.status, 200);
  r = await req('GET', '/api/admin/reservations?from=2026-11-01&to=2026-11-30&roomId=3');
  assert.equal(r.data.length, 1, '삭제 반영');

  // 운영진 계정·역할
  const me = (await req('GET', '/api/admin/me')).data;
  assert.equal(me.role, 'owner', 'ADMIN_PASSWORD로 첫 대표관리자 생성');
  const SPW = 'staff-pw-1234', EPW = 'event-pw-1234';
  assert.equal((await req('POST', '/api/admin/accounts', { username: 'staff1', name: '운영', role: 'staff', password: 'short' })).status, 400, '짧은 비밀번호 거부');
  assert.equal((await req('POST', '/api/admin/accounts', { username: 'staff1', name: '운영', role: 'nope', password: SPW })).status, 400, '없는 역할 거부');
  const staffId = (await req('POST', '/api/admin/accounts', { username: 'staff1', name: '운영', role: 'staff', password: SPW })).data.id;
  assert.equal((await req('POST', '/api/admin/accounts', { username: 'staff1', name: 'x', role: 'staff', password: SPW })).status, 409, '아이디 중복');
  await req('POST', '/api/admin/accounts', { username: 'event1', name: '공연', role: 'event', password: EPW });
  assert.equal((await req('PATCH', `/api/admin/accounts/${me.id}`, { role: 'staff' })).status, 400, '마지막 대표관리자 강등 금지');
  assert.equal((await req('PATCH', `/api/admin/accounts/${me.id}`, { active: false })).status, 400, '마지막 대표관리자 끄기 금지');
  const ownerCookie = cookie;

  assert.equal((await req('POST', '/api/admin/login', { username: 'staff1', password: SPW })).status, 200, '운영진 로그인');
  const staffCookie = cookie;
  assert.equal((await req('GET', '/api/admin/members')).status, 200, '운영진 멤버 열람');
  assert.equal((await req('PATCH', `/api/admin/members/${memId}`, { memo: '운영진 메모' })).data.memo, '운영진 메모', '운영진 메모 수정');
  assert.equal((await req('PATCH', `/api/admin/members/${memId}`, { memo: 'x', phone: '010-0000-0000' })).status, 403, '운영진 연락처 수정 금지');
  assert.equal((await req('DELETE', `/api/admin/members/${memId}`)).status, 403, '운영진 멤버 삭제 금지');
  assert.equal((await req('DELETE', `/api/admin/reservations/${resvId}`)).status, 403, '운영진 예약 삭제 금지');
  assert.equal((await req('GET', '/api/admin/accounts')).status, 403, '운영진 계정 관리 금지');
  assert.equal((await req('POST', '/api/admin/events', { date: '2099-12-06', title: '정기모임' })).status, 201, '운영진 공연 편집');

  assert.equal((await req('POST', '/api/admin/login', { username: 'event1', password: EPW })).status, 200, '공연 담당 로그인');
  for (const p of ['/api/admin/members', '/api/admin/reservations', '/api/admin/invite'])
    assert.equal((await req('GET', p)).status, 403, `공연 담당 개인정보 차단: ${p}`);
  await req('PATCH', `/api/admin/members/${memId}`, { teamId: other });
  r = await req('GET', '/api/admin/teams');
  assert.equal(r.status, 200); assert.ok(r.data.every(x => x.members.length === 0), '공연 담당에겐 팀 멤버 이름도 안 보냄');
  assert.equal((await req('POST', '/api/admin/teams', { name: '새팀' })).status, 201, '공연 담당 팀 추가');
  const eventCookie = cookie;

  cookie = ownerCookie;
  assert.equal((await req('GET', '/api/admin/teams')).data.find(x => x.id === other).members.length, 0, '공연 담당의 멤버 팀 변경은 403이었음');
  assert.equal((await req('PATCH', `/api/admin/accounts/${staffId}`, { active: false })).status, 200, '운영진 끄기');
  cookie = staffCookie;
  assert.equal((await req('GET', '/api/admin/members')).status, 401, '꺼진 계정은 즉시 로그아웃');
  assert.equal((await req('POST', '/api/admin/login', { username: 'staff1', password: SPW })).status, 401, '꺼진 계정 로그인 불가');
  cookie = ownerCookie;
  assert.equal((await req('POST', '/api/admin/me/password', { current: 'wrong', next: 'new-owner-pw-1' })).status, 400, '현재 비밀번호 확인');
  assert.equal((await req('POST', '/api/admin/me/password', { current: PW, next: 'new-owner-pw-1' })).status, 200, '비밀번호 변경');
  assert.equal((await req('GET', '/api/admin/me')).status, 200, '바꾼 창은 로그인 유지');
  cookie = eventCookie;
  assert.equal((await req('GET', '/api/admin/teams')).status, 200, '남의 비밀번호 변경은 다른 계정 세션에 영향 없음');
  cookie = ownerCookie;
  r = await req('POST', '/api/admin/logout');
  r = await req('GET', '/api/admin/me');
  assert.equal(r.status, 401, '로그아웃 후 401');

  // 페이지 HTML·sitemap
  const page = async p => { const x = await fetch(BASE + p); return { status: x.status, text: await x.text(), robots: x.headers.get('x-robots-tag'), pb: x.headers.get('x-powered-by') }; };
  let h = await page('/sitemap.xml');
  assert.ok(h.text.includes('<loc>https://kband.co.kr/about/history</loc>'), 'sitemap에 페이지 목록');
  if (fs.existsSync(path.join(__dirname, 'build'))) {
    h = await page('/about/history');
    assert.equal(h.status, 200);
    assert.ok(h.text.includes('<title>연혁 — 음진인 협동조합</title>'), '페이지별 title');
    assert.ok(h.text.includes('content="https://kband.co.kr/about/history"'), '페이지별 og:url');
    assert.equal(h.pb, null, 'X-Powered-By 숨김');
    assert.equal((await page('/about/history/')).status, 200, '끝 슬래시 허용');
    assert.equal((await page('/no-such-page')).status, 404, '없는 주소 404');
    assert.equal((await page('/spaces/1')).status, 404, '준비중 공간 404');
    assert.equal((await page('/admin')).robots, 'noindex', '관리자 화면 색인 금지');
  } else console.log('(build/ 없음 — 페이지 HTML 검사 건너뜀)');

  // 요청 제한
  for (let i = 0; i < 10; i++) await req('POST', '/api/admin/login', { password: 'x' }, false);
  r = await req('POST', '/api/admin/login', { password: 'x' }, false);
  assert.equal(r.status, 429, '로그인 10회 제한');

  // 관리자 접속기록
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(path.join(tmp, 't.db'));
  const logged = db.prepare(`SELECT status FROM admin_log WHERE path = '/api/admin/login'`).all().map(x => x.status);
  assert.ok(logged.includes(200) && logged.includes(401) && logged.includes(429), '로그인 성공·실패·제한이 접속기록에 남음');
  const who = db.prepare(`SELECT a.username FROM admin_log l JOIN admins a ON a.id = l.adminId WHERE l.method = 'DELETE' AND l.status = 403`).all().map(x => x.username);
  assert.ok(who.includes('staff1'), '접속기록에 누가(계정) 남음');

  // 보유기간 자동 파기(서버 시작 시 실행): 1년 지난 미합류 신청·예약은 지우고, 합류 멤버는 남김
  db.exec(`INSERT INTO members (name, email, phone, status, createdAt) VALUES ('옛신청','o@x.com','010-0000-0001','보류','2020-01-01T00:00:00.000Z'), ('옛합류','o@x.com','010-0000-0002','합류','2020-01-01T00:00:00.000Z');
           INSERT INTO reservations (roomId, date, startTime, endTime, name, phone) VALUES (3,'2020-01-01','10:00','11:00','옛예약','010-0000-0003');`);
  srv.kill();
  await new Promise(r => srv.once('exit', r));
  // 비상 초기화: 꺼 둔 staff1도 다시 켜지고 새 비밀번호로 로그인돼야 함
  const out = require('child_process').execFileSync(process.execPath, ['reset_admin.js', 'staff1'],
    { cwd: __dirname, env: { ...process.env, DB_FILE: path.join(tmp, 't.db') }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const newPw = out.match(/새 비밀번호: (\S+)/)[1];
  const srv2 = spawn(process.execPath, ['server.js'], { cwd: __dirname, env: { ...process.env, PORT, DB_FILE: path.join(tmp, 't.db'), ADMIN_PASSWORD: PW }, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise(r => srv2.stdout.on('data', d => String(d).includes('실행 중') && r()));
  assert.equal((await req('POST', '/api/admin/login', { username: 'staff1', password: newPw }, false)).status, 200, 'reset_admin.js 비상 초기화');
  srv2.kill();
  const names = db.prepare(`SELECT name FROM members WHERE name LIKE '옛%' UNION ALL SELECT name FROM reservations WHERE name LIKE '옛%'`).all().map(x => x.name);
  assert.deepEqual(names, ['옛합류'], '1년 지난 미합류 신청·예약 파기, 합류 멤버 유지');
  db.close();

  console.log('ALL OK');
}

main().catch(e => { console.error('FAIL:', e.message); process.exitCode = 1; })
  .finally(() => { srv.kill(); setTimeout(() => fs.rmSync(tmp, { recursive: true, force: true }), 200); });
