# @cool-ui/arkui

Version `0.2.0` exposes 43 components for HarmonyOS 6 ArkUI as a local HAR/ohpm package. Maturity remains `planned`: source contracts pass, but the real DevEco HAR build is pending and unverified.

```ts
import { CoolButton, CoolComponentConfig } from '@cool-ui/arkui'

CoolButton({ config: new CoolComponentConfig('Continue') })
```

The checked-in project model uses stable Hvigor 6.0.6 and `@ohos/hvigor-ohos-plugin` 6.0.6 for the HarmonyOS 6 / API 20 profile. Open the package in a matching non-beta DevEco Studio and run `ohpm install --all` followed by `hvigorw assembleHar --mode module -p product=default` for the local HAR. The HAR remains pending until that command runs on the approved self-hosted DevEco toolchain; this repository does not publish it to OHPM.

The 0.2.0 API is experimental: generation selects native ArkUI primitives, while full typed parameters, Hypium behavior coverage and a real HarmonyOS 6 HAR build remain release gates.
