#!/bin/bash

# # Wait for Vault to be ready
# while ! curl -s $VAULT_ADDR/v1/sys/health > /dev/null; do
#     echo "Waiting for Vault to be ready..."
#     sleep 2
# done

# # Enable the database secrets engine
# vault secrets enable database
# # Enable the transit secrets engine
# vault secrets enable transit
# # Enable the kv-v2 secrets engine
# vault secrets enable -path=secret kv-v2

# # Store the PostgreSQL credentials in Vault
# vault kv put secret/database/credentials username="$POSTGRES_USER" password="$POSTGRES_PASSWORD" dbname="$POSTGRES_DB"
# vault kv put secret/django/secret secret_key="$DJ_SECRET_KEY"
# vault kv put secret/42_API/credentials client_id="$CLIENT_42_ID" client_secret="$CLIENT_42_SC" API_secret="$API_42_SC"

# # Create a key for encrypting the Django secret key
# vault write -f transit/keys/django-secret-key

# echo "Vault initialized"


#!/bin/bash

# Set the Vault address
VAULT_ADDR="https://127.0.0.1:8200"

# Wait for Vault to be ready
while ! curl -sk $VAULT_ADDR/v1/sys/health > /dev/null; do
    echo "Waiting for Vault to be ready..."
    sleep 2
done

VAULT_STATUS=$(curl -sk --request GET $VAULT_ADDR/v1/sys/init | jq -r '.initialized')

if [ "$VAULT_STATUS" == "false" ]; then
    echo "Vault is not initialized. Initialisation in progress..."

    VAULT_INIT_OUTPUT=$(curl -sk --request POST \
      --data '{"secret_shares": 5, "secret_threshold": 3}' \
      $VAULT_ADDR/v1/sys/init)

    UNSEAL_KEYS=$(echo $VAULT_INIT_OUTPUT | jq -r '.keys_base64[]')
    ROOT_TOKEN=$(echo $VAULT_INIT_OUTPUT | jq -r '.root_token')

    echo "Vault initialized with success !"
    echo "Keys : $UNSEAL_KEYS"
    echo "Token root : $ROOT_TOKEN"

    echo "Unseal Keys: $UNSEAL_KEYS" > /vault/init/vault_initialization.txt
    echo "Root Token: $ROOT_TOKEN" >> /vault/init/vault_initialization.txt
    echo "$ROOT_TOKEN" > /shared-volume/token.txt

    UNSEAL_KEY_1=$(echo $UNSEAL_KEYS | cut -d' ' -f1)
    UNSEAL_KEY_2=$(echo $UNSEAL_KEYS | cut -d' ' -f2)
    UNSEAL_KEY_3=$(echo $UNSEAL_KEYS | cut -d' ' -f3)

    # Unseal Vault
    curl -sk --request POST \
      --data "{\"key\": \"$UNSEAL_KEY_1\"}" \
      $VAULT_ADDR/v1/sys/unseal

    curl -sk --request POST \
      --data "{\"key\": \"$UNSEAL_KEY_2\"}" \
      $VAULT_ADDR/v1/sys/unseal

    curl -sk --request POST \
      --data "{\"key\": \"$UNSEAL_KEY_3\"}" \
      $VAULT_ADDR/v1/sys/unseal

    VAULT_SEALED=$(curl -sk --request GET $VAULT_ADDR/v1/sys/health | jq -r '.sealed')

    if [ "$VAULT_SEALED" == "false" ]; then
        echo "Vault successfuly unsealed !"
    else
        echo "Error when unsealing Vault."
    fi

    vault login $ROOT_TOKEN

    # Enable the database secrets engine
    vault secrets enable database

    # Enable the transit secrets engine
    vault secrets enable transit

    # Enable the kv-v2 secrets engine
    vault secrets enable -path=secret kv-v2

    # Store the PostgreSQL credentials in Vault
    vault kv put secret/database/credentials username="$POSTGRES_USER" password="$POSTGRES_PASSWORD" dbname="$POSTGRES_DB"
    vault kv put secret/django/secret secret_key="$DJ_SECRET_KEY"
    vault kv put secret/42_API/credentials client_id="$CLIENT_42_ID" client_secret="$CLIENT_42_SC" API_secret="$API_42_SC"

    # Create a key for encrypting the Django secret key
    vault write -f transit/keys/django-secret-key

    echo "Vault initialized and secrets stored successfully!"

else
    echo "Vault already initialized."
fi

