# Changelog

All notable changes to this project will be documented in this file.

## [0.9.0] - 2026-04-27

### Added
- **Unified Branding**: Standardized all project identity under "Openpot Secure Session Tracker" across all documentation and metadata.
- **Professional Documentation**: Elevated `CONTRIBUTING.md`, `DEVELOPMENT.md`, and `NOTICE.md` to the highest open-source standards.
- **Visual README**: Integrated high-fidelity screenshots of the "Stuttgart-Safe" experience directly into the main documentation.
- **CanG Compliance Header**: Added explicit "CanG COMPLIANCE" context to the Monthly Quota card.

### Changed
- **Vercel Decoupling**: Completely removed all hosting-specific configuration files and logic to ensure 100% independence and sovereignty.
- **Hosting-Agnostic Metadata**: Re-engineered build hash retrieval to prioritize local Git and generic CI/CD environment variables.

### Fixed
- **Placeholder Alignment**: Updated dashboard examples (e.g., "Purple Rain") to perfectly align with the mission statement.

## [0.8.0] - 2026-04-21

### Added
- **Zero-Commit Master Sync**: Re-engineered versioning architecture using real-time Git metadata for 1:1 parity between local and production environments.
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

[0.9.0]: https://github.com/openpot/openpot-secure-session-tracker/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/openpot/openpot-secure-session-tracker/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/openpot/openpot-secure-session-tracker/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/openpot/openpot-secure-session-tracker/compare/v0.5.0...v0.6.0
