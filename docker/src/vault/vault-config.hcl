# Basic Vault configuration

# Set the listener for Vault
listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1
}

# Configure the storage backend
storage "file" {
  path = "/vault/data"
}

# Enable the UI
ui = true

# Disable the use of mlock
disable_mlock = true

# Set the default log level
log_level = "info"

# API rate limit configuration (optional)
rate_limit {
  enabled = true
  limit = 1000
}

# Telemetry configuration (optional)
telemetry {
  prometheus_retention_time = "24h"
}