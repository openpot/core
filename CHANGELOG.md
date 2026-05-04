# Changelog

All notable changes to this project will be documented in this file.

## [0.9.0] - 2026-05-04

### Added
- **Automated CI/CD Pipeline**: Integrated GitHub Actions for automated Docker builds, GHCR pushes, and Koyeb redeployments.
- **Lockfile Hardening**: Switched to enforced `--frozen-lockfile` in CI to ensure 100% reproducible builds and dependency security.
- **Open-Source Readiness**: Finalized documentation, contribution guidelines, and community templates for public launch.

### Changed
- **Deployment Workflow**: Transitioned from manual local deployments to a fully automated cloud-native pipeline.

## [0.8.0] - 2026-04-21

### Added
- **Zero-Commit Master Sync**: Re-engineered versioning architecture using real-time Git/Vercel metadata for 1:1 parity between local and production environments.
- **PWA Update Hardening**: Implemented `controllerchange` event synchronization for the "Apply & Reload" workflow, eliminating "zombie" cache reloads.
- **Enhanced Quota Precision**: Upgraded the Monthly Quota card to 3-decimal precision for granular weight tracking.
- **Master Deployment Pipeline**: Automated GitHub propagation in `deploy.sh` for seamless local-to-production releases.

### Fixed
- **Weight Scaling Bug**: Resolved the double-conversion error where milligram doses were incorrectly down-scaled during monthly aggregation.
- **Versioning Lag**: Eliminated the "one version behind" gap by prioritizing real-time repository state over static build files.

## [0.7.0] - 2026-04-20

### Added
- **Persistent Build Identification**: Introduced the `.build_version` Source of Truth to bridge Git-less environments (Vercel) with the local repository state.
- **Manual Network Controls**: Multi-stage release lifecycle giving users explicit control over network pings (Compare -> Pull -> Apply).

## [0.6.0] - 2026-04-19

### Added
- **PWA Reliability v2**: Fail-safe installation capture via global event scripts.
- **iOS Instructional Modal**: Custom guided workflow for Safari "Add to Home Screen" setup.
- **Platform-Aware Callbacks**: Native prompt support for Android/Edge with robust fallback messaging.
- **Session Scroll Reset**: Automatically resets history scroll position to its origin when a new session starts.

### Changed
- **Mobile Layout Hardening**: Transitioned session history to a robust CSS Grid layout preventing horizontal overflow and card growth.
- **Typographic Synchronization**: Standardized timestamp and metadata typography across the entire dashboard.
- **High-Density Spacing**: Increased vertical padding for tracking inputs and removed horizontal gaps for a tighter, premium feel.
- **Optimized PWA Visibility**: The installation banner now only appears when the browser is ready or on iOS, ensuring a reliable user interaction.

### Fixed
- Resolved `useRef` ReferenceError in the dashboard.
- Fixed `isDismissed` identifier duplication build error.
- Corrected PWA splash screen background color refresh logic via manifest versioning and cache busting.

---

[0.8.0]: https://github.com/openpot/openpot-secure-timer/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/openpot/openpot-secure-timer/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/openpot/openpot-secure-timer/compare/v0.5.0...v0.6.0
