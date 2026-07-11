// Generated from contracts/components.json. Do not edit.
import { CoolComponentConfig, CoolGeneratedComponent } from './CoolCore'


@Component
export struct CoolThemeProvider {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("ThemeProvider")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "ThemeProvider", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolBackdrop {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Backdrop")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Backdrop", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolGlassSurface {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("GlassSurface")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "GlassSurface", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolGlassGroup {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("GlassGroup")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "GlassGroup", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolDivider {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Divider")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Divider", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolButton {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Button")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Button", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolIconButton {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("IconButton")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "IconButton", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolFloatingActionButton {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("FloatingActionButton")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "FloatingActionButton", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolChip {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Chip")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Chip", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolTextField {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("TextField")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "TextField", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolTextArea {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("TextArea")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "TextArea", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolSearchField {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("SearchField")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "SearchField", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolToggle {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Toggle")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Toggle", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolCheckbox {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Checkbox")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Checkbox", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolRadioGroup {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("RadioGroup")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "RadioGroup", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolSlider {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Slider")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Slider", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolStepper {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Stepper")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Stepper", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolSelect {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Select")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Select", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolDatePicker {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("DatePicker")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "DatePicker", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolTimePicker {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("TimePicker")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "TimePicker", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolTopBar {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("TopBar")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "TopBar", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolBottomNavigation {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("BottomNavigation")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "BottomNavigation", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolTabBar {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("TabBar")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "TabBar", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolSegmentedControl {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("SegmentedControl")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "SegmentedControl", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolNavigationRail {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("NavigationRail")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "NavigationRail", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolCard {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Card")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Card", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolList {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("List")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "List", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolListItem {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("ListItem")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "ListItem", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolBadge {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Badge")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Badge", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolAvatar {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Avatar")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Avatar", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolProgress {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Progress")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Progress", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolCircularProgress {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("CircularProgress")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "CircularProgress", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolSkeleton {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Skeleton")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Skeleton", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolStatTile {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("StatTile")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "StatTile", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolEmptyState {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("EmptyState")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "EmptyState", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolToast {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Toast")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Toast", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolBanner {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Banner")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Banner", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolAlertDialog {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("AlertDialog")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "AlertDialog", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolBottomSheet {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("BottomSheet")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "BottomSheet", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolPopover {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Popover")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Popover", interactive: true, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolTooltip {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("Tooltip")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "Tooltip", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}

@Component
export struct CoolLoadingOverlay {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("LoadingOverlay")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "LoadingOverlay", interactive: false, config: this.config, onEvent: this.onEvent })
  }
}
