# NavigationRail

NavigationRail 属于 navigation 组件。组件契约统一几何与语义，各端实现保留平台原生行为。

## 四端 API 对照

| SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- |
| `CoolNavigationRail` | `CoolNavigationRail` | `CoolNavigationRail` | `<cool-navigation-rail>` |

成熟度：SwiftUI **planned**、Compose **planned**、ArkUI **planned**、微信小程序 **planned**。

## 状态矩阵

| 状态 | SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- | --- |
| default | planned | planned | planned | planned |
| pressed | planned | planned | planned | planned |
| focused | planned | planned | planned | planned |
| selected | planned | planned | planned | planned |
| disabled | planned | planned | planned | planned |
| loading | planned | planned | planned | planned |
| error | planned | planned | planned | planned |

## 可访问性

请提供本地化无障碍标签。标为 beta 或 planned 的能力仍需完成仓库就绪度矩阵列出的平台验证。

## 示例

```swift
CoolNavigationRail(/* 类型安全的平台参数 */)
```

```kotlin
CoolNavigationRail(/* 类型安全的平台参数 */)
```

```html
<cool-navigation-rail label="NavigationRail" accessibility-label="NavigationRail" />
```
