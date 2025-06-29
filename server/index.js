# Learn more about configuring your app at https://shopify.dev/docs/apps/tools/cli/configuration

name = "Price List Generator"
client_id = "{{ SHOPIFY_CLIENT_ID }}"
application_url = "https://{{ APP_URL }}"
embedded = true

[access_scopes]
# https://shopify.dev/docs/api/usage/access-scopes
scopes = "read_products,read_collections,read_inventory,read_locations,read_price_rules,read_discounts"

[auth]
redirect_urls = [
  "https://{{ APP_URL }}/auth/callback",
  "https://{{ APP_URL }}/auth/shopify/callback",
  "https://{{ APP_URL }}/api/auth/callback"
]

[webhooks]
api_version = "2024-01"

[build]
automatically_update_urls_on_dev = true
dev_store_url = "{{ DEV_STORE_URL }}"
include_config_on_deploy = true

[pos]
embedded = false

[[app_proxy]]
url = "/api/proxy"
subpath = "price-list"
prefix = "apps"

[app_preferences]
url = "/api/preferences"

[[extension]]
name = "price-list-extension"
type = "admin_link"
metafields = []

[extension.targeting]
target = "admin.product.details.action"
module = "./extensions/price-list-link/src/index.js"

[extension.settings]
name = "Generate Price List"
description = "Add products to price list"

# Development configuration
[environments.development]
dev_store_url = "{{ DEV_STORE_URL }}"
application_url = "{{ NGROK_URL }}"

# Production configuration  
[environments.production]
application_url = "https://{{ RAILWAY_APP_URL }}"
