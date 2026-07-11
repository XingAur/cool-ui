import SwiftUI

public enum CoolThemeMode: String, CaseIterable, Hashable, Sendable { case system, light, dark }
public enum CoolGlassMaterial: String, CaseIterable, Hashable, Sendable { case clear, regular, prominent, solidFallback }
public enum CoolTone: String, CaseIterable, Hashable, Sendable { case neutral, accent, success, warning, danger }
public enum CoolSize: String, CaseIterable, Hashable, Sendable { case small, medium, large }
public enum CoolContrastMode: String, CaseIterable, Hashable, Sendable { case standard, high }
public enum CoolMotionMode: String, CaseIterable, Hashable, Sendable { case full, reduced }
public enum CoolTransparencyMode: String, CaseIterable, Hashable, Sendable { case full, reduced }
public enum CoolComponentState: String, CaseIterable, Hashable, Sendable { case `default`, pressed, focused, selected, disabled, loading, error }

enum CoolTokenValue {
  static func points(_ value: String) -> CGFloat {
    CGFloat(Double(value.replacingOccurrences(of: "px", with: "").replacingOccurrences(of: "ms", with: "")) ?? .zero)
  }

  static func color(_ hex: String) -> Color {
    let raw = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
    guard let value = UInt64(raw, radix: 16) else { return .clear }
    let red = Double((value >> 24) & 0xff) / 255
    let green = Double((value >> 16) & 0xff) / 255
    let blue = Double((value >> 8) & 0xff) / 255
    let alpha = Double(value & 0xff) / 255
    return Color(red: red, green: green, blue: blue, opacity: alpha)
  }
}
