FROM nginx:alpine
RUN apk add --no-cache gettext

COPY assessment-builder.html /usr/share/nginx/html/builder.template
COPY player.html              /usr/share/nginx/html/player.template
COPY embed.js                 /usr/share/nginx/html/embed.template
COPY nginx.conf               /etc/nginx/conf.d/default.conf

CMD ["/bin/sh", "-c", "\
  envsubst '${SUPABASE_URL} ${SUPABASE_ANON_KEY} ${APP_URL}' \
    < /usr/share/nginx/html/builder.template \
    > /usr/share/nginx/html/index.html && \
  envsubst '${SUPABASE_URL} ${SUPABASE_ANON_KEY} ${APP_URL}' \
    < /usr/share/nginx/html/player.template \
    > /usr/share/nginx/html/player.html && \
  envsubst '${APP_URL}' \
    < /usr/share/nginx/html/embed.template \
    > /usr/share/nginx/html/embed.js && \
  nginx -g 'daemon off;'"]
