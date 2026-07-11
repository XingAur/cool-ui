# GlassGroup

GlassGroup 属于 foundations 组件。组件契约统一几何与语义，各端实现保留平台原生行为。

## 四端 API 对照

| SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- |
| `CoolGlassGroup` | `CoolGlassGroup` | `CoolGlassGroup` | `<cool-glass-group>` |

成熟度：SwiftUI **planned**、Compose **planned**、ArkUI **planned**、微信小程序 **planned**。

## 状态矩阵

| 状态 | SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- | --- |
| display | planned | planned | planned | planned |

## 可访问性

请提供本地化无障碍标签。标为 beta 或 planned 的能力仍需完成仓库就绪度矩阵列出的平台验证。

## 示例

```swift
CoolGlassGroup(/* 类型安全的平台参数 */)
```

```kotlin
CoolGlassGroup(/* 类型安全的平台参数 */)
```

```html
<cool-glass-group label="GlassGroup" accessibility-label="GlassGroup" />
```
