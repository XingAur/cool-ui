# Cool Compose

Version `0.2.0` exposes 43 components. Their maturity remains `planned` until Android compile/UI, accessibility, Catalog, screenshot, and performance gates complete.

Local Maven coordinate: `dev.coolui:coolui-compose:0.2.0`. The module targets Android API 31 and newer, compiles with API 36 and uses JDK 17.

```kotlin
CoolButton(
  label = "Continue",
  onClick = ::submit,
)

CoolTextField(value = name, onValueChange = { name = it }, label = "Name")
```

Run `gradle -p packages/android publishReleasePublicationToLocalArtifactsRepository` to create the local Maven/AAR repository. Version 0.2.0 is not published to Maven Central.

`CoolBackdrop` applies `RenderEffect` to its supplied background layer. `CoolGlassSurface` never blurs its own text or controls.
