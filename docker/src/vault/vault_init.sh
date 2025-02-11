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
while ! curl -s $VAULT_ADDR/v1/sys/health > /dev/null; do
    echo "Waiting for Vault to be ready..."
    sleep 2
done

# Vérifier si Vault est déjà initialisé
VAULT_STATUS=$(curl -s --request GET $VAULT_ADDR/v1/sys/init | jq -r '.initialized')

if [ "$VAULT_STATUS" == "false" ]; then
    echo "Vault n'est pas encore initialisé. Initialisation en cours..."

    # Initialisation de Vault (génère les clés de déchiffrement et le token root)
    VAULT_INIT_OUTPUT=$(curl -s --request POST \
      --data '{"secret_shares": 5, "secret_threshold": 3}' \
      $VAULT_ADDR/v1/sys/init)

    # Extraire les clés de déchiffrement et le token root
    UNSEAL_KEYS=$(echo $VAULT_INIT_OUTPUT | jq -r '.unseal_keys_b64')
    ROOT_TOKEN=$(echo $VAULT_INIT_OUTPUT | jq -r '.root_token')

    # Afficher les clés de déchiffrement et le token root
    echo "Vault initialisé avec succès !"
    echo "Clés de déchiffrement : $UNSEAL_KEYS"
    echo "Token root : $ROOT_TOKEN"

    # Sauvegarder les informations dans un fichier sécurisé
    echo "Sauvegarder les informations pour une utilisation future :"
    echo "Unseal Keys: $UNSEAL_KEYS" > vault_initialization.txt
    echo "Root Token: $ROOT_TOKEN" >> vault_initialization.txt

    # Déverrouiller Vault avec les clés de déchiffrement (en utilisant les 3 premières clés)
    UNSEAL_KEY_1=$(echo $UNSEAL_KEYS | cut -d' ' -f1)
    UNSEAL_KEY_2=$(echo $UNSEAL_KEYS | cut -d' ' -f2)
    UNSEAL_KEY_3=$(echo $UNSEAL_KEYS | cut -d' ' -f3)

    # Déverrouiller Vault (avec les 3 clés)
    curl -s --request POST \
      --data "{\"key\": \"$UNSEAL_KEY_1\"}" \
      $VAULT_ADDR/v1/sys/unseal

    curl -s --request POST \
      --data "{\"key\": \"$UNSEAL_KEY_2\"}" \
      $VAULT_ADDR/v1/sys/unseal

    curl -s --request POST \
      --data "{\"key\": \"$UNSEAL_KEY_3\"}" \
      $VAULT_ADDR/v1/sys/unseal

    # Vérification de l'état de déverrouillage
    VAULT_SEALED=$(curl -s --request GET $VAULT_ADDR/v1/sys/seal | jq -r '.sealed')

    if [ "$VAULT_SEALED" == "false" ]; then
        echo "Vault est déverrouillé avec succès !"
    else
        echo "Erreur lors du déverrouillage de Vault."
    fi
else
    echo "Vault est déjà initialisé. Aucune initialisation nécessaire."
fi

# Authentification avec le token root (utiliser le token si nécessaire)
export VAULT_TOKEN=$ROOT_TOKEN

# Enable the database secrets engine
vault secrets enable database

# Enable the transit secrets engine
vault secrets enable transit

# Enable the kv-v2 secrets engine
vault secrets enable -path=secret kv-v2

# Store the PostgreSQL credentials in Vault
vault kv put secret/database/credentials username="$POSTGRES_USER" password="$POSTGRES_PASSWORD" dbname="$POSTGRES_DB"

# Store Django secret in Vault
vault kv put secret/django/secret secret_key="$DJ_SECRET_KEY"
<<<<<<< Updated upstream
=======

# Store 42 API credentials in Vault
vault kv put secret/42_API/credentials client_id="$CLIENT_42_ID" client_secret="$CLIENT_42_SC" API_secret="$API_42_SC"
>>>>>>> Stashed changes

# Create a key for encrypting the Django secret key
vault write -f transit/keys/django-secret-key

<<<<<<< Updated upstream
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
=======
echo "Vault initialized and secrets stored successfully!"
>>>>>>> Stashed changes
