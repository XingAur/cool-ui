# NavigationRail

NavigationRail is a navigation component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolNavigationRail` | `CoolNavigationRail` | `CoolNavigationRail` | `<cool-navigation-rail>` |

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
CoolNavigationRail(.init(label: "NavigationRail", accessibilityLabel: "NavigationRail"))
```

```kotlin
CoolNavigationRail(props = CoolComponentProps(label = "NavigationRail"))
```

```html
<cool-navigation-rail label="NavigationRail" accessibility-label="NavigationRail" />
```
