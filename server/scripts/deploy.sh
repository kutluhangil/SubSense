#!/usr/bin/env bash
# =============================================================================
# Aboneyim — Uzak Sunucu (macmini-server) Dağıtım Betiği
# ÇALIŞACAĞI MAKİNE: Mac (Ana Bilgisayar — kutluhangil@Kutluhans-Mac-Mini)
# Kullanım (proje kök dizininden):
#   bash server/scripts/deploy.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "${PROJECT_ROOT}"

echo "► Aboneyim macmini-server üzerinde derleniyor ve başlatılıyor (Intel amd64, 127.0.0.1:3002)..."
docker --context macmini compose -f server/docker-compose.yml --env-file .env up -d --build --force-recreate

echo "► Kullanılmayan eski imajlar temizleniyor..."
docker --context macmini image prune -f

echo "✓ Dağıtım tamamlandı! Konteyner durumu:"
docker --context macmini ps --filter "name=aboneyim_web" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
