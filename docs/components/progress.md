# Progress

Progress is a content component. Its contract aligns geometry and semantics while each implementation preserves platform-native behavior.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolProgress` | `CoolProgress` | `CoolProgress` | `<cool-progress>` |

Maturity: SwiftUI **planned**, Compose **planned**, ArkUI **planned**, WeChat **planned**.

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | planned | planned | planned | planned |

## Accessibility

Provide a localized accessibility label. Beta and planned capabilities still require the platform verification listed in the repository readiness matrix.

## Examples

```swift
CoolProgress(/* typed platform parameters */)
```

```kotlin
CoolProgress(/* typed platform parameters */)
```

```html
<cool-progress label="Progress" accessibility-label="Progress" />
```
