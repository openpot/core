import { execSync } from 'node:child_process';
import { networkInterfaces } from 'node:os';
import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV !== 'production';
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

const getCommitHash = () => {
  // Use Vercel's provided SHA if available (preferred for CI)
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  
  try {
    return execSync('git rev-parse --short HEAD 2>/dev/null').toString().trim();
  } catch {
    return 'dev';
  }
};

const commitHash = getCommitHash();
const packageVersion = process.env.npm_package_version || '0.2.0';

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  env: {
    NEXT_PUBLIC_APP_VERSION: `v${packageVersion}-${commitHash}`,
  },
  allowedDevOrigins: isDevelopment ? localDevOrigins : undefined,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
