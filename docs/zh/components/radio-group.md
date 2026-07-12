# RadioGroup

RadioGroup 是 actions-inputs 类组件。组件契约统一几何和语义，各端实现保留平台原生行为。

## 四端 API 对照

| SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- |
| `CoolRadioGroup` | `CoolRadioGroup` | `CoolRadioGroup` | `<cool-radio-group>` |

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

## 无障碍

请提供本地化的无障碍标签。标为 beta 或 planned 的能力仍需完成仓库就绪度矩阵列出的原生平台验证。

## 示例

```swift
CoolRadioGroup(/* 类型安全的平台参数 */)
```

```kotlin
CoolRadioGroup(/* 类型安全的平台参数 */)
```

```html
<cool-radio-group label="RadioGroup" accessibility-label="RadioGroup" />
```
