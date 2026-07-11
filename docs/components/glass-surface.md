# GlassSurface

GlassSurface is a foundations component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolGlassSurface` | `CoolGlassSurface` | `CoolGlassSurface` | `<cool-glass-surface>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolGlassSurface(.init(label: "GlassSurface", accessibilityLabel: "GlassSurface"))
```

```kotlin
CoolGlassSurface(props = CoolComponentProps(label = "GlassSurface"))
```

```html
<cool-glass-surface label="GlassSurface" accessibility-label="GlassSurface" />
```
