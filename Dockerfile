FROM nginx:alpine
RUN apk add --no-cache gettext

COPY assessment-builder.html /usr/share/nginx/html/builder.template
COPY player.html              /usr/share/nginx/html/player.template
COPY embed.js                 /usr/share/nginx/html/embed.template
COPY nginx.conf               /etc/nginx/conf.d/default.conf
COPY entrypoint.sh            /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
