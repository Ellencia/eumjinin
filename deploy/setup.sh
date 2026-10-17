#!/usr/bin/env bash
# 새 Ubuntu 24.04 VPS 초기 설정. root로 한 번만:  bash setup.sh
# 하는 일: Node 24 + Caddy 설치, swap, ufw, SSH 비밀번호 로그인 차단, kband 계정, 저장소 clone, .env 생성, 첫 배포, 백업 cron
set -euo pipefail
REPO=https://github.com/Ellencia/eumjinin.git
APP=/srv/kband
export DEBIAN_FRONTEND=noninteractive

# 외부 저장소(Node 24, Caddy)는 첫 apt 갱신 전에 키까지 등록. 키 없는 목록이 남으면 apt 전체가 멈춤
install -d /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt > /etc/apt/sources.list.d/caddy-stable.list
chmod 644 /etc/apt/keyrings/nodesource.gpg /usr/share/keyrings/caddy-stable-archive-keyring.gpg  # gpg가 600으로 만들어 _apt가 못 읽음
apt-get update -q
apt-get install -y -q ca-certificates git ufw sqlite3 nodejs caddy

# swap 2G — CRA 빌드가 메모리를 먹음
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable

printf 'PasswordAuthentication no\nKbdInteractiveAuthentication no\n' > /etc/ssh/sshd_config.d/90-kband.conf
systemctl reload ssh

id -u kband &>/dev/null || useradd -r -M -d $APP -s /usr/sbin/nologin kband
mkdir -p $APP && chown kband:kband $APP
[ -d $APP/.git ] || sudo -u kband -H git clone -q $REPO $APP

# .env: 관리자 비밀번호는 여기서만 생성. 화면에 찍지 않음 → scp로 가져가서 ~/.secrets 에 보관
if [ ! -f $APP/.env ]; then
  printf 'NODE_ENV=production\nPORT=8703\nADMIN_PASSWORD=%s\n' "$(openssl rand -base64 18 | tr -d '/+=')" > $APP/.env
  chown kband:kband $APP/.env && chmod 600 $APP/.env
fi

bash $APP/deploy/deploy.sh
systemctl enable -q kband caddy

echo '20 4 * * * root bash /srv/kband/deploy/backup.sh' > /etc/cron.d/kband-backup
echo "=== setup done ==="
