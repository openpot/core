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
