# Badge

Badge is a content component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolBadge` | `CoolBadge` | `CoolBadge` | `<cool-badge>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolBadge(.init(label: "Badge", accessibilityLabel: "Badge"))
```

```kotlin
CoolBadge(props = CoolComponentProps(label = "Badge"))
```

```html
<cool-badge label="Badge" accessibility-label="Badge" />
```
