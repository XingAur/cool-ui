# Toast

Toast is a feedback-overlays component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolToast` | `CoolToast` | `CoolToast` | `<cool-toast>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolToast(.init(label: "Toast", accessibilityLabel: "Toast"))
```

```kotlin
CoolToast(props = CoolComponentProps(label = "Toast"))
```

```html
<cool-toast label="Toast" accessibility-label="Toast" />
```
