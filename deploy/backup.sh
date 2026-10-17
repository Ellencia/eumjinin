#!/usr/bin/env bash
# SQLite 온라인 백업. 매일 04:20 cron(/etc/cron.d/kband-backup). 30일 보관
set -euo pipefail
D=/srv/kband/backups
mkdir -p $D
sqlite3 /srv/kband/data/kband.db ".backup '$D/kband-$(date +%F).db'"
find $D -name 'kband-*.db' -mtime +30 -delete
