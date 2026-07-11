# List

List is a content component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolList` | `CoolList` | `CoolList` | `<cool-list>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolList(.init(label: "List", accessibilityLabel: "List"))
```

```kotlin
CoolList(props = CoolComponentProps(label = "List"))
```

```html
<cool-list label="List" accessibility-label="List" />
```
