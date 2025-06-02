FROM nginx:1.27.4-alpine

# Install dependencies
RUN apk update && \
    apk add --no-cache openssl pcre pcre-dev zlib zlib-dev openssl-dev build-base git wget autoconf automake libtool linux-headers curl curl-dev yajl-dev libxml2-dev lmdb-dev geoip-dev lua-dev pcre2-dev

# Create necessary directories
RUN mkdir -p /etc/nginx/ssl /var/www/html /usr/local/src /etc/nginx/modsec

# Set permissions
RUN chmod 700 /etc/nginx/ssl

# ------------------------------------------------------------- #
#                    ModSecurity configuration                  #
# ------------------------------------------------------------- #

# Download and install ModSecurity
RUN cd /usr/local/src && \
    git clone --depth 1 -b v3/master https://github.com/SpiderLabs/ModSecurity && \
    cd ModSecurity && \
    git submodule init && \
    git submodule update && \
    ./build.sh && \
    ./configure && \
    make && \
    make install

# Download and install Nginx source code
RUN cd /usr/local/src && \
    wget http://nginx.org/download/nginx-1.27.4.tar.gz && \
    tar -xzvf nginx-1.27.4.tar.gz && \
    mv nginx-1.27.4 nginx

# Download and install ModSecurity-nginx connector
RUN cd /usr/local/src && \
    git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git && \
    cd /usr/local/src/nginx && \
    ./configure --with-compat --add-dynamic-module=/usr/local/src/ModSecurity-nginx && \
    make modules && \
    cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules

# Copy ModSecurity configuration files
COPY ./docker/src/nginx/modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY ./docker/src/nginx/unicode.mapping /etc/nginx/modsec/unicode.mapping

# ------------------------------------------------------------- #

# Generate SSL certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -subj "/C=FR/ST=NouvelleAquitaine/L=Angouleme/O=42/OU=ft_transcendence/CN=amalangi.42.fr" \
    -keyout /etc/nginx/ssl/cert.key -out /etc/nginx/ssl/cert.crt

# Copy Nginx configuration and website files
COPY ./docker/src/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/src/nginx/index.html /var/www/html/index.html
COPY ./docker/src/nginx/router.js /var/www/html/router.js
COPY ./docker/src/nginx/favicon.ico /var/www/html/favicon.ico
# COPY ./docker/src/nginx/tools /var/www/html/tools

# Expose ports for HTTP and HTTPS
EXPOSE 80 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]