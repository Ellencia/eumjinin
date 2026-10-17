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
- `POST /api/reservations`, `POST /api/members` 공개 신청 (IP당 시간당 20·10회 제한)
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

텔레그램 설정: @BotFather에서 `/newbot` → 토큰. 그 봇에게 아무 메시지나 보낸 뒤 `https://api.telegram.org/bot<토큰>/getUpdates`의 `message.chat.id`가 채팅 id. 서버 `/srv/kband/.env`에 두 줄 추가 후 `systemctl restart kband`.

공개 POST(`/api/members`, `/api/reservations`)는 `consent: true`가 없으면 400. 폼의 개인정보 동의 체크박스가 이 값을 보냄.

## 백업

`data/kband.db` 파일 하나 복사하면 끝. 운영 중엔 `sqlite3 data/kband.db ".backup backup.db"`.
