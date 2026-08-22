#!/bin/sh
# Start the suite SSR renderer (background) and nginx (foreground).
# nginx's own docker-entrypoint has already run envsubst on the templates
# (injecting INSTANCE_ID into /config.js) before exec'ing this script.
set -e
node /app/ssr.js &
exec nginx -g 'daemon off;'
