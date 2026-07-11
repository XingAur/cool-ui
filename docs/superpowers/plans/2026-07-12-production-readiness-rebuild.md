# cooL UI Production Readiness Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic component shells with production-usable native APIs, make SwiftUI the reference implementation, synchronize each component slice across Compose, ArkUI, and WeChat, and document the real capability level in English and Chinese.

**Architecture:** `contracts/components.json` becomes the machine-readable capability contract, including value type, events, slots, presentation model, and platform maturity. SwiftUI moves from one string-switched renderer to focused files for foundations, actions and inputs, navigation, content, and feedback. Other platforms keep idiomatic APIs but must implement the same behavior contract before a component can be marked stable.

**Tech Stack:** Swift 6.2 / SwiftUI iOS 26, Kotlin 2.3 / Jetpack Compose / Android API 31+, ArkTS / ArkUI HarmonyOS 6, native WeChat Mini Program components, Node 22 contract generators, Node Test Runner, Swift Testing, JUnit, Hypium-compatible source validation, GitHub Actions.

---

### Task 1: Make the component contract describe real behavior

**Files:**
- Modify: `contracts/components.schema.json`
- Modify: `contracts/components.json`
- Create: `contracts/component-capabilities.json`
- Modify: `tests/contracts.test.mjs`

- [ ] **Step 1: Write the failing contract test**

```js
test('every component declares native API shape and platform maturity', () => {
  for (const component of contract.components) {
    assert.ok(component.api?.kind, component.name);
    assert.ok(Array.isArray(component.api.events), component.name);
    assert.ok(Array.isArray(component.api.slots), component.name);
    assert.deepEqual(Object.keys(component.maturity), ['swiftui', 'compose', 'arkui', 'wechat']);
    assert.ok(Object.values(component.maturity).every((value) => ['stable', 'beta', 'planned'].includes(value)));
  }
});
```

- [ ] **Step 2: Run the test and confirm the missing `api` field fails**

Run: `node --test tests/contracts.test.mjs`

Expected: FAIL for `ThemeProvider` with an absent `api.kind`.

- [ ] **Step 3: Extend the schema and contract**

Use these API kinds: `provider`, `container`, `action`, `textInput`, `booleanInput`, `choiceInput`, `numericInput`, `dateInput`, `navigation`, `content`, `status`, and `presentation`. Define exact slots and events per component. Mark a platform `stable` only after its native implementation and tests exist.

```json
{
  "name": "Button",
  "api": {
    "kind": "action",
    "valueType": "none",
    "events": ["activate"],
    "slots": ["label", "leadingIcon", "trailingIcon"]
  },
  "maturity": {"swiftui":"stable","compose":"stable","arkui":"stable","wechat":"stable"}
}
```

- [ ] **Step 4: Run contract tests**

