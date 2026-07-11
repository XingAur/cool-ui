# ThemeProvider

ThemeProvider is a foundations component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolThemeProvider` | `CoolThemeProvider` | `CoolThemeProvider` | `<cool-theme-provider>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolThemeProvider(.init(label: "ThemeProvider", accessibilityLabel: "ThemeProvider"))
```

```kotlin
CoolThemeProvider(props = CoolComponentProps(label = "ThemeProvider"))
```

```html
<cool-theme-provider label="ThemeProvider" accessibility-label="ThemeProvider" />
```
