#!/bin/sh
set -e

# Init service entrypoint
echo "[init] Starting OpenMoko PWA frontend..."
exec nginx -g 'daemon off;'
