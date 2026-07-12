# CoolUI for SwiftUI

Version `0.2.0` exposes 43 components. The APIs remain `planned` until the native compile, accessibility, Catalog, and golden-image gates are complete.

Add a local checkout of the repository root as a SwiftPM dependency. The package targets iOS/iPadOS 26 and uses Apple Liquid Glass through `glassEffect` and `GlassEffectContainer`.

```swift
.package(path: "../cool-ui")
```

```swift
import CoolUI

CoolButton("Continue", tone: .accent) { submit() }

CoolTextField("Name", text: $name, prompt: "Required")
```

Reduced Transparency automatically selects the solid tokenized surface. The root `Package.swift` is the supported remote-install manifest; the nested manifest remains useful for platform-local development.
