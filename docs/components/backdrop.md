# Backdrop

Backdrop is a foundations component. Its contract aligns geometry and semantics while each implementation preserves platform-native behavior.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolBackdrop` | `CoolBackdrop` | `CoolBackdrop` | `<cool-backdrop>` |

Maturity: SwiftUI **planned**, Compose **planned**, ArkUI **planned**, WeChat **planned**.

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | planned | planned | planned | planned |

## Accessibility

Provide a localized accessibility label. Beta and planned capabilities still require the platform verification listed in the repository readiness matrix.

## Examples

```swift
CoolBackdrop(/* typed platform parameters */)
```

```kotlin
CoolBackdrop(/* typed platform parameters */)
```

```html
<cool-backdrop label="Backdrop" accessibility-label="Backdrop" />
```
