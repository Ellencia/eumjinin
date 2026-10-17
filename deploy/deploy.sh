#!/usr/bin/env bash
# 코드 갱신 + 빌드 + 설정 반영 + 재시작. root로:  bash /srv/kband/deploy/deploy.sh
set -euo pipefail
APP=/srv/kband
DIR=$(cd "$(dirname "$0")" && pwd)
cd $APP

sudo -u kband -H git pull -q --ff-only
sudo -u kband -H npm ci -q --no-audit --no-fund
sudo -u kband -H env CI=true GENERATE_SOURCEMAP=false NODE_OPTIONS=--max-old-space-size=1024 npm run build

cp $DIR/kband.service /etc/systemd/system/kband.service
cp $DIR/Caddyfile /etc/caddy/Caddyfile
systemctl daemon-reload
systemctl restart kband
systemctl reload caddy 2>/dev/null || systemctl restart caddy
sleep 1
systemctl --no-pager --lines=3 status kband | head -6
curl -s -o /dev/null -w "local http %{http_code}\n" http://localhost:8703/