Run: `node --test tests/contracts.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the contract**

```bash
git add contracts tests/contracts.test.mjs
git commit -m "refactor: define real component capability contracts"
```

### Task 2: Build SwiftUI theme and Liquid Glass foundations

**Files:**
- Replace: `packages/swift/Sources/CoolUI/CoolCore.swift`
- Create: `packages/swift/Sources/CoolUI/CoolTheme.swift`
- Create: `packages/swift/Sources/CoolUI/CoolGlass.swift`
- Create: `packages/swift/Sources/CoolUI/CoolAccessibility.swift`
- Modify: `packages/swift/Tests/CoolUITests/CoolUITests.swift`
- Modify: `apps/catalog-swift/CoolUICatalog/CoolUICatalogApp.swift`

- [ ] **Step 1: Write failing Swift API construction tests**

```swift
@Test @MainActor func foundationsAcceptContentAndConfiguration() {
  _ = CoolThemeProvider(configuration: .init(themeMode: .dark)) { Text("Content") }
  _ = CoolBackdrop { Text("Background") }
  _ = CoolGlassSurface(material: .regular, tone: .accent) { Text("Surface") }
  _ = CoolGlassGroup(spacing: 12) { Text("Grouped") }
}
```

- [ ] **Step 2: Push the failing test to Apple CI or run with Xcode 26**

Run: `swift test --package-path packages/swift`

Expected: FAIL because the current generated structs do not accept `@ViewBuilder` content.

- [ ] **Step 3: Implement the environment and accessibility resolver**

```swift
public struct CoolResolvedEnvironment: Equatable, Sendable {
  public let colorScheme: ColorScheme
  public let highContrast: Bool
  public let reduceMotion: Bool
  public let reduceTransparency: Bool
}
```

`CoolThemeProvider` must inject `coolTheme`, apply the requested color scheme, and merge explicit settings with `accessibilityReduceMotion`, `accessibilityReduceTransparency`, `accessibilityDifferentiateWithoutColor`, and `colorSchemeContrast`.

- [ ] **Step 4: Implement public composable foundations**

```swift
public struct CoolGlassSurface<Content: View>: View {
  public init(material: CoolGlassMaterial = .regular,
              tone: CoolTone = .neutral,
              size: CoolSize = .medium,
              interactive: Bool = false,
              @ViewBuilder content: () -> Content)
}
```

Use `.glassEffect`, `.glassEffectID`, `.glassEffectUnion`, `.glassEffectTransition`, `.buttonStyle(.glass)`, `.buttonStyle(.glassProminent)`, and `GlassEffectContainer` only where their platform semantics apply. Use generated tokens for every geometry, color, and duration.

- [ ] **Step 5: Replace the Catalog foundation examples with the public APIs**

The Catalog must not instantiate `CoolGeneratedComponent` directly.

- [ ] **Step 6: Run Swift and root tests**

Run: `swift test --package-path packages/swift && pnpm test:contracts`

Expected: PASS.

- [ ] **Step 7: Commit foundations**

```bash
git add packages/swift apps/catalog-swift tests
git commit -m "feat: add composable SwiftUI glass foundations"
```

### Task 3: Implement type-safe SwiftUI actions and inputs

**Files:**
- Create: `packages/swift/Sources/CoolUI/CoolActions.swift`
- Create: `packages/swift/Sources/CoolUI/CoolTextInputs.swift`
- Create: `packages/swift/Sources/CoolUI/CoolSelectionInputs.swift`
- Create: `packages/swift/Sources/CoolUI/CoolNumericInputs.swift`
- Create: `packages/swift/Sources/CoolUI/CoolDateInputs.swift`
- Modify: `scripts/generate-components.mjs`
- Modify: `packages/swift/Tests/CoolUITests/CoolUITests.swift`

- [ ] **Step 1: Write failing compile-level tests for native bindings**

```swift
@Test @MainActor func inputsUseNativeBindings() {
  _ = CoolButton("Continue", tone: .accent, action: {})
  _ = CoolToggle("Wi-Fi", isOn: .constant(true))
  _ = CoolTextField("Name", text: .constant(""))
  _ = CoolSlider(value: .constant(25), in: 0...100)
  _ = CoolDatePicker("Date", selection: .constant(Date()))
}
```

- [ ] **Step 2: Verify the tests fail against string-valued props**

Run: `swift test --package-path packages/swift`

Expected: FAIL with missing binding-based initializers.

- [ ] **Step 3: Implement Button, IconButton, FloatingActionButton, and Chip**

Use native `Button`, button roles, `Label`, system symbol mapping, `.disabled`, loading hit-test suppression, selected accessibility traits, focus rings, and glass button styles. Provide string convenience initializers and `@ViewBuilder` label initializers.

- [ ] **Step 4: Implement text, boolean, choice, numeric, and date inputs**

All values must use native `Binding` types. Clamp invalid numeric ranges before constructing `Slider` or `Stepper`. Error messages must use accessible descriptions without replacing native control semantics.

- [ ] **Step 5: Stop generating Swift component shells**

The generator may produce a component registry for Catalog/docs, but handwritten public SwiftUI APIs own rendering.

- [ ] **Step 6: Run Swift package and iOS Catalog builds**

```bash
swift test --package-path packages/swift
xcodebuild -project apps/catalog-swift/CoolUICatalog.xcodeproj -scheme CoolUICatalog -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO build
```

- [ ] **Step 7: Commit actions and inputs**

```bash
git add packages/swift scripts/generate-components.mjs apps/catalog-swift
git commit -m "feat: add type-safe SwiftUI actions and inputs"
```

### Task 4: Implement SwiftUI navigation, content, and presentations

**Files:**
- Create: `packages/swift/Sources/CoolUI/CoolNavigation.swift`
- Create: `packages/swift/Sources/CoolUI/CoolContent.swift`
- Create: `packages/swift/Sources/CoolUI/CoolFeedback.swift`
- Modify: `packages/swift/Tests/CoolUITests/CoolUITests.swift`
- Modify: `apps/catalog-swift/CoolUICatalog/CoolUICatalogApp.swift`

- [ ] **Step 1: Write failing API construction tests**

```swift
@Test @MainActor func composedAndPresentedComponentsUseNativeModels() {
  _ = CoolCard { Text("Card content") }
  _ = CoolList { CoolListItem(title: "Item", action: {}) }
  _ = CoolTabBar(selection: .constant("home"), items: [.init(id: "home", title: "Home", systemImage: "house")])
  _ = Text("Host").coolBottomSheet(isPresented: .constant(false)) { Text("Sheet") }
  _ = Text("Host").coolAlertDialog("Delete?", isPresented: .constant(false), actions: {})
}
```

- [ ] **Step 2: Verify the tests fail**

Run: `swift test --package-path packages/swift`

Expected: FAIL with missing content builders and presentation modifiers.

- [ ] **Step 3: Implement native navigation and content composition**

Use `toolbar`, `TabView`, `Picker`, scroll-safe layouts, native selection bindings, semantic labels, and content builders. `CoolCard`, `CoolList`, `CoolListItem`, `CoolStatTile`, and `CoolEmptyState` must accept arbitrary SwiftUI content where appropriate.

- [ ] **Step 4: Implement feedback and presentation modifiers**

Use `.alert`, `.sheet`, `.popover`, overlays, accessibility announcements, `dismiss`, focus restoration, and reduced-motion transitions. Do not emulate native system presentation with inline rectangles.

- [ ] **Step 5: Add every public component and every semantic state to the Swift Catalog**

Create controlled Catalog state for text, toggles, sliders, selections, dates, dialogs, sheets, and popovers. Add theme, contrast, motion, and transparency controls.

- [ ] **Step 6: Run Swift tests and Catalog build**

Run the commands from Task 3 Step 6.

- [ ] **Step 7: Commit the complete SwiftUI reference**

```bash
git add packages/swift apps/catalog-swift
git commit -m "feat: complete the SwiftUI reference components"
```

### Task 5: Synchronize Compose behavior and fix the blur pipeline

**Files:**
- Replace: `packages/android/src/main/kotlin/dev/coolui/compose/CoolCore.kt`
- Create: `packages/android/src/main/kotlin/dev/coolui/compose/CoolTheme.kt`
- Create: `packages/android/src/main/kotlin/dev/coolui/compose/CoolGlass.kt`
- Create: `packages/android/src/main/kotlin/dev/coolui/compose/CoolComponents.kt`
- Modify: `packages/android/src/test/kotlin/dev/coolui/compose/CoolContractTest.kt`
- Create: `packages/android/src/androidTest/kotlin/dev/coolui/compose/CoolComponentsTest.kt`
- Modify: `apps/catalog-android/src/main/kotlin/dev/coolui/catalog/MainActivity.kt`

- [ ] **Step 1: Add failing tests for disabled actions, controlled values, content slots, and semantics**

```kotlin
@Test fun componentContractUsesTypedModels() {
  assertEquals(false, CoolButtonState(enabled = false).enabled)
  assertEquals(0f..100f, CoolSliderState(value = 20f, range = 0f..100f).range)
}
```

- [ ] **Step 2: Verify failure**

Run: `gradle -p packages/android test`

Expected: FAIL because typed models do not exist.

- [ ] **Step 3: Implement a shared backdrop sampling owner**

`CoolBackdrop` owns the background capture. Glass surfaces sample that layer; never install `RenderEffect.createBlurEffect` on the content layer itself. Fall back to translucent surfaces when sampling is unavailable or transparency is reduced.

- [ ] **Step 4: Implement each vertical slice with Material 3 primitives and typed parameters**

Buttons, inputs, navigation, content, and presentations must expose Compose-native slots and state hoisting. Remove string switching from public rendering.

- [ ] **Step 5: Rebuild the Android Catalog from public APIs**

- [ ] **Step 6: Run unit, UI, and publication tests**

Run: `gradle -p packages/android test publishReleasePublicationToLocalArtifactsRepository`

Expected: PASS and an AAR/POM under `packages/android/build/repo`.

- [ ] **Step 7: Commit Compose synchronization**

```bash
git add packages/android apps/catalog-android
git commit -m "feat: synchronize production Compose components"
```

### Task 6: Synchronize ArkUI and WeChat native behavior

**Files:**
- Replace: `packages/arkui/src/main/ets/components/CoolCore.ets`
- Create: `packages/arkui/src/main/ets/components/CoolTheme.ets`
- Create: `packages/arkui/src/main/ets/components/CoolComponents.ets`
- Modify: `packages/arkui/Index.ets`
- Modify: `packages/arkui/scripts/validate.mjs`
- Modify: `apps/catalog-arkui/entry/src/main/ets/pages/Index.ets`
- Modify: `packages/wechat/src/behaviors/cool-ui.js`
- Modify: `packages/wechat/src/styles/glass.wxss`
- Modify: `scripts/generate-components.mjs`
- Modify: `packages/wechat/tests/components.test.mjs`
- Modify: `apps/catalog-wechat/pages/index/index.wxml`

- [ ] **Step 1: Add failing source-contract tests**

ArkUI validation must reject a Catalog that renders every name with `CoolButton`. WeChat tests must verify ThemeProvider inheritance, dark/high-contrast selectors, reduced motion, disabled/loading event suppression, typed native control templates, and real overlay open/close state.

- [ ] **Step 2: Verify both suites fail**

```bash
pnpm --dir packages/arkui test
pnpm --dir packages/wechat test
```

- [ ] **Step 3: Implement ArkUI native components and provider state**

Use `@Provide`/`@Consume`, builders, typed callbacks, native dialogs/sheets where supported, `backdropBlur`, accessibility text, and disabled/loading guards.

- [ ] **Step 4: Implement WeChat theme inheritance and component-specific templates**

ThemeProvider applies `cool-theme-light`, `cool-theme-dark`, `cool-contrast-high`, `cool-motion-reduced`, and `cool-transparency-reduced`. Generate component-specific WXML instead of treating navigation and overlays as generic tappable views.

- [ ] **Step 5: Replace Catalog shell usage with real public components**

- [ ] **Step 6: Run ArkUI validation, WeChat tests, and npm pack**

```bash
pnpm --dir packages/arkui test
pnpm --dir packages/wechat build
pnpm --dir packages/wechat test
pnpm pack:local
```

- [ ] **Step 7: Commit ArkUI and WeChat synchronization**

```bash
git add packages/arkui packages/wechat apps/catalog-arkui apps/catalog-wechat scripts/generate-components.mjs
git commit -m "feat: synchronize ArkUI and WeChat component behavior"
```

### Task 7: Make tests and documentation report real support

**Files:**
- Modify: `tests/platforms.test.mjs`
- Modify: `tests/release.test.mjs`
- Create: `tests/capability-matrix.test.mjs`
- Modify: `scripts/generate-components.mjs`
- Modify: `docs/components/*.md`
- Modify: `docs/zh/components/*.md`
- Modify: `README.md`
- Modify: `README.zh-CN.md`
- Modify: `packages/swift/README.md`
- Modify: `packages/android/README.md`
- Modify: `packages/wechat/README.md`
- Modify: `packages/arkui/README.md`

- [ ] **Step 1: Write failing documentation truthfulness tests**

```js
test('docs never claim unsupported states', async () => {
  for (const component of contract.components) {
    const docs = await read(`docs/components/${kebab(component.name)}.md`);
    for (const [platform, maturity] of Object.entries(component.maturity)) {
      assert.match(docs, new RegExp(`${platform}.*${maturity}`, 'i'));
    }
  }
});
```

- [ ] **Step 2: Verify the test fails against unconditional `Supported` rows**

Run: `node --test tests/capability-matrix.test.mjs`

- [ ] **Step 3: Generate accurate bilingual component docs**

Each document must include maturity, real API signatures, state coverage, accessibility behavior, native fallback behavior, and runnable examples.

- [ ] **Step 4: Update the root English and Chinese READMEs**

Document installation for npm, SwiftPM, local Maven, and OHPM; supported platform versions; architecture; component maturity; Catalog commands; accessibility; performance limits; package ownership; and the non-affiliation notice. Add a root SwiftPM manifest or a documented supported repository layout so the GitHub URL is actually installable.

- [ ] **Step 5: Correct repository metadata**

Use `https://github.com/XingAur/cool-ui` everywhere and validate it in repository tests.

- [ ] **Step 6: Build docs and run documentation tests**

Run: `node --test tests/*.test.mjs && pnpm docs:build`

Expected: PASS with no unconditional support claims.

- [ ] **Step 7: Commit documentation**

```bash
git add README.md README.zh-CN.md packages docs tests scripts/generate-components.mjs contracts
git commit -m "docs: publish truthful bilingual component guidance"
```

### Task 8: Verify consumers, native artifacts, CI, and repository state

**Files:**
- Modify: `Package.swift`
- Modify: `.github/workflows/apple.yml`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/harmony.yml`
- Modify: `scripts/build-artifacts.mjs`
- Modify: `examples/npm-consumer/verify.mjs`
- Create: `examples/swift-consumer/Package.swift`
- Create: `examples/swift-consumer/Sources/main.swift`

- [ ] **Step 1: Add failing consumer and artifact assertions**

The root Swift Package must expose `CoolUI`. The npm consumer must resolve documented component paths. Artifact metadata must distinguish `built`, `validated-in-ci`, and `unavailable` instead of implying files were produced.

- [ ] **Step 2: Verify failure before changing packaging**

Run: `node --test tests/release.test.mjs`

- [ ] **Step 3: Make the root repository SwiftPM-installable**

The root `Package.swift` points its `CoolUI` target at `packages/swift/Sources/CoolUI` and tests at `packages/swift/Tests/CoolUITests`. The nested manifest remains for local package development only if both manifests stay identical through a contract test.

- [ ] **Step 4: Run the complete local verification**

```bash
pnpm tokens:check
pnpm test
pnpm lint
pnpm typecheck
pnpm docs:build
pnpm artifacts
node examples/npm-consumer/verify.mjs
git diff --check
```

- [ ] **Step 5: Push `main` and follow hosted CI to completion**

Apple CI must compile Swift tests and the iOS Catalog. Shared/Android CI must pass contract, docs, npm, Android tests, and AAR publication. Harmony remains explicitly pending until a matching self-hosted DevEco runner executes the HAR build.

- [ ] **Step 6: Commit final CI and packaging fixes**

```bash
git add Package.swift .github scripts examples tests
git commit -m "build: verify cooL UI consumers and native artifacts"
```
