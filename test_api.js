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
  env: { ...process.env, PORT, DB_FILE: path.join(tmp, 't.db'), ADMIN_PASSWORD: PW, NODE_ENV: '' },
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
  await new Promise(r => srv.stdout.once('data', r));

  // 공개 예약
  let r = await req('POST', '/api/reservations', { roomId: 3, date: '2026-11-01', startTime: '20:00', endTime: '26:00', name: '테스트', phone: '01012345678', consent: true });
  assert.equal(r.status, 201, '예약 생성');
  const resvId = r.data.id;
  r = await req('POST', '/api/reservations', { roomId: 3, date: '2026-11-01', startTime: '22:00', endTime: '23:00', name: '겹침', phone: '010-1111-2222', consent: true });
  assert.equal(r.status, 409, '같은 날 겹침');
  r = await req('POST', '/api/reservations', { roomId: 3, date: '2026-11-02', startTime: '01:00', endTime: '03:00', name: '다음날', phone: '010-1111-2222', consent: true });
  assert.equal(r.status, 409, '자정 넘긴 예약과 다음날 새벽 겹침');
  r = await req('POST', '/api/reservations', { roomId: 4, date: '2026-11-01', startTime: '22:00', endTime: '23:00', name: '다른방', phone: '010-1111-2222', consent: true });
  assert.equal(r.status, 201, '다른 방은 OK');
  r = await req('POST', '/api/reservations', { roomId: 3, date: '2026-11-01', startTime: '23:00', endTime: '22:00', name: 'x', phone: '010-1111-2222', consent: true });
  assert.equal(r.status, 400, '시작>종료');
  r = await req('POST', '/api/reservations', { roomId: 4, date: '2026-11-03', startTime: '10:00', endTime: '11:00', name: '동의없음', phone: '010-1111-2222' });
  assert.equal(r.status, 400, '동의 없으면 400');
  r = await req('GET', '/api/reservations?roomId=3&date=2026-11-02');
  assert.equal(r.data.length, 1, '다음날 조회에 전날 자정 넘김 예약 포함');
  assert.ok(!('phone' in r.data[0]) && !('name' in r.data[0]), '공개 조회에 개인정보 없음');

  // 공개 멤버
  // 멤버 신청은 IP당 시간당 10회 → 아래 합계 9회로 맞춤
  for (const name of ["''", 'ㅋㅋ', '123'])
    assert.equal((await req('POST', '/api/members', { name, email: 'a@gmail.com', phone: '010-7777-0000', consent: true })).status, 400, `이름 거부: ${name}`);
  for (const email of ['2345@1.com', 'a@asdfqwer1234zz.com', 'abc'])
    assert.equal((await req('POST', '/api/members', { name: '홍길동', email, phone: '010-7777-0000', consent: true })).status, 400, `이메일 거부: ${email}`);
  r = await req('POST', '/api/members', { name: '홍길동', email: 'a@gmail.com', phone: '010-9999-8888', band: '밴드', leader: true, consent: true });
  assert.equal(r.status, 201, '멤버 생성');
  const memId = r.data.id;
  r = await req('POST', '/api/members', { name: "Mary O'Brien", email: 'm@naver.com', phone: '010-9999-7777', consent: true });
  assert.equal(r.status, 201, '영문 이름·아포스트로피 허용');
  r = await req('POST', '/api/members', { name: '홍길순', email: 'a@gmail.com', phone: '01099998888', consent: true });
  assert.equal(r.status, 409, '연락처 중복');

  // 관리자 인증
  r = await req('GET', '/api/admin/reservations');
  assert.equal(r.status, 401, '비로그인 401');
  r = await req('POST', '/api/admin/login', { password: 'wrong' });
  assert.equal(r.status, 401, '틀린 비밀번호');
  r = await req('POST', '/api/admin/login', { password: PW });
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
  r = await req('PATCH', `/api/admin/reservations/${resvId}`, { status: '취소' });
  assert.equal(r.data.status, '취소');
  r = await req('POST', '/api/reservations', { roomId: 3, date: '2026-11-01', startTime: '22:00', endTime: '23:00', name: '재시도', phone: '010-1111-2222', consent: true });
  assert.equal(r.status, 201, '취소된 예약은 충돌 아님');
  r = await req('PATCH', `/api/admin/reservations/${resvId}`, { status: '확정' });
  assert.equal(r.status, 409, '취소→확정 복구 시 충돌 재검사');
  r = await req('DELETE', `/api/admin/reservations/${resvId}`);
  assert.equal(r.status, 200);
  r = await req('GET', '/api/admin/reservations?from=2026-11-01&to=2026-11-30&roomId=3');
  assert.equal(r.data.length, 1, '삭제 반영');
  r = await req('POST', '/api/admin/logout');
  r = await req('GET', '/api/admin/me');
  assert.equal(r.status, 401, '로그아웃 후 401');

  // 요청 제한
  for (let i = 0; i < 10; i++) await req('POST', '/api/admin/login', { password: 'x' }, false);
  r = await req('POST', '/api/admin/login', { password: 'x' }, false);
  assert.equal(r.status, 429, '로그인 10회 제한');

  console.log('ALL OK');
}

main().catch(e => { console.error('FAIL:', e.message); process.exitCode = 1; })
  .finally(() => { srv.kill(); setTimeout(() => fs.rmSync(tmp, { recursive: true, force: true }), 200); });
