import SwiftUI

public enum CoolThemeMode: String, CaseIterable, Hashable, Sendable { case system, light, dark }
public enum CoolGlassMaterial: String, CaseIterable, Hashable, Sendable { case clear, regular, prominent, solidFallback }
public enum CoolTone: String, CaseIterable, Hashable, Sendable { case neutral, accent, success, warning, danger }
public enum CoolSize: String, CaseIterable, Hashable, Sendable { case small, medium, large }
public enum CoolContrastMode: String, CaseIterable, Hashable, Sendable { case standard, high }
public enum CoolMotionMode: String, CaseIterable, Hashable, Sendable { case full, reduced }
public enum CoolTransparencyMode: String, CaseIterable, Hashable, Sendable { case full, reduced }
public enum CoolComponentState: String, CaseIterable, Hashable, Sendable { case `default`, pressed, focused, selected, disabled, loading, error }

public enum CoolComponentEvent: Sendable, Equatable {
  case activate
  case valueChanged(String)
  case dismiss
}

public struct CoolComponentProps: Sendable {
  public var label: String
  public var value: String
  public var placeholder: String
  public var material: CoolGlassMaterial
  public var tone: CoolTone
  public var size: CoolSize
  public var state: CoolComponentState
  public var selected: Bool
  public var disabled: Bool
  public var loading: Bool
  public var errorMessage: String?
  public var accessibilityLabel: String
  public var semanticIcon: String?
  public var options: [String]
  public var minimumValue: Double
  public var maximumValue: Double

  public init(
    label: String,
    value: String = "",
    placeholder: String = "",
    material: CoolGlassMaterial = .regular,
    tone: CoolTone = .neutral,
    size: CoolSize = .medium,
    state: CoolComponentState = .default,
    selected: Bool = false,
    disabled: Bool = false,
    loading: Bool = false,
    errorMessage: String? = nil,
    accessibilityLabel: String? = nil,
    semanticIcon: String? = nil,
    options: [String] = [],
    minimumValue: Double = .zero,
    maximumValue: Double = 100
  ) {
    self.label = label
    self.value = value
    self.placeholder = placeholder
    self.material = material
    self.tone = tone
    self.size = size
    self.state = state
    self.selected = selected
    self.disabled = disabled
    self.loading = loading
    self.errorMessage = errorMessage
    self.accessibilityLabel = accessibilityLabel ?? label
    self.semanticIcon = semanticIcon
    self.options = options
    self.minimumValue = minimumValue
    self.maximumValue = maximumValue
  }
}

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

@available(iOS 26.0, *)
struct CoolNativeGlassSurface<Content: View>: View {
  @Environment(\.coolTheme) private var theme
  @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
  let props: CoolComponentProps
  let content: Content

  init(props: CoolComponentProps, @ViewBuilder content: () -> Content) {
    self.props = props
    self.content = content()
  }

  private var radius: CGFloat {
    switch props.size {
    case .small: CoolTokenValue.points(CoolTokens.radiusSmall)
    case .medium: CoolTokenValue.points(CoolTokens.radiusMedium)
    case .large: CoolTokenValue.points(CoolTokens.radiusLarge)
    }
  }

  private var toneColor: Color {
    switch props.tone {
    case .neutral: CoolTokenValue.color(CoolTokens.colorLightSurfaceTint)
    case .accent: CoolTokenValue.color(CoolTokens.colorLightAccent)
    case .success: CoolTokenValue.color(CoolTokens.colorLightSuccess)
    case .warning: CoolTokenValue.color(CoolTokens.colorLightWarning)
    case .danger: CoolTokenValue.color(CoolTokens.colorLightDanger)
    }
  }

  private var usesSolidFallback: Bool {
    reduceTransparency || theme.transparencyMode == .reduced || props.material == .solidFallback
  }

  @ViewBuilder var body: some View {
    if usesSolidFallback {
      content
        .background(CoolTokenValue.color(CoolTokens.colorLightSurface), in: RoundedRectangle(cornerRadius: radius, style: .continuous))
    } else {
      switch props.material {
      case .clear:
        content.glassEffect(.clear.tint(toneColor), in: .rect(cornerRadius: radius))
      case .regular:
        content.glassEffect(.regular.tint(toneColor), in: .rect(cornerRadius: radius))
      case .prominent:
        content.glassEffect(.regular.tint(toneColor).interactive(), in: .rect(cornerRadius: radius))
      case .solidFallback:
        content
      }
    }
  }
}

