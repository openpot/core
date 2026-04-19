# Changelog

All notable changes to this project will be documented in this file.

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

[0.6.0]: https://github.com/openpot/openpot-secure-timer/compare/v0.5.0...v0.6.0
