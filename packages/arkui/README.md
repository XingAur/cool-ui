# @cool-ui/arkui

Version `0.2.0` exposes 43 components for HarmonyOS 6 ArkUI as a local HAR/ohpm package. Maturity remains `planned`: source contracts pass, but the real DevEco HAR build is pending and unverified.

```ts
import { CoolButton, CoolComponentConfig } from '@cool-ui/arkui'

CoolButton({ config: new CoolComponentConfig('Continue') })
```

Open the package in the latest non-beta HarmonyOS 6 DevEco Studio and run `hvigorw assembleHar --mode module -p product=default` for the local HAR. This repository does not publish it to OHPM.

The 0.2.0 API is experimental: generation selects native ArkUI primitives, while full typed parameters, Hypium behavior coverage and a real HarmonyOS 6 HAR build remain release gates.
