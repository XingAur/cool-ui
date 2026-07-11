# BottomSheet

BottomSheet is a feedback-overlays component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolBottomSheet` | `CoolBottomSheet` | `CoolBottomSheet` | `<cool-bottom-sheet>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| default | Supported | Supported | Supported | Supported |
| pressed | Supported | Supported | Supported | Supported |
| focused | Supported | Supported | Supported | Supported |
| selected | Supported | Supported | Supported | Supported |
| disabled | Supported | Supported | Supported | Supported |
| loading | Supported | Supported | Supported | Supported |
| error | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolBottomSheet(.init(label: "BottomSheet", accessibilityLabel: "BottomSheet"))
```

```kotlin
CoolBottomSheet(props = CoolComponentProps(label = "BottomSheet"))
```

```html
<cool-bottom-sheet label="BottomSheet" accessibility-label="BottomSheet" />
```
