FROM nginx:alpine

RUN apk add --no-cache openssl

RUN mkdir -p /etc/nginx/ssl
RUN mkdir -p /var/www/html
RUN chmod 700 /etc/nginx/ssl  

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -subj "/C=FR/ST=NouvelleAquitaine/L=Angouleme/O=42/OU=ft_transcendence/CN=amalangi.42.fr" \
    -keyout /etc/nginx/ssl/cert.key -out /etc/nginx/ssl/cert.crt

COPY ./docker/src/nginx/nginx.conf /etc/nginx/nginx.conf

COPY ./docker/src/nginx/index.html /var/www/html/index.html
COPY ./docker/src/nginx/router.js /var/www/html/router.js
# COPY ./docker/src/nginx/tools /var/www/html/tools

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

