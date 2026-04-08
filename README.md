# Openpot

The privacy-first, zero-knowledge secure timer MVP.

## Core

Openpot is a sovereign session tracker built for the global cannabis community. Our architecture is designed to stay legally invisible and mathematically anonymous.

### Core Engineering Principles

1. No server-side identity: we do not store names, emails, or device identifiers.
2. Local-only state: session history lives in client-side IndexedDB.
3. Anonymous sync: the background worker only posts the approved secure session schema to `/api/sync`.
4. Stuttgart-safe: no telemetry, no remote fonts, no third-party tracking, and no behavior-sharing APIs.

## Run In Docker

This repo is designed to be forked and worked on inside a container so contributors do not need Node, pnpm, or Playwright installed on the host machine.

### Start the app

```bash
docker compose up --build app
```

### Start HTTPS for Android Chrome

```bash
OPENPOT_DEV_HOST=192.168.x.x OPENPOT_DEV_PORT=3000 docker compose run --rm --service-ports app bash -lc "corepack pnpm install && corepack pnpm dev:https"
```

The HTTPS launcher generates a local CA at `.certs/openpot-local-dev-ca.crt` and a LAN certificate for `localhost`, `127.0.0.1`, and your `OPENPOT_DEV_HOST` value. Trust that CA on your Android device, then open `https://<OPENPOT_DEV_HOST>:3000` in Chrome.

### Android Chrome installability

The app is configured as an installable PWA, but Android Chrome will only offer installation from a secure context. That means:

- `http://localhost` is installable for local desktop development.
- A plain LAN URL such as `http://192.168.x.x:3200` is not considered secure by Chrome, so it will not show the install prompt on Android.
- For local Android testing, run `pnpm dev:https` or the container command above, trust `.certs/openpot-local-dev-ca.crt` on the device, and use `https://<your-lan-ip>:<port>`.
- If your Android policy blocks user-installed certificate authorities, use a production deploy or an HTTPS tunnel instead.

### Run the quality gates

```bash
docker compose run --rm app corepack pnpm typecheck
docker compose run --rm app corepack pnpm lint
docker compose run --rm app corepack pnpm test:coverage
docker compose run --rm --service-ports app corepack pnpm e2e
```

### VS Code Dev Container

If you use VS Code, reopen the repo in the provided `.devcontainer/` setup. It uses the same Docker service and installs dependencies inside the container after creation.
