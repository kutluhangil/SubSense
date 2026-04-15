#!/usr/bin/env bash
# =============================================================================
# SubSense — Ubuntu Server Initial Setup Script
# Run once as root (or with sudo) on a fresh Ubuntu 22.04/24.04 LTS server.
# Usage: sudo bash setup.sh
# =============================================================================
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
APP_USER="subsense"
PROJECT_DIR="/opt/subsense"
TIMEZONE="Europe/Istanbul"

echo "═══════════════════════════════════════"
echo "  SubSense Ubuntu Server Setup"
echo "═══════════════════════════════════════"

# ── 1. System Updates ─────────────────────────────────────────────────────────
echo "[1/8] Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Timezone & Locale ──────────────────────────────────────────────────────
echo "[2/8] Setting timezone to ${TIMEZONE}..."
timedatectl set-timezone "${TIMEZONE}"
locale-gen en_US.UTF-8
update-locale LANG=en_US.UTF-8

# ── 3. Create App User ────────────────────────────────────────────────────────
echo "[3/8] Creating app user: ${APP_USER}..."
if ! id "${APP_USER}" &>/dev/null; then
    useradd -m -s /bin/bash -G sudo "${APP_USER}"
    echo "${APP_USER} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/"${APP_USER}"
    echo "    ✓ User '${APP_USER}' created"
else
    echo "    ✓ User '${APP_USER}' already exists"
fi

# ── 4. Install Docker ─────────────────────────────────────────────────────────
echo "[4/8] Installing Docker (latest stable)..."
if ! command -v docker &>/dev/null; then
    apt-get install -y -qq ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
        > /etc/apt/sources.list.d/docker.list
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    usermod -aG docker "${APP_USER}"
    systemctl enable docker
    systemctl start docker
    echo "    ✓ Docker installed"
else
    echo "    ✓ Docker already installed: $(docker --version)"
fi

# ── 5. Install Git & Node.js ──────────────────────────────────────────────────
echo "[5/8] Installing Git and Node.js LTS..."
apt-get install -y -qq git curl

if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y -qq nodejs
    echo "    ✓ Node.js installed: $(node --version)"
else
    echo "    ✓ Node.js already installed: $(node --version)"
fi

# ── 6. Set Up Project Directory ───────────────────────────────────────────────
echo "[6/8] Creating project directory at ${PROJECT_DIR}..."
mkdir -p "${PROJECT_DIR}"
chown -R "${APP_USER}":"${APP_USER}" "${PROJECT_DIR}"
echo "    ✓ Directory ready: ${PROJECT_DIR}"

# ── 7. Configure UFW Firewall ─────────────────────────────────────────────────
echo "[7/8] Configuring UFW firewall..."
apt-get install -y -qq ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh        # Port 22 — adjust if you changed SSH port
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw --force enable
echo "    ✓ UFW enabled. Open ports: SSH, 80, 443"

# ── 8. Install fail2ban ───────────────────────────────────────────────────────
echo "[8/8] Installing fail2ban (SSH brute-force protection)..."
apt-get install -y -qq fail2ban
systemctl enable fail2ban
systemctl start fail2ban
echo "    ✓ fail2ban active"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════"
echo "  Setup Complete!"
echo "═══════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Copy your project to ${PROJECT_DIR}:"
echo "     git clone https://github.com/kutluhangil/SubSense.git ${PROJECT_DIR}/app"
echo ""
echo "  2. Copy .env file to the server:"
echo "     scp .env ${APP_USER}@<server-ip>:${PROJECT_DIR}/app/"
echo ""
echo "  3. Run the app:"
echo "     cd ${PROJECT_DIR}/app/server && docker compose up -d"
echo ""
echo "  4. (Optional) Get SSL certificate:"
echo "     bash scripts/ssl.sh your-domain.com"
echo ""
