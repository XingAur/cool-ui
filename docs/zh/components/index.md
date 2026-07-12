# cooL UI 组件

全部 43 个组件遵循共享的命名和状态契约。SwiftUI、Compose 与 ArkUI API 使用 `Cool` 前缀，微信组件使用 `cool-` 标签前缀。

## 四端 API 对照

| 规范名 | SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- | --- |
| Button | `CoolButton` | `CoolButton` | `CoolButton` | `<cool-button>` |
| GlassSurface | `CoolGlassSurface` | `CoolGlassSurface` | `CoolGlassSurface` | `<cool-glass-surface>` |
| ThemeProvider | `CoolThemeProvider` | `CoolTheme` | `CoolThemeProvider` | `<cool-theme-provider>` |

## 状态矩阵

交互值由调用方控制，变化通过平台原生事件返回。

## 无障碍与可访问性

每个交互组件都提供无障碍标签、保留原生焦点语义，并使用平台最小触控目标。

## 组件参考

- [ThemeProvider](./theme-provider.md) — foundations 类组件
- [Backdrop](./backdrop.md) — foundations 类组件
- [GlassSurface](./glass-surface.md) — foundations 类组件
- [GlassGroup](./glass-group.md) — foundations 类组件
- [Divider](./divider.md) — foundations 类组件
- [Button](./button.md) — actions-inputs 类组件
- [IconButton](./icon-button.md) — actions-inputs 类组件
- [FloatingActionButton](./floating-action-button.md) — actions-inputs 类组件
- [Chip](./chip.md) — actions-inputs 类组件
- [TextField](./text-field.md) — actions-inputs 类组件
- [TextArea](./text-area.md) — actions-inputs 类组件
- [SearchField](./search-field.md) — actions-inputs 类组件
- [Toggle](./toggle.md) — actions-inputs 类组件
- [Checkbox](./checkbox.md) — actions-inputs 类组件
- [RadioGroup](./radio-group.md) — actions-inputs 类组件
- [Slider](./slider.md) — actions-inputs 类组件
- [Stepper](./stepper.md) — actions-inputs 类组件
- [Select](./select.md) — actions-inputs 类组件
- [DatePicker](./date-picker.md) — actions-inputs 类组件
- [TimePicker](./time-picker.md) — actions-inputs 类组件
- [TopBar](./top-bar.md) — navigation 类组件
- [BottomNavigation](./bottom-navigation.md) — navigation 类组件
- [TabBar](./tab-bar.md) — navigation 类组件
- [SegmentedControl](./segmented-control.md) — navigation 类组件
- [NavigationRail](./navigation-rail.md) — navigation 类组件
- [Card](./card.md) — content 类组件
- [List](./list.md) — content 类组件
- [ListItem](./list-item.md) — content 类组件
- [Badge](./badge.md) — content 类组件
- [Avatar](./avatar.md) — content 类组件
- [Progress](./progress.md) — content 类组件
- [CircularProgress](./circular-progress.md) — content 类组件
- [Skeleton](./skeleton.md) — content 类组件
- [StatTile](./stat-tile.md) — content 类组件
- [EmptyState](./empty-state.md) — content 类组件
- [Toast](./toast.md) — feedback-overlays 类组件
- [Banner](./banner.md) — feedback-overlays 类组件
- [AlertDialog](./alert-dialog.md) — feedback-overlays 类组件
- [BottomSheet](./bottom-sheet.md) — feedback-overlays 类组件
- [Popover](./popover.md) — feedback-overlays 类组件
- [Tooltip](./tooltip.md) — feedback-overlays 类组件
- [LoadingOverlay](./loading-overlay.md) — feedback-overlays 类组件
- [MonthCalendar](./month-calendar.md) — content 类组件
