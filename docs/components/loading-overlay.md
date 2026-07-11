# LoadingOverlay

LoadingOverlay is a feedback-overlays component. Its contract aligns geometry and semantics while each implementation preserves platform-native behavior.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolLoadingOverlay` | `CoolLoadingOverlay` | `CoolLoadingOverlay` | `<cool-loading-overlay>` |

Maturity: SwiftUI **planned**, Compose **planned**, ArkUI **planned**, WeChat **planned**.

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | planned | planned | planned | planned |

## Accessibility

Provide a localized accessibility label. Beta and planned capabilities still require the platform verification listed in the repository readiness matrix.

## Examples

```swift
CoolLoadingOverlay(/* typed platform parameters */)
```

```kotlin
CoolLoadingOverlay(/* typed platform parameters */)
```

```html
<cool-loading-overlay label="LoadingOverlay" accessibility-label="LoadingOverlay" />
```
