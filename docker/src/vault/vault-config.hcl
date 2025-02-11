# Basic Vault configuration

# Set the listener for Vault
listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_cert_file = "/vault/cert/cert.crt"
  tls_key_file  = "/vault/cert/cert.key"
  tls_disable = 0
}

# Configure the storage backend
storage "file" {
  path = "/vault/data"
}

log_level = "warn"

# Enable the UI
ui = true

# Disable the use of mlock
disable_mlock = true

# Set the default log level
log_level = "info"
