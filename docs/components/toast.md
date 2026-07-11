# Toast

Toast is a feedback-overlays component. Its contract aligns geometry and semantics while each implementation preserves platform-native behavior.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolToast` | `CoolToast` | `CoolToast` | `<cool-toast>` |

Maturity: SwiftUI **planned**, Compose **planned**, ArkUI **planned**, WeChat **planned**.

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | planned | planned | planned | planned |

## Accessibility

Provide a localized accessibility label. Beta and planned capabilities still require the platform verification listed in the repository readiness matrix.

## Examples

```swift
CoolToast(/* typed platform parameters */)
```

```kotlin
CoolToast(/* typed platform parameters */)
```

```html
<cool-toast label="Toast" accessibility-label="Toast" />
```
