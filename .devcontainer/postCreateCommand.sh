#!/usr/bin/env bash

# postCreateCommand.sh v. 1.0.1

# This script runs after the Dev Container is created to set up the dev container environment.

set -euo pipefail

echo "Welcome to Matterbridge Dev Container"
DISTRO=$(awk -F= '/^PRETTY_NAME=/{gsub(/"/, "", $2); print $2}' /etc/os-release)
CODENAME=$(awk -F= '/^VERSION_CODENAME=/{print $2}' /etc/os-release)
echo "Distro: $DISTRO ($CODENAME)"
echo "User: $(whoami)"
echo "Hostname: $(hostname)"
echo "Architecture: $(uname -m)"
echo "Kernel Version: $(uname -r)"
echo "Uptime: $(uptime -p || echo 'unavailable')"
echo "Date: $(date)"
echo "Node.js version: $(node -v)"
echo "Npm version: $(npm -v)"
echo ""

echo "1 - Setting permissions..."
sudo chown -R node:node .
sudo mkdir -p /home/node/.claude /home/node/.codex
sudo chown -R node:node /home/node/.claude /home/node/.codex

echo "2 - Installing package dependencies..."
npm install --no-fund --no-audit

echo "3 - Building the package..."
npm run build

echo "4 - Checking for outdated packages..."
npm outdated || true

echo "5 - Post create setup completed!"
