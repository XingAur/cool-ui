# Changelog

All notable changes to cooL UI are documented here. The project follows Semantic Versioning and synchronizes native package versions with Changesets.

## 0.2.0

- Added controlled MonthCalendar implementations, extreme-state Catalog fixtures, and typed customization slots on SwiftUI, Compose, ArkUI, and WeChat.
- Replaced the WeChat Button shell with a native `<button>` and capability passthrough; this is a deliberate 0.x breaking improvement for DOM, form, and native event behavior.
- Made WeChat TabBar and SegmentedControl controlled components whose events request parent-owned state updates.
- Established `contracts/release.json` and the canonical release pipeline as the single version source for generated packages, Catalogs, local artifacts, and documentation.
- Corrected ArkUI ARGB channel parsing and selected-day contrast behavior.
- Kept 0.2.0 local-only and not published to public npm, Maven Central, OHPM, or other registries.

## 0.1.0

- Established DTCG tokens and four native generation targets.
- Added the initial 42-component cross-platform contract and Catalogs.
- Added local-only packaging, SBOM, license and checksum verification.
