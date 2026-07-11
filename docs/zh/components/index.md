# cooL UI 组件

所有组件遵循共享的命名和状态契约。SwiftUI、Compose 与 ArkUI API 统一使用 `Cool` 前缀，微信组件使用 `cool-` 标签前缀。

## 四端 API 对照

| 规范名 | SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- | --- |
| Button | `CoolButton` | `CoolButton` | `CoolButton` | `<cool-button>` |
| GlassSurface | `CoolGlassSurface` | `CoolGlassSurface` | `CoolGlassSurface` | `<cool-glass-surface>` |
| ThemeProvider | `CoolThemeProvider` | `CoolTheme` | `CoolThemeProvider` | `<cool-theme-provider>` |

## 状态矩阵

交互组件覆盖默认、按下、聚焦、选中、禁用、加载和错误状态。值由使用方控制，变化通过平台原生事件返回。

## 可访问性

所有交互组件提供无障碍标签、原生焦点语义和平台最小触控目标，并支持动态字体、读屏、键盘焦点、减少动画、降低透明度和高对比度。

## 图标映射

统一语义图标会分别映射到 SF Symbols、Material Symbols、HarmonyOS Symbols 与 Lucide，不重新分发平台专有素材。
