#!/bin/sh
set -e

# Events service entrypoint
echo "[events] Starting OpenMoko Events backend..."
exec node server.js
