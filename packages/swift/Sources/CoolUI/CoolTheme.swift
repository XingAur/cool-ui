import SwiftUI

public struct CoolThemeConfiguration: Equatable, Sendable {
  public var themeMode: CoolThemeMode
  public var contrastMode: CoolContrastMode
  public var motionMode: CoolMotionMode
  public var transparencyMode: CoolTransparencyMode

  public init(
    themeMode: CoolThemeMode = .system,
    contrastMode: CoolContrastMode = .standard,
    motionMode: CoolMotionMode = .full,
    transparencyMode: CoolTransparencyMode = .full
  ) {
    self.themeMode = themeMode
    self.contrastMode = contrastMode
    self.motionMode = motionMode
    self.transparencyMode = transparencyMode
  }
}

public struct CoolResolvedEnvironment: Equatable, Sendable {
  public let colorScheme: ColorScheme
  public let highContrast: Bool
  public let reduceMotion: Bool
  public let reduceTransparency: Bool

  public init(
    colorScheme: ColorScheme,
    highContrast: Bool,
    reduceMotion: Bool,
    reduceTransparency: Bool
  ) {
    self.colorScheme = colorScheme
    self.highContrast = highContrast
    self.reduceMotion = reduceMotion
    self.reduceTransparency = reduceTransparency
  }
}

private struct CoolThemeKey: EnvironmentKey {
  static let defaultValue = CoolThemeConfiguration()
}

private struct CoolResolvedEnvironmentKey: EnvironmentKey {
  static let defaultValue = CoolResolvedEnvironment(
    colorScheme: .light,
    highContrast: false,
    reduceMotion: false,
    reduceTransparency: false
  )
}

public extension EnvironmentValues {
  var coolTheme: CoolThemeConfiguration {
    get { self[CoolThemeKey.self] }
    set { self[CoolThemeKey.self] = newValue }
  }

  var coolResolvedEnvironment: CoolResolvedEnvironment {
    get { self[CoolResolvedEnvironmentKey.self] }
    set { self[CoolResolvedEnvironmentKey.self] = newValue }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolThemeProvider<Content: View>: View {
  @Environment(\.colorScheme) private var systemColorScheme
  @Environment(\.colorSchemeContrast) private var systemContrast
  @Environment(\.accessibilityReduceMotion) private var systemReduceMotion
  @Environment(\.accessibilityReduceTransparency) private var systemReduceTransparency

  private let configuration: CoolThemeConfiguration
  private let content: Content

  public init(
    configuration: CoolThemeConfiguration = .init(),
    @ViewBuilder content: () -> Content
  ) {
    self.configuration = configuration
    self.content = content()
  }

  private var preferredColorScheme: ColorScheme? {
    switch configuration.themeMode {
    case .system: nil
    case .light: .light
    case .dark: .dark
    }
  }

  private var resolvedConfiguration: CoolThemeConfiguration {
    CoolThemeConfiguration(
      themeMode: configuration.themeMode,
      contrastMode: configuration.contrastMode == .high || systemContrast == .increased ? .high : .standard,
      motionMode: configuration.motionMode == .reduced || systemReduceMotion ? .reduced : .full,
      transparencyMode: configuration.transparencyMode == .reduced || systemReduceTransparency ? .reduced : .full
    )
  }

  private var resolvedEnvironment: CoolResolvedEnvironment {
    CoolResolvedEnvironment(
      colorScheme: preferredColorScheme ?? systemColorScheme,
      highContrast: resolvedConfiguration.contrastMode == .high,
      reduceMotion: resolvedConfiguration.motionMode == .reduced,
      reduceTransparency: resolvedConfiguration.transparencyMode == .reduced
    )
  }

  public var body: some View {
    content
      .environment(\.coolTheme, resolvedConfiguration)
      .environment(\.coolResolvedEnvironment, resolvedEnvironment)
      .preferredColorScheme(preferredColorScheme)
  }
}
