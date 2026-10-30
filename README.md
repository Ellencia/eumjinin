# kband (음진인) 홈페이지

React(CRA) 프론트 + Express 백엔드 한 프로세스. 데이터는 `data/kband.db`(SQLite, node:sqlite 내장) 하나.
Node 22.13 이상 필요.

## 상태

**어디까지 됐나** (회차 없음, 기능 단위. 작업 트리 깨끗, master = origin/master)

| 기능 | 마지막 커밋 | 서버 스모크 시험 |
| --- | --- | --- |
| 운영진 계정(역할 3단계)·처리방침 6·11절 개정 | e4055b3 (10-30) | test_api.js 포함 |
| 비상 초기화 `reset_admin.js` | 2f79cd8 (10-30) | test_api.js 포함 |
| 관리자 화면 폰 대응(720px 이하 카드) | b710878 (10-26) | 없음(화면) |
| 팀·공연 일정(/admin 탭 + 공개 /schedule) | 7bee8cb (10-25) | test_api.js 포함 |

`node test_api.js` → `ALL OK` (10-30 실행). 로컬 `build/`(10-30 22:45)는 프론트 소스 최종 수정(Admin.js 22:39)보다 새것이지만, 서버는 `deploy.sh`가 git pull 후 다시 빌드하므로 로컬 build는 배포와 무관.
운영 서버: 2f79cd8까지 배포(10-30 서버 `git log -1`). 운영 DB 팀 32·공연 16·라인업 32(10-30 sqlite3 조회, 10-26 시드).

**다음**
1. 운영진 계정 발급, 대표관리자 1명 더 두기(관리자 화면 계정 탭)
2. 미확인: 그다음 개발 작업

**하면 안 되는 것**
- 처리방침과 맞물린 동작(파기 기간·세션 60분·역할·접속기록)을 `Privacy.js` 수정 없이 바꾸기. 이전 방침은 `PREVIOUS`에 남긴다
- 운영진 계정 삭제(끄기만 함), 마지막 대표관리자 끄기
- `ROOM_NAMES`를 `src/data/spaces.js`와 다르게 두기, 운영에서 HTTPS 없이 `NODE_ENV=production`
- 서버에서 직접 코드 수정: `deploy.sh`는 `git pull --ff-only`라 깨짐. 커밋·푸시 후 배포

## 로컬 개발

```bash
npm install
echo ADMIN_PASSWORD=원하는비밀번호 > .env     # .env는 git 제외
npm run server      # API  → http://localhost:8703
npm start           # 프론트 → http://localhost:3000 (/api 는 8703으로 프록시)
```

## 운영 (build/ 가 있으면 서버가 정적 파일도 서빙)

```bash
npm run build
NODE_ENV=production npm run server     # 8703 하나로 사이트 + API + /admin
```

앞에 Caddy 등으로 HTTPS 붙이기. `NODE_ENV=production`이면 관리자 쿠키가 Secure로 설정되므로 HTTPS 없이는 로그인이 안 됨.

## 경로

- `/` 공개 사이트, `/admin` 관리자(예약·멤버 신청 목록, 상태·메모, 삭제)
- `POST /api/reservations`, `POST /api/members` 공개 신청 (IP당 시간당 20·30회 제한)
- `/api/admin/*` 쿠키 세션. 서버 재시작 시 전원 로그아웃

## 환경 변수 (.env)