@available(iOS 26.0, *)
public struct CoolGeneratedComponent: View {
  let name: String
  let interactive: Bool
  let props: CoolComponentProps
  let onEvent: (CoolComponentEvent) -> Void

  public init(name: String, interactive: Bool, props: CoolComponentProps, onEvent: @escaping (CoolComponentEvent) -> Void) {
    self.name = name
    self.interactive = interactive
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolNativeGlassSurface(props: props) {
      nativeContent
      .frame(minHeight: CoolTokenValue.points(CoolTokens.sizeTouchTarget))
      .padding(.horizontal, CoolTokenValue.points(CoolTokens.spaceLg))
    }
    .accessibilityLabel(props.accessibilityLabel)
  }

  private var stringBinding: Binding<String> {
    Binding(get: { props.value }, set: { onEvent(.valueChanged($0)) })
  }

  private var boolBinding: Binding<Bool> {
    Binding(get: { props.selected }, set: { onEvent(.valueChanged(String($0))) })
  }

  private var numberBinding: Binding<Double> {
    Binding(get: { Double(props.value) ?? props.minimumValue }, set: { onEvent(.valueChanged(String($0))) })
  }

  private var dateBinding: Binding<Date> {
    Binding(
      get: { ISO8601DateFormatter().date(from: props.value) ?? Date() },
      set: { onEvent(.valueChanged(ISO8601DateFormatter().string(from: $0))) }
    )
  }

  @ViewBuilder private var nativeContent: some View {
    switch name {
    case "TextField":
      TextField(props.placeholder, text: stringBinding).textFieldStyle(.plain)
    case "TextArea":
      TextEditor(text: stringBinding).scrollContentBackground(.hidden)
    case "SearchField":
      HStack { Image(systemName: CoolSemanticIcons.sfSymbol(for: "search")); TextField(props.placeholder, text: stringBinding).textFieldStyle(.plain) }
    case "Toggle":
      Toggle(props.label, isOn: boolBinding)
    case "Checkbox":
      Button(action: { onEvent(.valueChanged(String(!props.selected))) }) {
        HStack { Image(systemName: props.selected ? "checkmark.square.fill" : "square"); Text(props.label) }
      }.buttonStyle(.plain)
    case "RadioGroup", "SegmentedControl", "TabBar":
      Picker(props.label, selection: stringBinding) {
        ForEach(props.options, id: \.self) { Text($0).tag($0) }
      }.pickerStyle(.segmented)
    case "Slider":
      Slider(value: numberBinding, in: props.minimumValue...props.maximumValue).accessibilityLabel(props.accessibilityLabel)
    case "Stepper":
      Stepper(props.label, value: numberBinding, in: props.minimumValue...props.maximumValue)
    case "Select":
      Picker(props.label, selection: stringBinding) {
        ForEach(props.options, id: \.self) { Text($0).tag($0) }
      }
    case "DatePicker":
      DatePicker(props.label, selection: dateBinding, displayedComponents: .date)
    case "TimePicker":
      DatePicker(props.label, selection: dateBinding, displayedComponents: .hourAndMinute)
    case "Progress":
      ProgressView(value: numberBinding.wrappedValue, total: props.maximumValue)
    case "CircularProgress":
      ProgressView().controlSize(.regular)
    case "Divider":
      Divider()
    case "Skeleton":
      RoundedRectangle(cornerRadius: CoolTokenValue.points(CoolTokens.radiusSmall)).fill(.secondary.opacity(CoolTokens.lightingEdgeOpacity)).redacted(reason: .placeholder)
    default:
      if interactive {
        Button(action: { onEvent(.activate) }) { componentLabel }.buttonStyle(.plain)
      } else {
        componentLabel
      }
    }
  }

  private var componentLabel: some View {
    HStack(spacing: CoolTokenValue.points(CoolTokens.spaceSm)) {
      if props.loading { ProgressView() }
      if let icon = props.semanticIcon { Image(systemName: CoolSemanticIcons.sfSymbol(for: icon)) }
      Text(props.label)
      if let error = props.errorMessage { Text(error).foregroundStyle(CoolTokenValue.color(CoolTokens.colorLightDanger)) }
    }
  }
}

@available(iOS 26.0, *)
public struct CoolGlassContainer<Content: View>: View {
  @ViewBuilder private let content: Content
  public init(@ViewBuilder content: () -> Content) { self.content = content() }

  public var body: some View {
    GlassEffectContainer(spacing: CoolTokenValue.points(CoolTokens.spaceSm)) { content }
  }
}
