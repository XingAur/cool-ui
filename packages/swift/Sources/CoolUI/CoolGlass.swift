import SwiftUI

@available(iOS 26.0, macOS 26.0, *)
public struct CoolBackdrop<Background: View, Content: View>: View {
  private let background: Background
  private let content: Content

  public init(
    @ViewBuilder background: () -> Background,
    @ViewBuilder content: () -> Content
  ) {
    self.background = background()
    self.content = content()
  }

  public var body: some View {
    ZStack {
      background.ignoresSafeArea()
      content
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolGlassSurface<Content: View>: View {
  @Environment(\.coolTheme) private var theme
  @Environment(\.coolResolvedEnvironment) private var resolvedEnvironment

  private let material: CoolGlassMaterial
  private let tone: CoolTone
  private let size: CoolSize
  private let interactive: Bool
  private let content: Content

  public init(
    material: CoolGlassMaterial = .regular,
    tone: CoolTone = .neutral,
    size: CoolSize = .medium,
    interactive: Bool = false,
    @ViewBuilder content: () -> Content
  ) {
    self.material = material
    self.tone = tone
    self.size = size
    self.interactive = interactive
    self.content = content()
  }

  private var radius: CGFloat {
    switch size {
    case .small: CoolTokenValue.points(CoolTokens.radiusSmall)
    case .medium: CoolTokenValue.points(CoolTokens.radiusMedium)
    case .large: CoolTokenValue.points(CoolTokens.radiusLarge)
    }
  }

  private var toneColor: Color {
    let dark = resolvedEnvironment.colorScheme == .dark
    switch tone {
    case .neutral:
      return CoolTokenValue.color(dark ? CoolTokens.colorDarkSurfaceTint : CoolTokens.colorLightSurfaceTint)
    case .accent:
      return CoolTokenValue.color(dark ? CoolTokens.colorDarkAccent : CoolTokens.colorLightAccent)
    case .success:
      return CoolTokenValue.color(dark ? CoolTokens.colorDarkSuccess : CoolTokens.colorLightSuccess)
    case .warning:
      return CoolTokenValue.color(dark ? CoolTokens.colorDarkWarning : CoolTokens.colorLightWarning)
    case .danger:
      return CoolTokenValue.color(dark ? CoolTokens.colorDarkDanger : CoolTokens.colorLightDanger)
    }
  }

  private var fallbackColor: Color {
    CoolTokenValue.color(
      resolvedEnvironment.colorScheme == .dark
        ? CoolTokens.colorDarkSurface
        : CoolTokens.colorLightSurface
    )
  }

  private var usesSolidFallback: Bool {
    material == .solidFallback
      || theme.transparencyMode == .reduced
      || resolvedEnvironment.reduceTransparency
  }

  private var paddedContent: some View {
    content
      .padding(.horizontal, CoolTokenValue.points(CoolTokens.spaceLg))
      .padding(.vertical, CoolTokenValue.points(CoolTokens.spaceSm))
  }

  @ViewBuilder
  public var body: some View {
    if usesSolidFallback {
      paddedContent
        .background(fallbackColor, in: RoundedRectangle(cornerRadius: radius, style: .continuous))
        .overlay {
          if resolvedEnvironment.highContrast {
            RoundedRectangle(cornerRadius: radius, style: .continuous)
              .stroke(toneColor, lineWidth: CoolTokenValue.points(CoolTokens.borderFocus))
          }
        }
    } else {
      switch material {
      case .clear:
        paddedContent
          .glassEffect(.clear.tint(toneColor).interactive(interactive), in: .rect(cornerRadius: radius))
      case .regular:
        paddedContent
          .glassEffect(.regular.tint(toneColor).interactive(interactive), in: .rect(cornerRadius: radius))
      case .prominent:
        paddedContent
          .glassEffect(.regular.tint(toneColor).interactive(interactive), in: .rect(cornerRadius: radius))
          .overlay {
            RoundedRectangle(cornerRadius: radius, style: .continuous)
              .stroke(toneColor.opacity(CoolTokens.lightingHighlightOpacity), lineWidth: CoolTokenValue.points(CoolTokens.borderHairline))
          }
      case .solidFallback:
        paddedContent
      }
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolGlassGroup<Content: View>: View {
  private let spacing: CGFloat?
  private let content: Content

  public init(
    spacing: CGFloat? = CoolTokenValue.points(CoolTokens.spaceSm),
    @ViewBuilder content: () -> Content
  ) {
    self.spacing = spacing
    self.content = content()
  }

  public var body: some View {
    GlassEffectContainer(spacing: spacing) { content }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolDivider: View {
  public init() {}

  public var body: some View {
    Divider()
      .overlay(CoolTokenValue.color(CoolTokens.colorLightSurfaceTint))
      .accessibilityHidden(true)
  }
}

@available(iOS 26.0, macOS 26.0, *)
public extension View {
  func coolGlassEffectID<ID: Hashable & Sendable>(
    _ id: ID?,
    in namespace: Namespace.ID
  ) -> some View {
    glassEffectID(id, in: namespace)
  }

  func coolGlassEffectUnion<ID: Hashable & Sendable>(
    id: ID?,
    namespace: Namespace.ID
  ) -> some View {
    glassEffectUnion(id: id, namespace: namespace)
  }
}
