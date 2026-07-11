# FloatingActionButton

FloatingActionButton is a actions-inputs component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| `CoolFloatingActionButton` | `CoolFloatingActionButton` | `CoolFloatingActionButton` | `<cool-floating-action-button>` |

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
CoolFloatingActionButton(.init(label: "FloatingActionButton", accessibilityLabel: "FloatingActionButton"))
```

```kotlin
CoolFloatingActionButton(props = CoolComponentProps(label = "FloatingActionButton"))
```

```html
<cool-floating-action-button label="FloatingActionButton" accessibility-label="FloatingActionButton" />
```
