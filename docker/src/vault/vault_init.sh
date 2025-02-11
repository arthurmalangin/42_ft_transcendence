#!/bin/bash

# Wait for Vault to be ready
while ! curl -s $VAULT_ADDR/v1/sys/health > /dev/null; do
    echo "Waiting for Vault to be ready..."
    sleep 2
done

# Enable the database secrets engine
vault secrets enable database
# Enable the transit secrets engine
vault secrets enable transit
# Enable the kv-v2 secrets engine
vault secrets enable -path=secret kv-v2

# Store the PostgreSQL credentials in Vault
vault kv put secret/database/credentials username="$POSTGRES_USER" password="$POSTGRES_PASSWORD" dbname="$POSTGRES_DB"
vault kv put secret/django/secret secret_key="$DJ_SECRET_KEY"
vault kv put secret/42_API/credentials client_id="$CLIENT_42_ID" client_secret="$CLIENT_42_SC"

# Create a key for encrypting the Django secret key
vault write -f transit/keys/django-secret-key

echo "Vault initialized"