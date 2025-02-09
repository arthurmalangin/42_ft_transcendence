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

# Create a key for encrypting the Django secret key
vault write -f transit/keys/django-secret-key

# Configure the PostgreSQL plugin
vault write database/config/data-base \
    plugin_name=postgresql-database-plugin \
    allowed_roles="db-role" \
    connection_url="db://{{username}}:{{password}}@db:5432/"$POSTGRES_DB"?sslmode=disable" \
    username="ft_user" \
    password="ft_password"

# Create a role that maps a name in Vault to an SQL statement to create the database credentials
vault write database/roles/db-role \
    db_name=data-base \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT ALL PRIVILEGES ON DATABASE ft_transcendence TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"




echo "Vault initialized"