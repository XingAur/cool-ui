# ThemeProvider

ThemeProvider is a foundations component. Its contract aligns geometry and semantics while each implementation preserves platform-native behavior.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolThemeProvider` | `CoolThemeProvider` | `CoolThemeProvider` | `<cool-theme-provider>` |

Maturity: SwiftUI **planned**, Compose **planned**, ArkUI **planned**, WeChat **planned**.

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | planned | planned | planned | planned |

## Accessibility

Provide a localized accessibility label. Beta and planned capabilities still require the platform verification listed in the repository readiness matrix.

## Examples

```swift
CoolThemeProvider(/* typed platform parameters */)
```

```kotlin
CoolThemeProvider(/* typed platform parameters */)
```

```html
<cool-theme-provider label="ThemeProvider" accessibility-label="ThemeProvider" />
```
