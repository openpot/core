import { execSync } from 'node:child_process';
import { networkInterfaces } from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import type { NextConfig } from 'next';
import withSerwistInit from "@serwist/next";

const isDevelopment = process.env.NODE_ENV !== 'production';

// Versioning for Cache Control
const getPackageVersion = () => {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    return pkg.version;
  } catch {
    return '0.7.0';
  }
};

const getCommitHash = () => {
  // 1. Priority: Explicit BUILD_HASH from deployment script environment
  if (process.env.BUILD_HASH) {
    return process.env.BUILD_HASH.slice(0, 7);
  }

  // 2. Secondary: CI/CD standard metadata (e.g., KOYEB_GIT_SHA)
  if (process.env.KOYEB_GIT_SHA) {
    return process.env.KOYEB_GIT_SHA.slice(0, 7);
  }

  // 3. Tertiary: Local Git lookup (Absolute Source of Truth in Dev)
  try {
    return execSync('git rev-parse --short HEAD 2>/dev/null').toString().trim();
  } catch (error) {
    console.warn('⚠️  Warning: All build hash retrieval methods failed. Defaulting to "prod".');
    return 'prod';
  }
};

const packageVersion = getPackageVersion();
const commitHash = getCommitHash();
const APP_VERSION = `v${packageVersion}-${commitHash}`;
console.log(`\n📦 Building Openpot [${APP_VERSION}]\n`);
if (!isDevelopment) {
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(
      path.join(publicDir, 'version.json'),
      JSON.stringify({ version: APP_VERSION, timestamp: Date.now() }, null, 2)
    );
  }
}

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  register: false, // MANDATORY: Manual update control only
  disable: isDevelopment, // Disable in dev to prevent cache collisions
  additionalPrecacheEntries: [
    { url: "/", revision: APP_VERSION },
    { url: "/about/", revision: APP_VERSION },
    { url: "/privacy/", revision: APP_VERSION },
    { url: "/terms/", revision: APP_VERSION },
    { url: "/feedback/", revision: APP_VERSION },
  ],
});

const scriptSources = ["'self'", "'unsafe-inline'"];
const localDevOrigins = Array.from(
  new Set([
    'localhost',
    '127.0.0.1',
    ...Object.values(networkInterfaces()).flatMap((entry) =>
      (entry ?? [])
        .filter((network) => network.family === 'IPv4' && !network.internal)
        .map((network) => network.address),
    ),
  ]),
);

if (isDevelopment) {
  scriptSources.push("'unsafe-eval'");
}

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSources.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDevelopment ? ' ws: wss:' : ''}`,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  outputFileTracingRoot: process.cwd(),
  env: {
    NEXT_PUBLIC_APP_VERSION: APP_VERSION,
  },
  allowedDevOrigins: isDevelopment ? localDevOrigins : undefined,
  // Headers are managed by the web server (e.g., Nginx) in 'export' mode
};

export default withSerwist(nextConfig);
