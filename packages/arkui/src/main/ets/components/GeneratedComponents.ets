// Generated from contracts/components.json. Do not edit.
import { CoolComponentConfig } from './CoolCore'

export const CoolComponentRegistry: string[] = [
  "ThemeProvider",
  "Backdrop",
  "GlassSurface",
  "GlassGroup",
  "Divider",
  "Button",
  "IconButton",
  "FloatingActionButton",
  "Chip",
  "TextField",
  "TextArea",
  "SearchField",
  "Toggle",
  "Checkbox",
  "RadioGroup",
  "Slider",
  "Stepper",
  "Select",
  "DatePicker",
  "TimePicker",
  "TopBar",
  "BottomNavigation",
  "TabBar",
  "SegmentedControl",
  "NavigationRail",
  "Card",
  "List",
  "ListItem",
  "Badge",
  "Avatar",
  "Progress",
  "CircularProgress",
  "Skeleton",
  "StatTile",
  "EmptyState",
  "Toast",
  "Banner",
  "AlertDialog",
  "BottomSheet",
  "Popover",
  "Tooltip",
  "LoadingOverlay",
  "MonthCalendar",
]


@Component
export struct CoolThemeProvider {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("ThemeProvider")
  onEvent: (event: string) => void = () => {}

  build() {
    Text(this.config.label).accessibilityText(this.config.accessibilityLabel)
  }
}

@Component
export struct CoolBackdrop {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Backdrop")
  onEvent: (event: string) => void = () => {}

  build() {
    Text(this.config.label).accessibilityText(this.config.accessibilityLabel)
  }
}

@Component
export struct CoolGlassSurface {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("GlassSurface")
  onEvent: (event: string) => void = () => {}

  build() {
    Text(this.config.label).accessibilityText(this.config.accessibilityLabel)
  }
}

@Component
export struct CoolGlassGroup {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("GlassGroup")
  onEvent: (event: string) => void = () => {}

  build() {
    Text(this.config.label).accessibilityText(this.config.accessibilityLabel)
  }
}

@Component
export struct CoolDivider {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Divider")
  onEvent: (event: string) => void = () => {}

  build() {
    Divider()
  }
}

@Component
export struct CoolButton {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Button")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolIconButton {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("IconButton")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolFloatingActionButton {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("FloatingActionButton")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolChip {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Chip")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolTextField {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("TextField")
  onEvent: (event: string) => void = () => {}

  build() {
    TextInput({ text: this.config.value, placeholder: this.config.placeholder }).enabled(!this.config.disabled).onChange((value: string) => this.onEvent(`valueChanged:${value}`))
  }
}

@Component
export struct CoolTextArea {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("TextArea")
  onEvent: (event: string) => void = () => {}

  build() {
    TextArea({ text: this.config.value, placeholder: this.config.placeholder }).enabled(!this.config.disabled).onChange((value: string) => this.onEvent(`valueChanged:${value}`))
  }
}

@Component
export struct CoolSearchField {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("SearchField")
  onEvent: (event: string) => void = () => {}

  build() {
    TextInput({ text: this.config.value, placeholder: this.config.placeholder }).enabled(!this.config.disabled).onChange((value: string) => this.onEvent(`valueChanged:${value}`))
  }
}

@Component
export struct CoolToggle {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Toggle")
  onEvent: (event: string) => void = () => {}

  build() {
    Toggle({ type: ToggleType.Switch, isOn: this.config.selected }).enabled(!this.config.disabled).onChange((value: boolean) => this.onEvent(`valueChanged:${value}`))
  }
}

@Component
export struct CoolCheckbox {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Checkbox")
  onEvent: (event: string) => void = () => {}

  build() {
    Checkbox({ name: this.config.label, group: 'coolui' }).select(this.config.selected).enabled(!this.config.disabled).onChange((value: boolean) => this.onEvent(`valueChanged:${value}`))
  }
}

@Component
export struct CoolRadioGroup {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("RadioGroup")
  onEvent: (event: string) => void = () => {}

  build() {
    Radio({ value: this.config.value, group: 'coolui' }).checked(this.config.selected).enabled(!this.config.disabled).onChange((value: boolean) => this.onEvent(`valueChanged:${value}`))
  }
}

@Component
export struct CoolSlider {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Slider")
  onEvent: (event: string) => void = () => {}

