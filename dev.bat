@echo off
rem 로컬 개발: API(8703) 창 하나 + CRA 개발 서버(8706, 저장 즉시 반영). 폰은 Tailscale http://100.103.32.91:8706
rem 0.0.0.0 바인딩이지만 방화벽 'Tailscale-In' 규칙(Private=Tailscale 인터페이스)만 열려 있어 LAN(Public)에선 안 보임.
cd /d "%~dp0"
start "kband api :8703" cmd /k npm run server
set PORT=8706
set HOST=0.0.0.0
rem CRA 5 버그: HOST=0.0.0.0이면 allowedHosts가 빈 문자열이 돼 기동 실패 → 호스트 검사 해제(방화벽이 Tailscale만 열어 둠)
set DANGEROUSLY_DISABLE_HOST_CHECK=true
set BROWSER=none
npm start
