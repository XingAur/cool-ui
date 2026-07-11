# EmptyState

EmptyState is a content component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolEmptyState` | `CoolEmptyState` | `CoolEmptyState` | `<cool-empty-state>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolEmptyState(.init(label: "EmptyState", accessibilityLabel: "EmptyState"))
```

```kotlin
CoolEmptyState(props = CoolComponentProps(label = "EmptyState"))
```

```html
<cool-empty-state label="EmptyState" accessibility-label="EmptyState" />
```
