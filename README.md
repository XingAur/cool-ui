# cooL UI

[中文](README.zh-CN.md)

cooL UI is an Apache-2.0 multi-package UI library for perceptually consistent glass interfaces on SwiftUI, Jetpack Compose, ArkUI, and native WeChat Mini Programs. One DTCG token source drives color, spacing, radius, blur, lighting, shadow, typography, and motion output for all four platforms.

The goal is shared geometry, semantic color, state, and motion rhythm—not pixel-identical rendering. Each target keeps its native typography, symbols, controls, accessibility model, presentation APIs, and blur pipeline.

## Current status

Version `0.1.0` is an alpha snapshot and is intentionally not published to public registries. The old runtime string renderer has been removed from SwiftUI and Compose. ArkUI now selects native primitives during generation rather than routing every API through one runtime switch. WeChat inputs use native controls, and dialog/sheet components have controlled overlay and dismissal semantics.

All component maturity values remain `planned` until the relevant native compile, behavioral, accessibility, Catalog smoke, and golden-image gates pass. Passing Node source-contract tests alone is not presented as native-platform verification.

| Target | Implementation | Required verification before stable |
| --- | --- | --- |
| SwiftUI | 42 named, type-safe APIs; native `Binding`, `Button`, `TabView`, alerts, sheets, popovers, `glassEffect`, and `GlassEffectContainer` | Xcode 26 compile/UI tests, accessibility audit, simulator goldens |
| Compose | Typed controlled inputs/actions and Material navigation/presentation APIs; background-only `RenderEffect` in `CoolBackdrop` | Android CI compile/UI tests, screenshot and performance regression |
| ArkUI | 42 generated API names with generation-time native primitive selection | DevEco/HarmonyOS 6 HAR build, typed API expansion, Hypium and Catalog smoke |
| WeChat | 42 native custom-component tags, native form controls, controlled events, reduced-transparency fallback, dialog/sheet overlays | WeChat DevTools smoke, focus/reader checks, visual goldens |

cooL UI is a component library inspired by SwiftUI's compositional API style. It does **not** and cannot copy all of SwiftUI: navigation stacks, layout protocol internals, environment propagation, platform lifecycle, every modifier, and Apple-private rendering are outside this package's scope.

## Packages

- `@cool-ui/tokens` — DTCG source and generated Swift, Kotlin, ArkTS, WXSS, and CSS tokens.
- `@cool-ui/wechat` — native WeChat custom components for base library 3.14.3+.
- `CoolUI` — Swift Package for iOS/iPadOS 26+.
- `dev.coolui:coolui-compose` — Compose library for Android API 31+.
- `@cool-ui/arkui` — HarmonyOS 6 HAR/ohpm package.

## Install locally

Swift Package Manager can consume the repository root directly:

```swift
.package(url: "https://github.com/XingAur/cool-ui.git", branch: "main")
```

For npm artifacts and native local repositories:

```bash
pnpm install
pnpm generate
pnpm test
pnpm pack:local
pnpm artifacts
```

Public registry publication is deliberately absent from these commands. Local outputs are written under `artifacts/`; `native-validation.json` records which native toolchains were actually available.

## Repository map

- `contracts/` — component, icon, accessibility, and performance contracts.
- `packages/tokens/` — the only visual-token source and generators.
- `packages/swift/`, `packages/android/`, `packages/arkui/`, `packages/wechat/` — platform implementations.
- `apps/catalog-*` — native component Catalogs.
- `docs/components/` and `docs/zh/components/` — generated bilingual component references.
- `examples/` — local npm and Swift consumers.

Use Node 22, pnpm 10, JDK 17/Android SDK 31 and 36, Xcode 26/Swift 6.2, and a non-beta HarmonyOS 6 DevEco toolchain as applicable.

## Glass implementation

SwiftUI uses Apple-provided Liquid Glass APIs. Compose applies `RenderEffect` only to the background supplied to `CoolBackdrop`; `CoolGlassSurface` uses a translucent tonal surface so text and controls are never blurred with their own container. ArkUI and WeChat use their platform backdrop capabilities and fall back to an opaque semantic surface when transparency is reduced.

Avoid nesting arbitrary real-time blur nodes. Put related surfaces in one `CoolGlassGroup` and provide a shared backdrop. Performance or accessibility policy may select `solidFallback`.

## Independence notice

cooL UI is independent and is not affiliated with Apple Inc., Google LLC, Huawei, or Tencent. Liquid Glass, SwiftUI, SF Symbols, Material Symbols, HarmonyOS, WeChat, and other platform names belong to their respective owners. The project does not copy or redistribute proprietary platform assets.

Licensed under Apache-2.0.
