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

### Run the quality gates

```bash
docker compose run --rm app corepack pnpm typecheck
docker compose run --rm app corepack pnpm lint
docker compose run --rm app corepack pnpm test:coverage
docker compose run --rm --service-ports app corepack pnpm e2e
```

### VS Code Dev Container

If you use VS Code, reopen the repo in the provided `.devcontainer/` setup. It uses the same Docker service and installs dependencies inside the container after creation.
