# Backdrop

Backdrop is a foundations component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolBackdrop` | `CoolBackdrop` | `CoolBackdrop` | `<cool-backdrop>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolBackdrop(.init(label: "Backdrop", accessibilityLabel: "Backdrop"))
```

```kotlin
CoolBackdrop(props = CoolComponentProps(label = "Backdrop"))
```

```html
<cool-backdrop label="Backdrop" accessibility-label="Backdrop" />
```
