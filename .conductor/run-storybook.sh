#!/usr/bin/env bash
# Conductor run script — Storybook on the workspace's second assigned port
# (each workspace gets CONDUCTOR_PORT..CONDUCTOR_PORT+9).
set -euo pipefail
source "$(dirname "$0")/lib.sh"

exec pnpm exec cross-env NODE_OPTIONS=--no-deprecation storybook dev -p "$((PORT + 1))" --no-open
