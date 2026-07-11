import SwiftUI

@available(iOS 26.0, macOS 26.0, *)
private extension CoolSize {
  var controlSize: ControlSize {
    switch self {
    case .small: .small
    case .medium: .regular
    case .large: .large
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
private func coolActionTone(_ tone: CoolTone, colorScheme: ColorScheme) -> Color {
  let dark = colorScheme == .dark
  switch tone {
  case .neutral:
    return CoolTokenValue.color(dark ? CoolTokens.colorDarkText : CoolTokens.colorLightText)
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

@available(iOS 26.0, macOS 26.0, *)
public struct CoolButton<Label: View>: View {
  @Environment(\.colorScheme) private var colorScheme

  private let role: ButtonRole?
  private let material: CoolGlassMaterial
  private let tone: CoolTone
  private let size: CoolSize
  private let disabled: Bool
  private let loading: Bool
  private let accessibilityLabel: String
  private let action: () -> Void
  private let label: Label

  public init(
    role: ButtonRole? = nil,
    material: CoolGlassMaterial = .regular,
    tone: CoolTone = .neutral,
    size: CoolSize = .medium,
    disabled: Bool = false,
    loading: Bool = false,
    accessibilityLabel: String,
    action: @escaping () -> Void,
    @ViewBuilder label: () -> Label
  ) {
    self.role = role
    self.material = material
    self.tone = tone
    self.size = size
    self.disabled = disabled
    self.loading = loading
    self.accessibilityLabel = accessibilityLabel
    self.action = action
    self.label = label()
  }

  private var nativeButton: some View {
    Button(role: role, action: action) {
      HStack(spacing: CoolTokenValue.points(CoolTokens.spaceSm)) {
        if loading { ProgressView().controlSize(.small) }
        label
      }
      .frame(minHeight: CoolTokenValue.points(CoolTokens.sizeTouchTarget))
      .padding(.horizontal, CoolTokenValue.points(CoolTokens.spaceSm))
    }
    .controlSize(size.controlSize)
    .tint(coolActionTone(tone, colorScheme: colorScheme))
    .accessibilityLabel(accessibilityLabel)
    .coolControlState(disabled: disabled, loading: loading)
  }

  @ViewBuilder
  public var body: some View {
    switch material {
    case .clear:
      nativeButton.buttonStyle(GlassButtonStyle(.clear.tint(coolActionTone(tone, colorScheme: colorScheme))))
    case .regular:
      nativeButton.buttonStyle(GlassButtonStyle(.regular.tint(coolActionTone(tone, colorScheme: colorScheme))))
    case .prominent:
      nativeButton.buttonStyle(GlassProminentButtonStyle())
    case .solidFallback:
      nativeButton.buttonStyle(.borderedProminent)
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public extension CoolButton where Label == Text {
  init(
    _ title: String,
    role: ButtonRole? = nil,
    material: CoolGlassMaterial = .regular,
    tone: CoolTone = .neutral,
    size: CoolSize = .medium,
    disabled: Bool = false,
    loading: Bool = false,
    accessibilityLabel: String? = nil,
    action: @escaping () -> Void
  ) {
    self.init(
      role: role,
      material: material,
      tone: tone,
      size: size,
      disabled: disabled,
      loading: loading,
      accessibilityLabel: accessibilityLabel ?? title,
      action: action
    ) { Text(title) }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolIconButton: View {
  private let systemImage: String
  private let accessibilityLabel: String
  private let material: CoolGlassMaterial
  private let tone: CoolTone
  private let size: CoolSize
  private let disabled: Bool
  private let loading: Bool
  private let action: () -> Void

  public init(
    systemImage: String,
    accessibilityLabel: String,
    material: CoolGlassMaterial = .regular,
    tone: CoolTone = .neutral,
    size: CoolSize = .medium,
    disabled: Bool = false,
    loading: Bool = false,
    action: @escaping () -> Void
  ) {
    self.systemImage = systemImage
    self.accessibilityLabel = accessibilityLabel
    self.material = material
    self.tone = tone
    self.size = size
    self.disabled = disabled
    self.loading = loading
    self.action = action
  }

  public var body: some View {
    CoolButton(
      material: material,
      tone: tone,
      size: size,
      disabled: disabled,
      loading: loading,
      accessibilityLabel: accessibilityLabel,
      action: action
    ) {
      Image(systemName: CoolSemanticIcons.sfSymbol(for: systemImage))
        .frame(width: CoolTokenValue.points(CoolTokens.sizeControlSmall), height: CoolTokenValue.points(CoolTokens.sizeControlSmall))
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolFloatingActionButton: View {
  private let systemImage: String
  private let accessibilityLabel: String
  private let tone: CoolTone
  private let disabled: Bool
  private let loading: Bool
  private let action: () -> Void

  public init(
    systemImage: String,
    accessibilityLabel: String,
    tone: CoolTone = .accent,
    disabled: Bool = false,
    loading: Bool = false,
    action: @escaping () -> Void
  ) {
    self.systemImage = systemImage
    self.accessibilityLabel = accessibilityLabel
    self.tone = tone
    self.disabled = disabled
    self.loading = loading
    self.action = action
  }

  public var body: some View {
    CoolButton(
      material: .prominent,
      tone: tone,
      size: .large,
      disabled: disabled,
      loading: loading,
      accessibilityLabel: accessibilityLabel,
      action: action
    ) {
      Image(systemName: CoolSemanticIcons.sfSymbol(for: systemImage))
        .font(.title3.weight(.semibold))
        .frame(width: CoolTokenValue.points(CoolTokens.sizeControlLarge), height: CoolTokenValue.points(CoolTokens.sizeControlLarge))
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolChip<Label: View>: View {
  @Binding private var isSelected: Bool
  private let disabled: Bool
  private let accessibilityLabel: String
  private let label: Label

  public init(
    isSelected: Binding<Bool>,
    disabled: Bool = false,
    accessibilityLabel: String,
    @ViewBuilder label: () -> Label
  ) {
    _isSelected = isSelected
    self.disabled = disabled
    self.accessibilityLabel = accessibilityLabel
    self.label = label()
  }

  public var body: some View {
    Button { isSelected.toggle() } label: { label }
      .buttonStyle(GlassButtonStyle(isSelected ? .regular.tint(.accentColor) : .clear))
      .accessibilityLabel(accessibilityLabel)
      .accessibilityValue(isSelected ? "Selected" : "Not selected")
      .coolControlState(disabled: disabled, selected: isSelected)
  }
}

@available(iOS 26.0, macOS 26.0, *)
public extension CoolChip where Label == Text {
  init(
    _ title: String,
    isSelected: Binding<Bool>,
    disabled: Bool = false,
    accessibilityLabel: String? = nil
  ) {
    self.init(
      isSelected: isSelected,
      disabled: disabled,
      accessibilityLabel: accessibilityLabel ?? title
    ) { Text(title) }
  }
}
