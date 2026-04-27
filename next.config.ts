import { execSync } from 'node:child_process';
import { networkInterfaces } from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

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

  // 2. Secondary: Koyeb/Vercel standard metadata (Absolute Source of Truth in Prod)
  if (process.env.KOYEB_GIT_SHA) {
    return process.env.KOYEB_GIT_SHA.slice(0, 7);
  }
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }

  // 3. Tertiary: Local Git lookup (Absolute Source of Truth in Dev)
  try {
    return execSync('git rev-parse --short HEAD 2>/dev/null').toString().trim();
  } catch (error) {
    // 4. Fallback: Persistent .build_version file (Manual Override/Fallback)
    const buildVersionPath = path.join(process.cwd(), '.build_version');
    if (fs.existsSync(buildVersionPath)) {
      try {
        return fs.readFileSync(buildVersionPath, 'utf8').trim().slice(0, 7);
      } catch (e) {
        console.warn('⚠️  Warning: Failed to read .build_version file.');
      }
    }
    
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

/**
 * PWA Configuration: Strict Privacy Directives
 * 1. register: false -> Disables automatic background updates.
 * 2. buildExcludes -> Only bundles necessary files.
 * 3. cacheOnFrontEndNav -> Ensures zero-ping navigation.
 */
const withPWA = withPWAInit({
  dest: 'public',
  register: false, // MANDATORY: Manual update control only
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false, // Privacy: No autonomous state changes when network returns
  disable: isDevelopment, // Disable in dev to prevent cache collisions
  workboxOptions: {
    skipWaiting: false, // MANDATORY: User must explicitly click "Apply" to reload
    cleanupOutdatedCaches: true, // Automatically purge stale build assets
    additionalManifestEntries: [
      { url: '/', revision: APP_VERSION },
      { url: '/about/', revision: APP_VERSION },
      { url: '/privacy/', revision: APP_VERSION },
      { url: '/terms/', revision: APP_VERSION },
      { url: '/feedback/', revision: APP_VERSION },
    ],
  },
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
  // Headers are disabled in 'export' mode, moved to vercel.json for production
};

export default withPWA(nextConfig);
