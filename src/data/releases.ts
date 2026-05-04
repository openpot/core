export interface Release {
  version: string;
  title: string;
  date: string;
  changes: string[];
}

export const RELEASES: Release[] = [
  {
    version: 'v0.9.0',
    title: 'The Public Ready Sync',
    date: '2026-05-04',
    changes: [
      'Automated CI/CD Pipeline: Integrated GitHub Actions for automated Docker builds, GHCR pushes, and Koyeb redeployments.',
      'Lockfile Hardening: Switched to enforced --frozen-lockfile in CI to ensure 100% reproducible builds and dependency security.',
      'Open-Source Readiness: Finalized documentation, contribution guidelines, and community templates for public launch.'
    ]
  },
  {
    version: 'v0.8.0',
    title: 'The Master Sync Release',
    date: '2026-04-21',
    changes: [
      'Zero-Commit Master Sync: Re-engineered versioning architecture using real-time Git/Vercel metadata for parity.',
      'PWA Update Hardening: Implemented controllerchange event synchronization for the "Apply & Reload" workflow.',
      'High-Precision Weight Metrics: Upgraded Monthly Quota card to 3-decimal precision for granular tracking.',
      'Scaling Accuracy Fix: Resolved double-conversion weight calculations for milligram dose totals.'
    ]
  }
];
