# Divider

Divider is a foundations component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolDivider` | `CoolDivider` | `CoolDivider` | `<cool-divider>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolDivider(.init(label: "Divider", accessibilityLabel: "Divider"))
```

```kotlin
CoolDivider(props = CoolComponentProps(label = "Divider"))
```

```html
<cool-divider label="Divider" accessibility-label="Divider" />
```
