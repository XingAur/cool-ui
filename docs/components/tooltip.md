# Tooltip

Tooltip is a feedback-overlays component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolTooltip` | `CoolTooltip` | `CoolTooltip` | `<cool-tooltip>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolTooltip(.init(label: "Tooltip", accessibilityLabel: "Tooltip"))
```

```kotlin
CoolTooltip(props = CoolComponentProps(label = "Tooltip"))
```

```html
<cool-tooltip label="Tooltip" accessibility-label="Tooltip" />
```
