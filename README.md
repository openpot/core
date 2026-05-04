# ![Openpot Banner](public/favicon.png) Openpot Secure Timer 🛡️

[![CI](https://github.com/openpot/core/actions/workflows/ci.yml/badge.svg)](https://github.com/openpot/core/actions/workflows/ci.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/openpot/core/pulls)
[![Standard: Stuttgart-Safe](https://img.shields.io/badge/Standard-Stuttgart--Safe-success)](SECURITY.md)

A premium, privacy-first, zero-knowledge session tracker built for sovereignty and anonymity. Openpot is designed to stay mathematically invisible and legally sovereign by keeping all user data strictly on-device.
Visit our official site at [openpot.co](https://openpot.co).

## ✨ Features

- **Privacy by Design**: No account creation, no tracking, and no remote data storage.
- **Zero-Knowledge State**: All session histories are stored locally in your browser's IndexedDB.
- **Progressive Web App (PWA)**: Install directly on your iOS/Android home screen or desktop for a native look and feel.
- **Offline-First**: Full functionality without an internet connection, powered by robust Service Workers.
- **Premium UI**: Sleek, minimalist interface with curated typographic hierarchy and seamless Light/Dark mode support.
- **Sovereign Sync**: Optional anonymous syncing via secure schema that avoids sharing behavioral metadata.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://next.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (Local-first)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Packaging**: [pnpm](https://pnpm.io/)

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.0.0 or higher
- **pnpm**: v10.10.0 or higher (required)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/openpot/core.git
   cd core
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 📱 Testing on Mobile (Local HTTPS)

To test the PWA installation experience on a mobile device, you must serve the application over HTTPS. Openpot includes a custom launcher for this:

1. Identify your local IP address (e.g., `192.168.1.5`).
2. Run the secure dev environment:
   ```bash
   OPENPOT_DEV_HOST=192.168.1.5 pnpm dev:https
   ```
3. Trust the generated CA found at `.certs/openpot-local-dev-ca.crt` on your mobile device.
4. Access the app via `https://192.168.1.5:3000`.

### 🚢 Production Deployment

Openpot follows a two-stage automated release process via GitHub Actions:
1. **CI & Versioning**: When changes are merged to `main`, the CI validates the build and automatically creates a **Version Bump PR**.
2. **Release Gate**: Merging the Version Bump PR triggers the final **Docker build**, push to **GHCR**, and redeploy on **Koyeb**.

For more details on the release pipeline, see [DEVELOPMENT.md](DEVELOPMENT.md).

For manual control, you can use the production build commands in `DEVELOPMENT.md`.

## 🛡️ Security & Privacy

Openpot follows the **Stuttgart-Safe** standard:
- No remote fonts or scripts.
- No telemetry or analytics.
- No behavior-sharing APIs.
- No third-party cookies or localStorage tracking.

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. We believe in software freedom—modifications to this software must remain open source.

---

Built with ❤️ for the sovereign community.
