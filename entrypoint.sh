#!/bin/sh
set -e
envsubst '${SUPABASE_URL} ${SUPABASE_ANON_KEY} ${APP_URL}' \
  < /usr/share/nginx/html/builder.template \
  > /usr/share/nginx/html/index.html
envsubst '${SUPABASE_URL} ${SUPABASE_ANON_KEY} ${APP_URL}' \
  < /usr/share/nginx/html/player.template \
  > /usr/share/nginx/html/player.html
envsubst '${APP_URL}' \
  < /usr/share/nginx/html/embed.template \
  > /usr/share/nginx/html/embed.js
exec nginx -g 'daemon off;'
