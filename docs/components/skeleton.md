# Skeleton

Skeleton is a content component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolSkeleton` | `CoolSkeleton` | `CoolSkeleton` | `<cool-skeleton>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolSkeleton(.init(label: "Skeleton", accessibilityLabel: "Skeleton"))
```

```kotlin
CoolSkeleton(props = CoolComponentProps(label = "Skeleton"))
```

```html
<cool-skeleton label="Skeleton" accessibility-label="Skeleton" />
```
