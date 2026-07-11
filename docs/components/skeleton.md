# Skeleton

Skeleton is a content component. Its contract aligns geometry and semantics while each implementation preserves platform-native behavior.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolSkeleton` | `CoolSkeleton` | `CoolSkeleton` | `<cool-skeleton>` |

Maturity: SwiftUI **planned**, Compose **planned**, ArkUI **planned**, WeChat **planned**.

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | planned | planned | planned | planned |

## Accessibility

Provide a localized accessibility label. Beta and planned capabilities still require the platform verification listed in the repository readiness matrix.

## Examples

```swift
CoolSkeleton(/* typed platform parameters */)
```

```kotlin
CoolSkeleton(/* typed platform parameters */)
```

```html
<cool-skeleton label="Skeleton" accessibility-label="Skeleton" />
```
