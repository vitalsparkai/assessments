FROM nginx:alpine

# Copy static files — identical image for every deployment
COPY assessment-builder.html /usr/share/nginx/html/assessment-builder.html
COPY player.html             /usr/share/nginx/html/player.html
COPY embed.js                /usr/share/nginx/html/embed.js

# nginx:alpine automatically runs envsubst on *.template files at startup
# INSTANCE_ID is injected at runtime via Coolify environment variables
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
