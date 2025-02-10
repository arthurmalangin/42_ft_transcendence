FROM hashicorp/vault:latest

RUN mkdir -p /vault/config/ /vault/init/ /vault/policy/

# Install curl
RUN apk add --no-cache curl

# Copy custom Vault configuration file
COPY ./docker/src/vault/vault-config.hcl /vault/config/vault-config.hcl

# Copy the initialization script
COPY ./docker/src/vault/vault_init.sh /vault/init/vault_init.sh

run ls -l /vault/init/

# Make the initialization script executable
RUN chmod +x /vault/init/vault_init.sh

# Expose the Vault port
EXPOSE 8200


# Retrieve the VAULT_ADDR environment variable from .env file
ARG VAULT_ADDR
ENV VAULT_ADDR=${VAULT_ADDR}

# Command to run the initialization script and start Vault in dev mode
# CMD ["vault", "server", "-dev"]
# CMD ["vault", "server", "-config=/vault/config/vault-config.hcl"]
CMD ["/bin/sh", "-c", "sh /vault/init/vault_init.sh && vault server -dev"]
# CMD ["/bin/sh", "-c", "sh /vault/init/vault_init.sh && vault server -config=/vault/config/vault-config.hcl"]
# CMD vault server -dev -config=/vault/config/vault-config.hcl & \
CMD vault server -dev & sleep 1 && sh /vault/init/vault_init.sh && tail -f /dev/null