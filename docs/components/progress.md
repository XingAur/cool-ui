# Progress

Progress is a content component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolProgress` | `CoolProgress` | `CoolProgress` | `<cool-progress>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolProgress(.init(label: "Progress", accessibilityLabel: "Progress"))
```

```kotlin
CoolProgress(props = CoolComponentProps(label = "Progress"))
```

```html
<cool-progress label="Progress" accessibility-label="Progress" />
```
