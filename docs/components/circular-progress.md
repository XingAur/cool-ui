# CircularProgress

CircularProgress is a content component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolCircularProgress` | `CoolCircularProgress` | `CoolCircularProgress` | `<cool-circular-progress>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolCircularProgress(.init(label: "CircularProgress", accessibilityLabel: "CircularProgress"))
```

```kotlin
CoolCircularProgress(props = CoolComponentProps(label = "CircularProgress"))
```

```html
<cool-circular-progress label="CircularProgress" accessibility-label="CircularProgress" />
```
