#!/usr/bin/env bash

# .devcontainer/bun/post-create.sh v.2.0.0

# This script runs after the Dev Container is created to set up the dev container environment.

set -euo pipefail

echo "Welcome to Matterbridge Dev Container (post-create.sh)"
DISTRO=$(awk -F= '/^PRETTY_NAME=/{gsub(/"/, "", $2); print $2}' /etc/os-release)
CODENAME=$(awk -F= '/^VERSION_CODENAME=/{print $2}' /etc/os-release)
echo "Distro: $DISTRO ($CODENAME)"
echo "User: $(whoami)"
echo "Hostname: $(hostname)"
echo "Architecture: $(uname -m)"
echo "Kernel Version: $(uname -r)"
echo "Uptime: $(uptime -p || echo 'unavailable')"
echo "Date: $(date)"
echo "Bun version: $(bun -v)"
echo "Bun global cache: ${HOME}/.bun/install/cache"
echo ""

echo "1.post-create - Creating directories..."
sudo mkdir -p /home/bun/.claude /home/bun/.codex /home/bun/.agents /home/bun/.bash-cache /home/bun/.npm /home/bun/.bun/install/cache

echo "2.post-create - Setting permissions..."
sudo chown -R bun:bun . /home/bun/.claude /home/bun/.codex /home/bun/.agents /home/bun/.bash-cache /home/bun/.npm /home/bun/.bun

echo "3.post-create - Installing the project dependencies..."
[ -f package-lock.json ] && mv package-lock.json package-lock.json.bak || true
bun install
[ -f package-lock.json.bak ] && mv package-lock.json.bak package-lock.json || true

echo "4.post-create - Building the project..."
bun run build

echo "5.post-create - Checking for outdated packages..."
bun outdated || true

echo "6.post-create - Post create setup completed!"
