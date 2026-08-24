FROM nginx:1.27-alpine

COPY index.html /usr/share/nginx/html/index.html
COPY favicon.ico /usr/share/nginx/html/favicon.ico
COPY assets /usr/share/nginx/html/assets
COPY LICENSE /usr/share/nginx/html/LICENSE
COPY README.md /usr/share/nginx/html/README.md
COPY THIRD_PARTY_NOTICES.md /usr/share/nginx/html/THIRD_PARTY_NOTICES.md

RUN printf '%s\n' \
  'server {' \
  '  listen 80;' \
  '  server_name localhost;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '  location / {' \
  '    try_files $uri $uri/ /index.html;' \
  '    add_header Cache-Control "no-store";' \
  '  }' \
  '  location /assets/ {' \
  '    try_files $uri =404;' \
  '    add_header Cache-Control "no-store";' \
  '  }' \
  '}' \
  > /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
