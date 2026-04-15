#!/usr/bin/env bash
# =============================================================================
# SubSense — SSL Certificate Setup (Let's Encrypt / Certbot)
# Usage: sudo bash ssl.sh your-domain.com your@email.com
# =============================================================================
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-admin@${DOMAIN}}"

if [[ -z "${DOMAIN}" ]]; then
    echo "❌ Usage: sudo bash ssl.sh your-domain.com [email@domain.com]"
    exit 1
fi

echo "► Setting up SSL certificate for: ${DOMAIN}"

# ── Install certbot ───────────────────────────────────────────────────────────
if ! command -v certbot &>/dev/null; then
    apt-get install -y -qq certbot
fi

# ── Stop Nginx temporarily to use standalone mode ────────────────────────────
echo "[1/2] Requesting certificate from Let's Encrypt..."
cd /opt/subsense/app/server
docker compose stop nginx

certbot certonly \
    --standalone \
    --agree-tos \
    --non-interactive \
    --email "${EMAIL}" \
    -d "${DOMAIN}" \
    -d "www.${DOMAIN}"

# ── Update site config with domain ───────────────────────────────────────────
echo "[2/2] Updating Nginx config with domain: ${DOMAIN}..."
CONF_FILE="./nginx/sites-available/subsense.conf"
sed -i "s/YOUR_DOMAIN.com/${DOMAIN}/g" "${CONF_FILE}"

# ── Restart Nginx ─────────────────────────────────────────────────────────────
docker compose start nginx

# ── Auto-renew cron ───────────────────────────────────────────────────────────
(crontab -l 2>/dev/null; echo "0 12 * * * certbot renew --quiet && docker compose -f /opt/subsense/app/server/docker-compose.yml restart nginx") | crontab -

echo ""
echo "✓ SSL certificate installed for ${DOMAIN}"
echo "  Auto-renew cron job added."
