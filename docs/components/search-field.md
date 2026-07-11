# SearchField

SearchField is a actions-inputs component. Its contract aligns geometry and semantics while each implementation preserves platform-native behavior.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolSearchField` | `CoolSearchField` | `CoolSearchField` | `<cool-search-field>` |

Maturity: SwiftUI **planned**, Compose **planned**, ArkUI **planned**, WeChat **planned**.

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| default | planned | planned | planned | planned |
| pressed | planned | planned | planned | planned |
| focused | planned | planned | planned | planned |
| selected | planned | planned | planned | planned |
| disabled | planned | planned | planned | planned |
| loading | planned | planned | planned | planned |
| error | planned | planned | planned | planned |

## Accessibility

Provide a localized accessibility label. Beta and planned capabilities still require the platform verification listed in the repository readiness matrix.

## Examples

```swift
CoolSearchField(/* typed platform parameters */)
```

```kotlin
CoolSearchField(/* typed platform parameters */)
```

```html
<cool-search-field label="SearchField" accessibility-label="SearchField" />
```