| 이름 | 기본값 | 설명 |
| --- | --- | --- |
| ADMIN_PASSWORD | (없음) | 운영진 계정이 하나도 없을 때만 첫 대표관리자 `admin`의 비밀번호로 씀. 그 뒤엔 안 읽음 → 로그인해서 비밀번호 바꾸고 지워도 됨 |
| PORT | 8703 | |
| DB_FILE | ./data/kband.db | |
| NODE_ENV | | production이면 Secure 쿠키 |
| TELEGRAM_BOT_TOKEN | (없음) | 둘 다 있으면 신규 예약·멤버 신청 시 텔레그램 알림. 개인정보는 보내지 않음 |
| TELEGRAM_CHAT_ID | (없음) | 알림 받을 채팅 id |
| BAND_INVITE_URL | (없음) | 네이버 밴드 초대 링크. /admin 멤버 신청의 "복사" 안내문에 들어감 |
| KAKAO_OPEN_URL | (없음) | 밴드 리더 오픈채팅 링크. 신청자가 "밴드 리더" 체크했을 때만 안내문에 추가 |
| KAKAO_OPEN_CODE | (없음) | 오픈채팅 참여코드 |
| ROOM_NAMES | `{}` | 예약 받는 연습실 `{"3":"연습실 A"}` (JSON 한 줄, src/data/spaces.js와 맞출 것). 비어 있으면 공개 예약 API가 전부 400 |

합류 안내는 사이트가 보내지 않는다. 관리자가 /admin에서 "복사"를 눌러 문자·카톡으로 직접 보낸다(신청자 연락처가 외부 서비스에 남지 않게).

텔레그램 설정: @BotFather에서 `/newbot` → 토큰. 그 봇에게 아무 메시지나 보낸 뒤 `https://api.telegram.org/bot<토큰>/getUpdates`의 `message.chat.id`가 채팅 id. 서버 `/srv/kband/.env`에 두 줄 추가 후 `systemctl restart kband`.

공개 POST(`/api/members`, `/api/reservations`)는 `consent: true`와 `age14: true`(만 14세 이상 체크)가 없으면 400. 멤버 신청은 생년월일이 만 14세 미만이어도 400.

## 개인정보처리방침과 맞물린 동작

`src/pages/Privacy.js` 문구는 아래 동작을 그대로 적은 것. 하나를 바꾸면 방침도 고치고, 이전 방침은 `PREVIOUS`에 적용 기간과 함께 남긴다.

- 자동 파기(서버 시작 시 + 매일): 합류 아닌 멤버 신청은 접수 1년, 예약은 이용일 1년, 관리자 접속기록은 2년 지나면 삭제. `PRAGMA secure_delete`로 지운 자리를 덮어씀
- 관리자 세션: 60분 요청이 없으면 만료
- 운영진 계정(`admins`, /admin "계정" 탭): 역할 3단계 — 대표관리자(전부), 운영진(공연 편집 + 멤버·예약 열람, 상태·메모·팀·리더만 수정, 삭제 불가), 공연 담당(팀·공연만, 개인정보 못 봄). 역할 정의는 `server.js` `ROLES`. 계정은 지우지 않고 끔(끄면 즉시 로그아웃). 운영진 비밀번호 분실 = 대표관리자가 계정 탭에서 초기화. 대표관리자가 모두 잊었으면 서버에서 `runuser -u kband -- node /srv/kband/reset_admin.js <아이디>`(임의 비밀번호 출력, 꺼진 계정은 다시 켬, 아이디 없이 실행하면 목록)
- 관리자 접속기록 `admin_log`(로그인 시도 포함, `adminId` = 누가. 2026-10-30 이전 기록은 NULL). 월 1회 점검:
  `ssh root@158.247.204.136 "sqlite3 /srv/kband/data/kband.db \"SELECT l.at, a.username, l.ip, l.method, l.path, l.status FROM admin_log l LEFT JOIN admins a ON a.id = l.adminId WHERE l.at > datetime('now','-1 month') ORDER BY l.at\""`
- 전송량(월 한도 대비): 서버에 vnstat(2026-10-25 설치, 그 이후분만 집계). 월별은 `ssh root@158.247.204.136 vnstat -m`, 최근 30일 일별은 `vnstat -d`. tx가 방문자에게 나간 양. 공식 사용량·한도는 Vultr 콘솔 인스턴스 > Usage Graphs
- 글꼴은 `@fontsource/*`로 직접 호스팅(외부 호출 없음). 라이선스는 `public/third-party-licenses.txt`

## 백업

`data/kband.db` 파일 하나 복사하면 끝. 운영 중엔 `sqlite3 data/kband.db ".backup backup.db"`.
