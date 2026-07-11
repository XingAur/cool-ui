# StatTile

StatTile is a content component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolStatTile` | `CoolStatTile` | `CoolStatTile` | `<cool-stat-tile>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolStatTile(.init(label: "StatTile", accessibilityLabel: "StatTile"))
```

```kotlin
CoolStatTile(props = CoolComponentProps(label = "StatTile"))
```

```html
<cool-stat-tile label="StatTile" accessibility-label="StatTile" />
```
