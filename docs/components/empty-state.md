# EmptyState

EmptyState is a content component. Its contract aligns geometry and semantics while each implementation preserves platform-native behavior.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolEmptyState` | `CoolEmptyState` | `CoolEmptyState` | `<cool-empty-state>` |

Maturity: SwiftUI **planned**, Compose **planned**, ArkUI **planned**, WeChat **planned**.

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | planned | planned | planned | planned |

## Accessibility

Provide a localized accessibility label. Beta and planned capabilities still require the platform verification listed in the repository readiness matrix.

## Examples

```swift
CoolEmptyState(/* typed platform parameters */)
```

```kotlin
CoolEmptyState(/* typed platform parameters */)
```

```html
<cool-empty-state label="EmptyState" accessibility-label="EmptyState" />
```
