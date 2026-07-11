# Tooltip

Tooltip is a feedback-overlays component. Its contract aligns geometry and semantics while each implementation preserves platform-native behavior.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolTooltip` | `CoolTooltip` | `CoolTooltip` | `<cool-tooltip>` |

Maturity: SwiftUI **planned**, Compose **planned**, ArkUI **planned**, WeChat **planned**.

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | planned | planned | planned | planned |

## Accessibility

Provide a localized accessibility label. Beta and planned capabilities still require the platform verification listed in the repository readiness matrix.

## Examples

```swift
CoolTooltip(/* typed platform parameters */)
```

```kotlin
CoolTooltip(/* typed platform parameters */)
```

```html
<cool-tooltip label="Tooltip" accessibility-label="Tooltip" />
```
