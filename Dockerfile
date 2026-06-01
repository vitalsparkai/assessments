FROM nginx:alpine

# Instance ID — set this per deployment in docker-compose or Coolify env vars
# e.g. INSTANCE_ID=vitalspark-prod or INSTANCE_ID=ThriveRealty
ARG INSTANCE_ID=default
ENV INSTANCE_ID=${INSTANCE_ID}

COPY assessment-builder.html /usr/share/nginx/html/assessment-builder.html
COPY player.html             /usr/share/nginx/html/player.html
COPY embed.js                /usr/share/nginx/html/embed.js
COPY nginx.conf              /etc/nginx/templates/default.conf.template

# nginx docker image supports envsubst on *.template files automatically
# This replaces $INSTANCE_ID in nginx.conf at container startup

EXPOSE 80
