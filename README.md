# kband (음진인) 홈페이지

React(CRA) 프론트 + Express 백엔드 한 프로세스. 데이터는 `data/kband.db`(SQLite, node:sqlite 내장) 하나.
Node 22.13 이상 필요.

## 상태

**어디까지 됐나** (회차 없음, 기능 단위. 작업 트리 깨끗, HEAD 4b62fff = origin/master)

| 기능 | 마지막 커밋 | 시험 |
| --- | --- | --- |
| 멤버 소속은 `members.teamId` 하나로: 신청 때 "소속 밴드" = 팀 이름(공백·대소문자 무시)이면 자동 연결 + 서버 기동마다 미연결 멤버 역채움, 공개 팀 페이지 = `publicOk=1 AND teamId` | 6e9bdfc (10-31) | test_api.js(기동 역채움 자체는 시험 없음) |
| 커뮤니티 "소속 팀" 탭(/community/teams, 공사 중 안내만) + 팀 페이지 멤버 표시 상시 가동(플래그 삭제) | 8885b03 (10-31) | test_api.js |
| 팀 링크 칸(`LINK_HOSTS` 유튜브·인스타만)·영상→소개 순서·멤버 공개 선택 동의(`publicOk`)·처리방침 10-31판 | 221f771 (10-31) | test_api.js |
| 관리자 표 정리(멤버 12칸)·팀 소개 페이지(/teams/:id, /team-edit/:key) | 92c398d·305e7ad (10-31) | 화면은 시험 없음 / test_api.js |
| 운영진 계정 역할 3단계·`reset_admin.js`·폰 대응·팀·공연 일정 | e4055b3·2f79cd8 (10-30), b710878 (10-26), 7bee8cb (10-25) | test_api.js |

`node test_api.js` → `ALL OK` (4b62fff, 10-31 기록가 재실행). `build/`는 git 제외, `build/index.html`(10-31 23:10)이 `src/` 마지막 커밋 8885b03(23:13)보다 앞섬(파일 수정 시각으로는 더 새로운 src 파일 없음). 운영은 `deploy/deploy.sh`가 pull 후 다시 빌드하므로 로컬 build와 무관.
운영 서버: 6e9bdfc까지 배포 완료, /admin 팀 탭·/team-edit·/teams/:id·커뮤니티 > 소속 팀 화면과 기동 역채움 결과를 사용자가 직접 확인(10-31, 대화에서 답함).
기존 멤버 `publicOk`는 전부 0(10-31 사용자 답, DB는 git 밖). 뜨게 하려면 본인 동의 뒤 DB에서 1로. 관리자 화면에 `publicOk` 토글 없음.
소속 팀 탭은 자리만 있음: 공개 팀 목록 API 없음(`server.js`엔 `GET /api/teams/:id`만).

**다음**
1. 운영진 계정 발급, 대표관리자 1명 더 두기(관리자 화면 계정 탭)
2. 소속 팀 탭을 열 때 `GET /api/teams` 추가 후 `InfoPage.js` `/community/teams` 항목을 목록 페이지로 교체(시점 미정)

**하면 안 되는 것**
- 처리방침과 맞물린 동작(파기 기간·세션 60분·역할·접속기록·팀 소개 페이지 항목)을 `Privacy.js` 수정 없이 바꾸기. 이전 방침은 `PREVIOUS`로 옮긴다
- `publicOk=0` 멤버를 팀 페이지에 표시하거나, 이름·역할 말고 다른 칸을 공개 API에 내보내기. 팀 수정 화면에 연락처·주소 칸 추가, `LINK_HOSTS` 함부로 늘리기
- 운영진 계정 삭제(끄기만 함), 마지막 대표관리자 끄기. `ROOM_NAMES`를 `src/data/spaces.js`와 다르게, HTTPS 없이 `NODE_ENV=production`
- 서버에서 직접 코드 수정(`deploy.sh`가 `git pull --ff-only`라 깨짐). 멤버 표 칸을 바꾸면서 빈 행 `colSpan={12}`·`admin.css` `st-합류 td:nth-child(2)`를 그대로 두기

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
