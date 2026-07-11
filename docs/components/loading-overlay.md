# LoadingOverlay

LoadingOverlay is a feedback-overlays component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolLoadingOverlay` | `CoolLoadingOverlay` | `CoolLoadingOverlay` | `<cool-loading-overlay>` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

```swift
CoolLoadingOverlay(.init(label: "LoadingOverlay", accessibilityLabel: "LoadingOverlay"))
```

```kotlin
CoolLoadingOverlay(props = CoolComponentProps(label = "LoadingOverlay"))
```

```html
<cool-loading-overlay label="LoadingOverlay" accessibility-label="LoadingOverlay" />
```
