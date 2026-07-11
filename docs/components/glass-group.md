# GlassGroup

GlassGroup is a foundations component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolGlassGroup` | `CoolGlassGroup` | `CoolGlassGroup` | `<cool-glass-group>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolGlassGroup(.init(label: "GlassGroup", accessibilityLabel: "GlassGroup"))
```

```kotlin
CoolGlassGroup(props = CoolComponentProps(label = "GlassGroup"))
```

```html
<cool-glass-group label="GlassGroup" accessibility-label="GlassGroup" />
```
