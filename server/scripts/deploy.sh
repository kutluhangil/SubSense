#!/usr/bin/env bash
# =============================================================================
# SubSense — Deploy Script
# Run this to pull latest code and rebuild/restart the app.
# Usage: bash deploy.sh
# =============================================================================
set -euo pipefail

PROJECT_DIR="/opt/subsense/app"
SERVER_DIR="${PROJECT_DIR}/server"

echo "► Starting SubSense deployment..."

# ── Pull latest code ──────────────────────────────────────────────────────────
echo "[1/3] Pulling latest code from GitHub..."
cd "${PROJECT_DIR}"
git fetch --all
git reset --hard origin/main
echo "    ✓ Code updated to: $(git log --oneline -1)"

# ── Rebuild & restart containers ──────────────────────────────────────────────
echo "[2/3] Rebuilding Docker containers..."
cd "${SERVER_DIR}"
docker compose build --no-cache
docker compose up -d --force-recreate

# ── Cleanup old images ────────────────────────────────────────────────────────
echo "[3/3] Cleaning up old Docker images..."
docker image prune -f

echo ""
echo "✓ Deployment complete!"
echo "  Container status:"
docker compose ps
