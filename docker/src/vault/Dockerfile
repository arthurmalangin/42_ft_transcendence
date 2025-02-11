FROM hashicorp/vault:latest

RUN mkdir -p /vault/config/ /vault/init/ /vault/policy/ /vault/cert/

# Install dependencies
RUN apk update
RUN apk add --no-cache curl openssl openssl-dev jq

# Copy custom Vault configuration file
COPY ./docker/src/vault/vault-config.hcl /vault/config/vault-config.hcl

RUN chmod 700 /vault/cert

# Copy SSL configuration file
COPY ./docker/src/vault/openssl.cnf /vault/cert/openssl.cnf

# Generate SSL certificate with SANs
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /vault/cert/cert.key -out /vault/cert/cert.crt \
    -config /vault/cert/openssl.cnf

# Copy the initialization script
COPY ./docker/src/vault/vault_init.sh /vault/init/vault_init.sh


# Make the initialization script executable
RUN chmod +x /vault/init/vault_init.sh

# Expose the Vault port
EXPOSE 8200


# Retrieve the VAULT_ADDR environment variable from .env file
ARG VAULT_ADDR
ENV VAULT_ADDR=${VAULT_ADDR}
ENV VAULT_SKIP_VERIFY=true

# Command to run the initialization script and start Vault
# CMD ["vault", "server", "-dev"]
# CMD ["vault", "server", "-config=/vault/config/vault-config.hcl"]
# CMD ["/bin/sh", "-c", "sh /vault/init/vault_init.sh && vault server -dev"]
# CMD ["/bin/sh", "-c", "sh /vault/init/vault_init.sh && vault server -config=/vault/config/vault-config.hcl"]
# CMD vault server -dev -config=/vault/config/vault-config.hcl & \
CMD vault server -config=/vault/config/vault-config.hcl & sleep 1 && sh /vault/init/vault_init.sh && tail -f /dev/null