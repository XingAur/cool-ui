# CoolUI for SwiftUI

Add `packages/swift` as a local Swift Package or use the repository URL after it is published. The package targets iOS/iPadOS 26 and uses SwiftUI Liquid Glass through `glassEffect` and `GlassEffectContainer`.

```swift
import CoolUI

CoolButton(.init(label: "Continue", tone: .accent, accessibilityLabel: "Continue")) { event in
  // Handle the controlled event.
}
```

Reduced Transparency automatically selects the solid tokenized surface.
