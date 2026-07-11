# Toolchains

| Surface | Required for release validation |
| --- | --- |
| Shared | Node 22, pnpm 10 |
| SwiftUI | macOS, Xcode 26, Swift 6, iOS 26 simulator |
| Android | JDK 17, Android SDK platforms 31 and 36, Build Tools 36, Gradle 9.4.1 through the wrapper |
| HarmonyOS | Latest non-beta DevEco Studio for HarmonyOS 6 and its bundled SDK/Hvigor |
| WeChat | WeChat DevTools with base library 3.14.3 |

The Node workspace never downloads or accepts native SDK licenses implicitly. CI images and developer machines must provision those tools through their official installers.
