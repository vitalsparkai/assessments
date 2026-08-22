FROM nginx:alpine

# Node runtime for the suite SSR renderer (link-preview injection)
RUN apk add --no-cache nodejs

# Copy static files — identical image for every deployment
COPY assessment-builder.html /usr/share/nginx/html/assessment-builder.html
COPY player.html             /usr/share/nginx/html/player.html
COPY suite.html              /usr/share/nginx/html/suite.html
COPY embed.js                /usr/share/nginx/html/embed.js

# Suite SSR renderer (serves /s/{slug} with per-suite Open Graph tags).
# Started in the background by the entrypoint hook below — we DO NOT override
# the image's CMD, so nginx's own entrypoint still runs envsubst on the
# templates (INSTANCE_ID → /config.js) and starts nginx normally.
COPY ssr.js /app/ssr.js
COPY docker-entrypoint.d/40-suite-ssr.sh /docker-entrypoint.d/40-suite-ssr.sh
RUN chmod +x /docker-entrypoint.d/40-suite-ssr.sh

# nginx:alpine automatically runs envsubst on *.template files at startup
# INSTANCE_ID is injected at runtime via Coolify environment variables
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
