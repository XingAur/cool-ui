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
