FROM nginx:alpine

# Node runtime for the suite SSR renderer (link-preview injection)
RUN apk add --no-cache nodejs

# Copy static files — identical image for every deployment
COPY assessment-builder.html /usr/share/nginx/html/assessment-builder.html
COPY player.html             /usr/share/nginx/html/player.html
COPY suite.html              /usr/share/nginx/html/suite.html
COPY embed.js                /usr/share/nginx/html/embed.js

# Suite SSR renderer (serves /s/{slug} with per-suite Open Graph tags)
COPY ssr.js   /app/ssr.js
COPY start.sh /start.sh
RUN chmod +x /start.sh

# nginx:alpine automatically runs envsubst on *.template files at startup
# INSTANCE_ID is injected at runtime via Coolify environment variables
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

# nginx's docker-entrypoint runs envsubst on the templates, then execs this
# CMD, which launches the SSR renderer + nginx together.
CMD ["/start.sh"]
