# cooL UI components

All 43 components follow the shared naming and state contract. SwiftUI, Compose, and ArkUI APIs use the `Cool` prefix; WeChat components use the `cool-` element prefix.

## API matrix

| Concept | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| Button | `CoolButton` | `CoolButton` | `CoolButton` | `<cool-button>` |
| Surface | `CoolGlassSurface` | `CoolGlassSurface` | `CoolGlassSurface` | `<cool-glass-surface>` |
| Theme | `CoolThemeProvider` | `CoolTheme` | `CoolThemeProvider` | `<cool-theme-provider>` |

## State matrix

Interactive values are controlled and changes are emitted through native platform events.

## Accessibility

Every interactive component exposes an accessibility label, preserves native focus semantics, and uses a minimum platform touch target.

## Component reference

- [ThemeProvider](./theme-provider.md) — foundations
- [Backdrop](./backdrop.md) — foundations
- [GlassSurface](./glass-surface.md) — foundations
- [GlassGroup](./glass-group.md) — foundations
- [Divider](./divider.md) — foundations
- [Button](./button.md) — actions-inputs
- [IconButton](./icon-button.md) — actions-inputs
- [FloatingActionButton](./floating-action-button.md) — actions-inputs
- [Chip](./chip.md) — actions-inputs
- [TextField](./text-field.md) — actions-inputs
- [TextArea](./text-area.md) — actions-inputs
- [SearchField](./search-field.md) — actions-inputs
- [Toggle](./toggle.md) — actions-inputs
- [Checkbox](./checkbox.md) — actions-inputs
- [RadioGroup](./radio-group.md) — actions-inputs
- [Slider](./slider.md) — actions-inputs
- [Stepper](./stepper.md) — actions-inputs
- [Select](./select.md) — actions-inputs
- [DatePicker](./date-picker.md) — actions-inputs
- [TimePicker](./time-picker.md) — actions-inputs
- [TopBar](./top-bar.md) — navigation
- [BottomNavigation](./bottom-navigation.md) — navigation
- [TabBar](./tab-bar.md) — navigation
- [SegmentedControl](./segmented-control.md) — navigation
- [NavigationRail](./navigation-rail.md) — navigation
- [Card](./card.md) — content
- [List](./list.md) — content
- [ListItem](./list-item.md) — content
- [Badge](./badge.md) — content
- [Avatar](./avatar.md) — content
- [Progress](./progress.md) — content
- [CircularProgress](./circular-progress.md) — content
- [Skeleton](./skeleton.md) — content
- [StatTile](./stat-tile.md) — content
- [EmptyState](./empty-state.md) — content
- [Toast](./toast.md) — feedback-overlays
- [Banner](./banner.md) — feedback-overlays
- [AlertDialog](./alert-dialog.md) — feedback-overlays
- [BottomSheet](./bottom-sheet.md) — feedback-overlays
- [Popover](./popover.md) — feedback-overlays
- [Tooltip](./tooltip.md) — feedback-overlays
- [LoadingOverlay](./loading-overlay.md) — feedback-overlays
- [MonthCalendar](./month-calendar.md) — content
