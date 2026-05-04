export interface Release {
  version: string;
  title: string;
  date: string;
  changes: string[];
}

export const RELEASES: Release[] = [
  {
    version: 'v0.16.0',
    title: 'The Hardening Sync',
    date: '2026-05-04',
    changes: [
      'Security Hardening: Implemented robust path traversal protection and URL decoding validation in the HTTPS server.',
      'Hook Optimization: Re-engineered Network Settings with memoized handlers and corrected synchronization hooks.',
      'Premium Landing: Finalized the privacy-first community signup and standardized documentation footer.',
      'CI/CD Stability: Resolved blocking linting errors and standardized the production deployment pipeline.'
    ]
  },
  {
    version: 'v0.14.0',
    title: 'The Brand Unification Sync',
    date: '2026-05-04',
    changes: [
      'Visual Identity: Synchronized Openpot branding across the landing page and PWA with a unified design system.',
      'Community Launch: Integrated a privacy-first community signup mechanism and redirected documentation to GitHub.',
      'Carousel Showcase: Added an interactive carousel featuring high-fidelity app walkthroughs and feature spotlights.'
    ]
  },
  {
    version: 'v0.13.0',
    title: 'The Automated Release Sync',
    date: '2026-05-04',
    changes: [
      'CI Automation: Fully automated GitHub releases and version management within the deployment pipeline.',
      'Registry Standardization: Aligned package naming conventions across GHCR for consistent image management.'
    ]
  },
  {
    version: 'v0.12.0',
    title: 'The Transparency Sync',
    date: '2026-05-04',
    changes: [
      'Release Visibility: Implemented the "Recent Release Notes" viewer and real-time version status monitoring.',
      'Installation Tracking: Added local installation timestamping to track session history across updates.'
    ]
  },
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
