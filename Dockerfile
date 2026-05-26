FROM nginx:alpine

COPY assessment-builder.html /usr/share/nginx/html/index.html
COPY player.html              /usr/share/nginx/html/player.html
COPY embed.js                 /usr/share/nginx/html/embed.js
COPY nginx.conf               /etc/nginx/conf.d/default.conf
