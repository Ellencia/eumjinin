#!/usr/bin/env bash
# SQLite 온라인 백업. 매일 04:20 cron(/etc/cron.d/kband-backup). 30일 보관
set -euo pipefail
umask 077   # 백업본은 개인정보 → root만
D=/srv/kband/backups
mkdir -p -m 700 $D
sqlite3 /srv/kband/data/kband.db ".backup '$D/kband-$(date +%F).db'"
find $D -name 'kband-*.db' -mtime +30 -delete
