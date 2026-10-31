# kband (음진인) 홈페이지

React(CRA) 프론트 + Express 백엔드 한 프로세스. 데이터는 `data/kband.db`(SQLite, node:sqlite 내장) 하나.
Node 22.13 이상 필요.

## 상태

**어디까지 됐나** (회차 없음, 기능 단위. origin/master = 37e21e2, 로컬에 teamId 자동 채움 미커밋)

| 기능 | 마지막 커밋 | 서버 스모크 시험 |
| --- | --- | --- |
| 소속은 `members.teamId` 하나로: 신청 때 "소속 밴드" = 팀 이름(공백·대소문자 무시)이면 teamId 즉시 채움 + 서버 기동마다 미연결 멤버 역채움(팀이 나중에 생겨도 다음 기동에 붙음). 공개 페이지 쿼리의 이름 비교 삭제. 계기: 운영 /admin 팀 탭이 이름 일치 멤버를 안 보여줬음(8885b03은 공개 페이지만 자동 매칭) | 미커밋 (10-31) | test_api.js 포함(기동 역채움은 별도 스크립트로 1회 확인) |
| 커뮤니티 > "소속 팀" 탭(/community/teams, 공사 중 안내만, 팀 목록 없음) + 팀 페이지 멤버 표시 상시 가동: `TEAM_MEMBERS_PUBLIC` 플래그 삭제, 동의 멤버(`publicOk=1`)를 관리자 연결(teamId) **또는** 신청서 "소속 밴드" 글자가 팀 이름과 같으면 자동 표시. 처리방침 1절 "현재는 표시 기능을 운영하지 않으며" 삭제(10-31판 시행 전이라 PREVIOUS 추가 없음) | 8885b03 (10-31) | test_api.js 포함 |
| 팀 링크 칸(유튜브 채널·인스타그램 주소 4개까지, 허용 호스트만, 이름 옆 브랜드색 아이콘) + 팀 페이지 순서 영상→소개 + 관리자 팀 탭 버튼 격자 정렬(폰은 줄바꿈) | 221f771 (10-31) | test_api.js 포함 |
| 멤버 소개 허용 + 공개 선택 동의: 팀 소개글에 활동명·역할 허용(안내문), 신청서에 "[선택] 팀 소개 페이지 공개 동의"(`members.publicOk`, 관리자 팀 탭 ☆), 처리방침 10-31 개정(1·3·11절, 10-30판은 PREVIOUS) | 221f771 (10-31) | test_api.js 포함 |
| 관리자 표 정리(멤버 17칸→12칸 묶음, 넓힐 칸 `adm-grow`, 헤더에 이름·역할, 로그인 카드) | 92c398d (10-31) | 없음(화면) |
| 팀 소개 페이지(공개 /teams/:id, 로그인 없는 수정 링크 /team-edit/:key, 관리자 숨김·재발급) | 305e7ad (10-31) | test_api.js 포함 |
| 운영진 계정(역할 3단계)·처리방침 6·11절 개정 | e4055b3 (10-30) | test_api.js 포함 |
| 비상 초기화 `reset_admin.js` | 2f79cd8 (10-30) | test_api.js 포함 |
| 관리자 화면 폰 대응(720px 이하 카드) | b710878 (10-26) | 없음(화면) |
| 팀·공연 일정(/admin 탭 + 공개 /schedule) | 7bee8cb (10-25) | test_api.js 포함 |

