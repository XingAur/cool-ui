import Testing
import SwiftUI
@testable import CoolUI

@Test func semanticTypesRemainStable() {
  #expect(CoolThemeMode.allCases.map(\.rawValue) == ["system", "light", "dark"])
  #expect(CoolGlassMaterial.allCases.map(\.rawValue) == ["clear", "regular", "prominent", "solidFallback"])
}

@Test func semanticIconFallbackIsSafe() {
  #expect(CoolSemanticIcons.sfSymbol(for: "search") == "magnifyingglass")
  #expect(CoolSemanticIcons.sfSymbol(for: "custom") == "custom")
}

@Test @MainActor func foundationsAcceptContentAndConfiguration() {
  _ = CoolThemeProvider(configuration: .init(themeMode: .dark)) { Text("Content") }
  _ = CoolBackdrop { Text("Background") } content: { Text("Content") }
  _ = CoolGlassSurface(material: .regular, tone: .accent) { Text("Surface") }
  _ = CoolGlassGroup(spacing: 12) { Text("Grouped") }
}

@Test @MainActor func actionsAndInputsUseNativeBindings() {
  _ = CoolButton("Continue", tone: .accent, action: {})
  _ = CoolIconButton(systemImage: "search", accessibilityLabel: "Search", action: {})
  _ = CoolFloatingActionButton(systemImage: "plus", accessibilityLabel: "Add", action: {})
  _ = CoolChip("Selected", isSelected: .constant(true))
  _ = CoolTextField("Name", text: .constant(""))
  _ = CoolTextArea("Notes", text: .constant(""))
  _ = CoolSearchField(text: .constant(""), prompt: "Search")
  _ = CoolToggle("Wi-Fi", isOn: .constant(true))
  _ = CoolCheckbox("Remember me", isChecked: .constant(false))
  let options = [
    CoolSelectionOption(id: "one", title: "One"),
    CoolSelectionOption(id: "two", title: "Two"),
  ]
  _ = CoolRadioGroup("Choice", selection: .constant("one"), options: options)
  _ = CoolSelect("Choice", selection: .constant("one"), options: options)
  _ = CoolSlider(value: .constant(25.0), in: 0...100)
  _ = CoolStepper("Count", value: .constant(2.0), in: 0...10)
  _ = CoolDatePicker("Date", selection: .constant(Date()))
  _ = CoolTimePicker("Time", selection: .constant(Date()))
}

@Test @MainActor func navigationContentAndFeedbackUseNativeComposition() {
  let items = [CoolNavigationItem(id: "home", title: "Home", systemImage: "house")]
  _ = CoolTopBar("Library")
  _ = CoolBottomNavigation(selection: .constant("home"), items: items)
  _ = CoolTabBar(selection: .constant("home"), items: items)
  _ = CoolSegmentedControl(selection: .constant("home"), options: [CoolSelectionOption(id: "home", title: "Home")])
  _ = CoolNavigationRail(selection: .constant("home"), items: items)
  _ = CoolCard { Text("Card content") }
  _ = CoolList { CoolListItem(title: "Item", action: {}) }
  _ = CoolBadge("New")
  _ = CoolAvatar(name: "Ada Lovelace")
  _ = CoolProgress(value: 0.5)
  _ = CoolCircularProgress(value: 0.5)
  _ = CoolSkeleton { Text("Loading") }
  _ = CoolStatTile(title: "Sessions", value: "24", trend: "+12%")
  _ = CoolEmptyState(title: "No results", description: "Try another query")
  _ = Text("Host").coolToast(isPresented: .constant(false)) { Text("Saved") }
  _ = Text("Host").coolAlertDialog("Delete?", isPresented: .constant(false)) { Button("Delete") {} } message: { Text("This cannot be undone.") }
  _ = Text("Host").coolBottomSheet(isPresented: .constant(false)) { Text("Sheet") }
  _ = Text("Host").coolPopover(isPresented: .constant(false)) { Text("Popover") }
  _ = Text("Host").coolTooltip(isPresented: .constant(false)) { Text("Tooltip") }
  _ = Text("Host").coolLoadingOverlay(isPresented: true) { ProgressView("Loading") }
}