  build() {
    Slider({ value: Number(this.config.value), min: this.config.minimumValue, max: this.config.maximumValue }).enabled(!this.config.disabled).onChange((value: number) => this.onEvent(`valueChanged:${value}`))
  }
}

@Component
export struct CoolStepper {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Stepper")
  onEvent: (event: string) => void = () => {}

  build() {
    Row() { Button('−').onClick(() => this.onEvent(`valueChanged:${Number(this.config.value) - 1}`)); Text(this.config.value); Button('+').onClick(() => this.onEvent(`valueChanged:${Number(this.config.value) + 1}`)) }
  }
}

@Component
export struct CoolSelect {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Select")
  onEvent: (event: string) => void = () => {}

  build() {
    Select(this.config.options.map((value: string) => ({ value }))).selected(this.config.options.indexOf(this.config.value)).onSelect((index: number, value: string) => this.onEvent(`valueChanged:${value}`))
  }
}

@Component
export struct CoolDatePicker {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("DatePicker")
  onEvent: (event: string) => void = () => {}

  build() {
    DatePicker().enabled(!this.config.disabled).onChange((value: DatePickerResult) => this.onEvent(`valueChanged:${value.year}-${value.month + 1}-${value.day}`))
  }
}

@Component
export struct CoolTimePicker {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("TimePicker")
  onEvent: (event: string) => void = () => {}

  build() {
    TimePicker().enabled(!this.config.disabled).onChange((value: TimePickerResult) => this.onEvent(`valueChanged:${value.hour}:${value.minute}`))
  }
}

@Component
export struct CoolTopBar {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("TopBar")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolBottomNavigation {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("BottomNavigation")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolTabBar {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("TabBar")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolSegmentedControl {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("SegmentedControl")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolNavigationRail {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("NavigationRail")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolCard {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Card")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolList {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("List")
  onEvent: (event: string) => void = () => {}

  build() {
    Text(this.config.label).accessibilityText(this.config.accessibilityLabel)
  }
}

@Component
export struct CoolListItem {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("ListItem")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolBadge {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Badge")
  onEvent: (event: string) => void = () => {}

  build() {
    Text(this.config.label).accessibilityText(this.config.accessibilityLabel)
  }
}

@Component
export struct CoolAvatar {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Avatar")
  onEvent: (event: string) => void = () => {}

  build() {
    Text(this.config.label).accessibilityText(this.config.accessibilityLabel)
  }
}

@Component
export struct CoolProgress {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Progress")
  onEvent: (event: string) => void = () => {}

  build() {
    Progress({ value: Number(this.config.value), total: this.config.maximumValue, type: ProgressType.Linear })
  }
}

@Component
export struct CoolCircularProgress {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("CircularProgress")
  onEvent: (event: string) => void = () => {}

  build() {
    Progress({ value: Number(this.config.value), total: this.config.maximumValue, type: ProgressType.Ring })
  }
}

@Component
export struct CoolSkeleton {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Skeleton")
  onEvent: (event: string) => void = () => {}

  build() {
    Text(this.config.label).accessibilityText(this.config.accessibilityLabel)
  }
}

@Component
export struct CoolStatTile {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("StatTile")
  onEvent: (event: string) => void = () => {}

  build() {
    Text(this.config.label).accessibilityText(this.config.accessibilityLabel)
  }
}

@Component
export struct CoolEmptyState {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("EmptyState")
  onEvent: (event: string) => void = () => {}

  build() {
    Text(this.config.label).accessibilityText(this.config.accessibilityLabel)
  }
}

@Component
export struct CoolToast {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Toast")
  onEvent: (event: string) => void = () => {}

  build() {
    Text(this.config.label).accessibilityText(this.config.accessibilityLabel)
  }
}

@Component
export struct CoolBanner {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Banner")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolAlertDialog {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("AlertDialog")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolBottomSheet {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("BottomSheet")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolPopover {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Popover")
  onEvent: (event: string) => void = () => {}

  build() {
    Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))
  }
}

@Component
export struct CoolTooltip {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Tooltip")
  onEvent: (event: string) => void = () => {}

  build() {
    Text(this.config.label).accessibilityText(this.config.accessibilityLabel)
  }
}

@Component
export struct CoolLoadingOverlay {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("LoadingOverlay")
  onEvent: (event: string) => void = () => {}

  build() {
    LoadingProgress().accessibilityText(this.config.accessibilityLabel)
  }
}
