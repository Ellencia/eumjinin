# kband (음진인) 홈페이지

React(CRA) 프론트 + Express 백엔드 한 프로세스. 데이터는 `data/kband.db`(SQLite, node:sqlite 내장) 하나.
Node 22.13 이상 필요.

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
| ADMIN_PASSWORD | (없음, 필수) | 관리자 로그인 비밀번호 |
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
- 관리자 접속기록 `admin_log`(로그인 시도 포함). 월 1회 점검:
  `ssh root@158.247.204.136 "sqlite3 /srv/kband/data/kband.db \"SELECT at, ip, method, path, status FROM admin_log WHERE at > datetime('now','-1 month') ORDER BY at\""`
- 전송량(월 한도 대비): 서버에 vnstat(2026-10-25 설치, 그 이후분만 집계). 월별은 `ssh root@158.247.204.136 vnstat -m`, 최근 30일 일별은 `vnstat -d`. tx가 방문자에게 나간 양. 공식 사용량·한도는 Vultr 콘솔 인스턴스 > Usage Graphs
- 글꼴은 `@fontsource/*`로 직접 호스팅(외부 호출 없음). 라이선스는 `public/third-party-licenses.txt`

## 백업

`data/kband.db` 파일 하나 복사하면 끝. 운영 중엔 `sqlite3 data/kband.db ".backup backup.db"`.
