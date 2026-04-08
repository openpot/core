#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="$ROOT_DIR/.certs"
CA_KEY_PATH="$CERT_DIR/openpot-local-dev-ca.key"
CA_CERT_PATH="$CERT_DIR/openpot-local-dev-ca.crt"
CERT_KEY_PATH="$CERT_DIR/openpot-local-dev.key"
CERT_CSR_PATH="$CERT_DIR/openpot-local-dev.csr"
CERT_PATH="$CERT_DIR/openpot-local-dev.crt"
CERT_EXT_PATH="$CERT_DIR/openpot-local-dev.ext"
HOSTS_PATH="$CERT_DIR/openpot-local-dev.hosts"

DEV_PORT="${OPENPOT_DEV_PORT:-${PORT:-3000}}"
DEV_BIND_HOST="${OPENPOT_DEV_BIND_HOST:-0.0.0.0}"
EXTRA_HOSTS="${OPENPOT_DEV_HOST:-}"

mkdir -p "$CERT_DIR"

collect_hosts() {
  local host
  printf '%s\n' localhost 127.0.0.1

  if [[ -n "$EXTRA_HOSTS" ]]; then
    tr ',' '\n' <<<"$EXTRA_HOSTS"
    return
  fi

  if command -v hostname >/dev/null 2>&1; then
    for host in $(hostname -I 2>/dev/null); do
      if [[ "$host" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
        printf '%s\n' "$host"
      fi
    done
  fi
}

mapfile -t CERT_HOSTS < <(collect_hosts | awk 'NF && !seen[$0]++')
EXPECTED_HOSTS="$(printf '%s\n' "${CERT_HOSTS[@]}")"

if [[ ! -f "$HOSTS_PATH" || "$EXPECTED_HOSTS" != "$(cat "$HOSTS_PATH")" || ! -f "$CA_KEY_PATH" || ! -f "$CA_CERT_PATH" || ! -f "$CERT_KEY_PATH" || ! -f "$CERT_PATH" ]]; then
  if ! command -v openssl >/dev/null 2>&1; then
    printf 'Openpot HTTPS dev could not find openssl and no reusable certificate set is present.\n' >&2
    exit 1
  fi

  if [[ ! -f "$CA_KEY_PATH" || ! -f "$CA_CERT_PATH" ]]; then
    openssl req \
      -x509 \
      -newkey rsa:2048 \
      -keyout "$CA_KEY_PATH" \
      -out "$CA_CERT_PATH" \
      -days 825 \
      -nodes \
      -sha256 \
      -subj "/CN=Openpot Local Dev CA"
  fi

  rm -f "$CERT_KEY_PATH" "$CERT_CSR_PATH" "$CERT_PATH" "$CERT_EXT_PATH"

  openssl req \
    -new \
    -newkey rsa:2048 \
    -keyout "$CERT_KEY_PATH" \
    -out "$CERT_CSR_PATH" \
    -nodes \
    -sha256 \
    -subj "/CN=Openpot Secure Timer Local Dev"

  {
    printf 'authorityKeyIdentifier=keyid,issuer\n'
    printf 'basicConstraints=CA:FALSE\n'
    printf 'keyUsage=digitalSignature,keyEncipherment\n'
    printf 'extendedKeyUsage=serverAuth\n'
    printf 'subjectAltName=@alt_names\n\n'
    printf '[alt_names]\n'

    dns_index=1
    ip_index=1

    for host in "${CERT_HOSTS[@]}"; do
      if [[ "$host" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
        printf 'IP.%s = %s\n' "$ip_index" "$host"
        ip_index=$((ip_index + 1))
      else
        printf 'DNS.%s = %s\n' "$dns_index" "$host"
        dns_index=$((dns_index + 1))
      fi
    done
  } >"$CERT_EXT_PATH"

  openssl x509 \
    -req \
    -in "$CERT_CSR_PATH" \
    -CA "$CA_CERT_PATH" \
    -CAkey "$CA_KEY_PATH" \
    -CAcreateserial \
    -out "$CERT_PATH" \
    -days 825 \
    -sha256 \
    -extfile "$CERT_EXT_PATH"

  printf '%s\n' "${CERT_HOSTS[@]}" >"$HOSTS_PATH"
fi

printf '\nHTTPS dev certificate ready.\n'
printf 'Trust this CA on Android Chrome for install testing:\n%s\n\n' "$CA_CERT_PATH"
printf 'Serving Openpot over HTTPS on port %s for hosts:\n' "$DEV_PORT"
printf '  - %s\n' "${CERT_HOSTS[@]}"
printf '\n'

if command -v pnpm >/dev/null 2>&1; then
  NEXT_DEV_COMMAND=(pnpm exec next dev)
elif [[ -x "$ROOT_DIR/node_modules/.bin/next" ]]; then
  NEXT_DEV_COMMAND=("$ROOT_DIR/node_modules/.bin/next" dev)
else
  printf 'Openpot HTTPS dev requires pnpm or a local next binary in node_modules/.bin.\n' >&2
  exit 1
fi

exec "${NEXT_DEV_COMMAND[@]}" \
  --hostname "$DEV_BIND_HOST" \
  --port "$DEV_PORT" \
  --experimental-https \
  --experimental-https-key "$CERT_KEY_PATH" \
  --experimental-https-cert "$CERT_PATH" \
  --experimental-https-ca "$CA_CERT_PATH"
