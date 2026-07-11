import Testing
@testable import CoolUI

@Test func semanticTypesRemainStable() {
  #expect(CoolThemeMode.allCases.map(\.rawValue) == ["system", "light", "dark"])
  #expect(CoolGlassMaterial.allCases.map(\.rawValue) == ["clear", "regular", "prominent", "solidFallback"])
}

@Test func semanticIconFallbackIsSafe() {
  #expect(CoolSemanticIcons.sfSymbol(for: "search") == "magnifyingglass")
  #expect(CoolSemanticIcons.sfSymbol(for: "custom") == "custom")
}
