# cooL UI

[English](README.md)

cooL UI 是一个采用 Apache-2.0 许可证的多包单仓 UI 组件库，为 SwiftUI、Jetpack Compose、ArkUI 和原生微信小程序提供“感知一致、平台原生”的玻璃界面。颜色、间距、圆角、模糊、光照、阴影、字体和动效均由同一份 DTCG 令牌生成。

项目统一的是几何、语义色、状态和动效节奏，而不是逐像素复刻。各端继续使用自己的字体、图标、控件、无障碍模型、浮层机制和模糊管线。

## 当前状态

`0.2.0` 是包含 43 个组件的仅本地 Alpha 快照，暂不发布到公共仓库。MonthCalendar 已在四端提供受控 API。SwiftUI 与 Compose 已移除旧的运行时字符串组件分发器；ArkUI 改为在生成阶段选择原生控件，不再让所有 API 运行时进入同一个 `switch`；微信小程序输入类组件使用原生控件，Dialog 与 BottomSheet 已补充受控显示、遮罩和关闭事件。

在原生编译、行为测试、无障碍、Catalog 冒烟和截图基准全部通过前，组件契约中的成熟度仍保守标记为 `planned`。Node 源码契约测试通过不等于原生平台已验证。

| 平台 | 当前实现 | 进入 stable 前仍需完成 |
| --- | --- | --- |
| SwiftUI | 43 个具名、类型安全 API；使用原生 `Binding`、`Button`、`TabView`、Alert、Sheet、Popover、`glassEffect` 和 `GlassEffectContainer` | Xcode 26 编译/UI 测试、无障碍审计、模拟器 Golden |
| Compose | 43 个类型安全 API，包含受控输入/操作组件、Material 导航与浮层；`CoolBackdrop` 只模糊背景层 | Android CI 编译/UI 测试、截图与性能回归 |
| ArkUI | 43 个 API，生成阶段映射到原生控件 | DevEco/HarmonyOS 6 HAR 构建、继续扩展类型安全 API、Hypium 与 Catalog 冒烟 |
| 微信小程序 | 43 个原生自定义组件标签、原生表单控件、受控事件、降低透明度回退、Dialog/Sheet 遮罩 | 微信开发者工具冒烟、焦点/读屏检查、视觉 Golden |

cooL UI 借鉴 SwiftUI 的组合式 API 思路，但不会也不能“完整复制 SwiftUI”。NavigationStack、布局协议内部机制、完整 Environment 传播、平台生命周期、全部 Modifier 以及 Apple 私有渲染均不在组件库范围内。

## 发布单元

- `@cool-ui/tokens`：DTCG 源文件及 Swift、Kotlin、ArkTS、WXSS、CSS 令牌。
- `@cool-ui/wechat`：支持基础库 3.14.3+ 的原生微信小程序组件。
- `CoolUI`：面向 iOS/iPadOS 26+ 的 Swift Package。
- `dev.coolui:coolui-compose`：面向 Android API 31+ 的 Compose 库。
- `@cool-ui/arkui`：面向 HarmonyOS 6 的 HAR/ohpm 包。

## 本地接入

仓库根目录可直接作为本地 SwiftPM 依赖：

```swift
.package(path: "../cool-ui")
```

生成本地 npm 与原生验证制品：

```bash
pnpm install
pnpm generate
pnpm test
pnpm pack:local
pnpm artifacts
```

本地 tarball 为 `artifacts/npm/cool-ui-tokens-0.2.0.tgz` 和 `artifacts/npm/cool-ui-wechat-0.2.0.tgz`。Compose 通过 `gradle -p packages/android publishReleasePublicationToLocalArtifactsRepository` 写入本地 Maven 仓库。ArkUI 可运行 `hvigorw assembleHar --mode module -p product=default`，但在具备 DevEco 之前，真实 HarmonyOS 6 HAR 结果仍为 pending。以上 canonical release pipeline 不会向 npm、Maven Central 或 OHPM 发布；`native-validation.json` 会如实记录当前机器实际具备的原生工具链。

微信 `cool-button` 渲染一个原生 `<button>`。`open-type` 能力受当前微信基础库、平台权限和审核规则限制。组件内部 `<form>` 只负责自身 `form-type`、`submit` 与 `reset` 流程，不能提交调用方外层表单。

微信小程序需全局导入一次 `@cool-ui/wechat/styles/tokens.wxss`，并在每个使用 cooL UI 的页面根节点添加 `class="cool-theme"`。生成的令牌入口不再使用全局 `page` 选择器，避免页面样式共享到自定义组件后触发微信“不允许标签选择器”警告。

## 仓库结构

- `contracts/`：组件、图标、无障碍和性能契约。
- `packages/tokens/`：唯一视觉令牌源和生成器。
- `packages/swift/`、`packages/android/`、`packages/arkui/`、`packages/wechat/`：四端实现。
- `apps/catalog-*`：各平台原生 Catalog。
- `docs/components/`、`docs/zh/components/`：生成的中英文组件文档。
- `examples/`：npm 与 Swift 本地消费者示例。

按平台使用 Node 22、pnpm 10、JDK 17/Android SDK 31 与 36、Xcode 26/Swift 6.2，以及非 Beta 的 HarmonyOS 6 DevEco 工具链。

## 玻璃实现说明

SwiftUI 在受支持的 Apple 系统上使用 Apple 提供的 Liquid Glass API。Compose、ArkUI 与微信小程序提供感知一致的等价材质表达，不宣称使用 Apple Liquid Glass。Compose 的 `RenderEffect` 只作用于传给 `CoolBackdrop` 的背景内容；`CoolGlassSurface` 使用半透明语义表面，避免文字和控件跟着容器一起被模糊。ArkUI 与微信小程序使用各自平台的背景模糊能力；当用户降低透明度时统一回退到不透明语义表面。

不要任意嵌套实时模糊节点。相邻表面应放入同一个 `CoolGlassGroup` 并共享背景；性能或无障碍策略可以强制使用 `solidFallback`。

## 独立性声明

cooL UI 是独立开源项目，与 Apple、Google、华为和腾讯均无隶属关系。Liquid Glass、SwiftUI、SF Symbols、Material Symbols、HarmonyOS、微信等名称和平台资产归各自权利人所有；本项目不复制或分发专有平台素材。

采用 Apache-2.0 许可证。
