# Openpot Secure Timer 🛡️

A premium, privacy-first, zero-knowledge session tracker built for sovereignty and anonymity. Openpot is designed to stay mathematically invisible and legally sovereign by keeping all user data strictly on-device.

![Openpot Banner](public/icon-512.png)

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

- Node.js 18+
- pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/openpot/openpot.git
   cd openpot/core
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

Openpot uses a "Git-Lite" containerized deployment workflow. It builds a secure, hardened Nginx Docker image locally and pushes it to the GitHub Container Registry (GHCR), which can then be automatically deployed by platforms like Koyeb.

1. Ensure you have Docker installed and are authenticated with GHCR:
   ```bash
   echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```
2. Run the deployment script:
   ```bash
   ./scripts/deploy-prod.sh
   ```
3. Your chosen hosting platform (e.g., Koyeb) will detect the updated `:latest` tag and redeploy automatically.

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
