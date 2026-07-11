# cooL UI

cooL UI is a multi-package monorepo for perceptually consistent, platform-native glass interfaces on SwiftUI, Jetpack Compose, ArkUI and native WeChat Mini Programs.

The project aligns geometry, semantic color, interaction states and motion rhythm. It intentionally keeps platform typography, symbols, blur pipelines and interaction conventions instead of promising pixel-identical RGBA output.

## Packages

- `@cool-ui/tokens` — the DTCG source and generated native tokens.
- `@cool-ui/wechat` — native custom components for WeChat base library 3.14.3+.
- `CoolUI` — a Swift Package for iOS/iPadOS 26+.
- `dev.coolui:coolui-compose` — a Compose library for Android API 31+.
- `@cool-ui/arkui` — a HarmonyOS 6 HAR/ohpm package.

This repository is pre-release. Registry publication is intentionally disabled from the normal build; `pnpm pack:local` creates consumer-test artifacts only.

## Development

Use Node 22 and pnpm 10, then run `pnpm install`, `pnpm tokens:generate` and `pnpm test`. Platform Catalogs live in `apps/`.

## Independence notice

cooL UI is an independent open-source project and is not affiliated with Apple Inc. Liquid Glass, SwiftUI, SF Symbols and other platform names belong to their respective owners. cooL UI does not copy or redistribute Apple private assets.

Licensed under Apache-2.0.
