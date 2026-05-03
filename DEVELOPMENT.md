# Technical Development Guide

This guide covers the technical setup and architecture for developers looking to modify or extend the Openpot Secure Timer.

## 🛠 Prerequisites

Ensure you have the following installed:
- **Node.js**: v20.0.0 or higher
- **pnpm**: v10.10.0 or higher (required)
- **Local IP**: For mobile PWA testing, you'll need your machine's LAN IP.

## 🏗 Base Setup

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```
2. **Local Dev Server**:
   ```bash
   pnpm dev
   ```
   The application will be available at `http://localhost:3000`.

## 📱 PWA & Mobile Debugging

Since PWAs require a Secure Context (HTTPS) for installation, we provide a custom script to generate local certificates and serve the app over LAN.

1. **Generate Certs & Start**:
   ```bash
   OPENPOT_DEV_HOST=<your-lan-ip> pnpm dev:https
   ```
2. **Trust the CA**: Open `.certs/openpot-local-dev-ca.crt` on your mobile device and install it as a Trusted Root Certificate.
3. **Browse**: Go to `https://<your-lan-ip>:3000`.

## 🧬 Architecture

### Local Persistence
We use **IndexedDB** for all session data. There is no central database. If you clear your browser's site data, your session history will be lost. This is intentional for privacy.

### Service Workers
The application uses a Service Worker (found in `public/sw.js`) to handle asset caching and provide "New version available" prompts. During development, you may need to force a refresh (Cmd+Shift+R) to see changes to the Service Worker logic.

## 🧪 Testing

We use **Vitest** for unit tests and **Playwright** for E2E tests.

### Running Unit Tests
```bash
pnpm test
```

### Running E2E Tests
```bash
pnpm e2e
```
*Note: The test runner will automatically start a production build of the server. No manual server start is required.*

## 🔒 Security Principles

1. **Self-Contained**: No external CDNs. All assets (fonts, icons, scripts) must be bundled locally.
2. **Minimal Surface**: Only use dependencies that are strictly necessary and audited for privacy.
3. **Zero Telemetry**: Do not add any analytics or "ping-home" functionality.
