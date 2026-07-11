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
