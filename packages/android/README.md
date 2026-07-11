# Cool Compose

Local Maven coordinate: `dev.coolui:coolui-compose:0.1.0`. The module targets Android API 31 and newer, compiles with API 36 and uses JDK 17.

```kotlin
CoolButton(
  props = CoolComponentProps(label = "Continue", tone = Tone.accent),
  onEvent = { event -> /* update controlled state */ },
)
```

Run `gradle -p packages/android publishReleasePublicationToLocalArtifactsRepository` to create the local Maven/AAR repository.
