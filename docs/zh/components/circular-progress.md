# CircularProgress

CircularProgress 属于 content 组件，四端共享几何与语义行为，并通过各平台原生能力渲染。

## 四端 API 对照

| SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- |
| `CoolCircularProgress` | `CoolCircularProgress` | `CoolCircularProgress` | `<cool-circular-progress>` |

## 状态矩阵

| 状态 | SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- | --- |
| display | Supported | Supported | Supported | Supported |

## 可访问性

请提供本地化无障碍标签。组件保留平台读屏与键盘语义，并支持统一触控目标、动态字体或平台字体缩放、减少动画、降低透明度和高对比度。

## 示例

```swift
CoolCircularProgress(.init(label: "CircularProgress", accessibilityLabel: "CircularProgress"))
```

```kotlin
CoolCircularProgress(props = CoolComponentProps(label = "CircularProgress"))
```

```html
<cool-circular-progress label="CircularProgress" accessibility-label="CircularProgress" />
```
