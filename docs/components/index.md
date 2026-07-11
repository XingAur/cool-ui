# cooL UI components

Every component follows the shared naming and state contract. SwiftUI, Compose and ArkUI APIs use the `Cool` prefix; WeChat components use the `cool-` element prefix.

## API matrix

| Concept | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| Button | `CoolButton` | `CoolButton` | `CoolButton` | `<cool-button>` |
| Surface | `CoolGlassSurface` | `CoolGlassSurface` | `CoolGlassSurface` | `<cool-glass-surface>` |
| Theme | `CoolThemeProvider` | `CoolTheme` | `CoolThemeProvider` | `<cool-theme-provider>` |

## State matrix

Interactive components support default, pressed, focused, selected, disabled, loading and error states. Values are controlled and changes are emitted through native platform events.

## Accessibility

All interactive components expose an accessibility label, preserve native focus semantics and use a minimum platform touch target. Dynamic type, screen readers, keyboard focus, reduced motion, reduced transparency and high contrast are part of the component contract.

## Icon mapping

Semantic icon names are mapped to SF Symbols, Material Symbols, HarmonyOS Symbols and Lucide. Platform-owned artwork is never redistributed.
