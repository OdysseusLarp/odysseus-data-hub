#!/usr/bin/env bash

set -euo pipefail

API_URL="apps.odysseuslarp.dev"

SCRIPT_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)

cd "$SCRIPT_DIR/.."

openapi -s "https://$API_USER:$API_PASSWORD@$API_URL/api-docs.json" -o ./src/app/api -l ts --semicolon
