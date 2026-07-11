# CoolUI for SwiftUI

Add the repository root as a Swift Package dependency. The package targets iOS/iPadOS 26 and uses SwiftUI Liquid Glass through `glassEffect` and `GlassEffectContainer`.

```swift
import CoolUI

CoolButton("Continue", tone: .accent) { submit() }

CoolTextField("Name", text: $name, prompt: "Required")
```

Reduced Transparency automatically selects the solid tokenized surface. The root `Package.swift` is the supported remote-install manifest; the nested manifest remains useful for platform-local development.
