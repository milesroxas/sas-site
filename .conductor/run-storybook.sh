#!/usr/bin/env bash
# Run script (Conductor, T3 Code): Storybook on the workspace's port + 1
# (Conductor reserves CONDUCTOR_PORT..+9; a T3 worktree owns DEV_PORT and +1).
set -euo pipefail
source "$(dirname "$0")/lib.sh"

assert_port_free "$((PORT + 1))"
exec pnpm exec cross-env NODE_OPTIONS=--no-deprecation storybook dev -p "$((PORT + 1))" --no-open