`node test_api.js` → `ALL OK` (8885b03에서 10-31 재실행). 로컬 `build/index.html`(23:10)이 `src/` 마지막 수정(23:09)보다 새로움, `CI=true npm run build` "Compiled successfully"(10-31). 서버는 `deploy.sh`가 git pull 후 다시 빌드하므로 로컬 build는 배포와 무관.
운영 서버: 8885b03까지 배포 완료, /admin 팀 탭·/team-edit·/teams/:id·커뮤니티 > 소속 팀 사용자가 열어봄(10-31). 운영 DB 팀 32·공연 16·라인업 32는 10-30 조회값. `links` 열은 서버 기동 때 `ALTER TABLE`로 자동 추가됨.
신청서 선택 동의 체크, 처리방침 개정 화면, /community/teams 화면은 10-31 사용자가 직접 보고 이상 없음.
처리방침 시행일을 10-31로 적었음. 배포가 다음 날로 넘어가면 `Privacy.js` 11절 날짜와 PREVIOUS 기간을 배포일에 맞출 것.
기존 멤버의 `publicOk`는 전부 0(동의 안 받음)이라 팀 페이지에 안 뜸. 뜨게 하려면 본인 동의를 받고 DB에서 1로 바꾸는 수밖에 없음(관리자 화면에 publicOk 토글 없음, 필요해지면 대표관리자 전용으로). 신청자가 이름 칸에 닉네임을 적어도 그대로 표시됨(동의문에 "위에 적은 이름(활동명)").
팀 페이지 멤버 조건: publicOk=1 **그리고** teamId = 그 팀. teamId는 관리자가 멤버 탭 "팀" 칸에서 연결하거나, 신청 때 "소속 밴드" = 팀 이름이면 자동(기동 때 역채움 포함). 자동과 수동은 구분 안 됨. 팀 이름이 뒤에 바뀌어도 teamId는 그대로(설계). 10-31 운영에서 사용자가 "천기누설" 본인 신청을 /admin에서 수동 연결했음 → 이 수정 배포 뒤엔 그런 수동 작업 불필요. 소속 팀 탭은 자리만 잡음(팀 목록 API 없음): 열 때 `GET /api/teams` 추가 후 `InfoPage.js` `/community/teams` 항목을 목록 페이지로 교체.

**다음**
1. teamId 자동 채움 커밋·배포 → 운영 /admin 팀 탭에서 신청서 밴드 이름이 팀 이름과 같은 기존 멤버가 기동 역채움으로 붙었는지 확인
2. 운영진 계정 발급, 대표관리자 1명 더 두기(관리자 화면 계정 탭)
3. 미정: 팀들에게 수정 링크 돌릴 시점, 그다음 개발 작업

**하면 안 되는 것**
- 처리방침과 맞물린 동작(파기 기간·세션 60분·역할·접속기록)을 `Privacy.js` 수정 없이 바꾸기. 이전 방침은 `PREVIOUS`에 남긴다
- 운영진 계정 삭제(끄기만 함), 마지막 대표관리자 끄기
- 팀 수정 화면에 장르·소개·유튜브 영상·유튜브/인스타 링크 말고 칸 추가, 또는 소개글에 연락처·주소·개인 계정 허용: 처리방침 1절 "팀 소개 페이지" 항목과 어긋남. 멤버 활동명·역할까지는 10-31 개정으로 허용됨. 링크 칸의 허용 호스트(`LINK_HOSTS`)를 늘리는 것도 신중히(팀 공개 계정이라는 전제)
- 신청서 데이터(이름·역할)를 `publicOk=0`인 멤버까지 팀 페이지에 표시: 처리방침 1절은 "동의한 분만"이라고 약속함. 이름·역할 말고 다른 칸(연락처·거주지 등)을 공개 API에 내보내는 것도 금지
- `ROOM_NAMES`를 `src/data/spaces.js`와 다르게 두기, 운영에서 HTTPS 없이 `NODE_ENV=production`
- 서버에서 직접 코드 수정: `deploy.sh`는 `git pull --ff-only`라 깨짐. 커밋·푸시 후 배포
- 멤버 표 칸 순서·개수를 바꾸면서 빈 행 `colSpan`(12)과 `admin.css`의 `st-합류 td:nth-child(2) .adm-title`(이름=2번째 칸)을 그대로 두기

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
