FROM hashicorp/vault:latest

# Copy custom Vault configuration file
COPY ./docker/src/vault/vault-config.hcl /vault/config/vault-config.hcl

# Expose the Vault port
EXPOSE 8200

# Set the VAULT_ADDR environment variable
ENV VAULT_ADDR='http://127.0.0.1:8200'

# Command to start Vault with custom configuration
CMD ["vault", "server", "-dev"]
# CMD ["vault", "server", "-config=/vault/config/vault-config.hcl"]