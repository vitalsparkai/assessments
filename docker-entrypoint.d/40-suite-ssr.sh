#!/bin/sh
# Start the suite SSR renderer in the background. Best-effort: exit 0 no matter
# what so nginx always starts (it falls back to static suite.html if the
# renderer isn't running). This runs after the image's envsubst step, so the
# nginx config and /config.js are already in place.
node /app/ssr.js >/tmp/ssr.log 2>&1 &
exit 0
