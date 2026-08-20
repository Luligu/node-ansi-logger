#!/usr/bin/env bash

# .devcontainer/node/post-start.sh v.2.0.0

# This script runs after the Dev Container is started to set up the dev container environment.

set -euo pipefail

echo "Welcome to Matterbridge Dev Container (post-start.sh)"
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
echo "Npm cache: $(npm config get cache)"
echo ""

echo "1.post-start - Installing the project dependencies..."
npm install --no-fund --no-audit

echo "2.post-start - Setting node_modules permissions..."
sudo chown -R node:node ./node_modules

echo "3.post-start - Building the project..."
npm run build

echo "4.post-start - Post start setup completed!"
