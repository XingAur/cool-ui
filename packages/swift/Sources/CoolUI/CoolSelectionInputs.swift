import SwiftUI

public struct CoolSelectionOption<Value: Hashable & Sendable>: Identifiable, Hashable, Sendable {
  public let id: Value
  public let title: String
  public let systemImage: String?

  public init(id: Value, title: String, systemImage: String? = nil) {
    self.id = id
    self.title = title
    self.systemImage = systemImage
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolToggle: View {
  private let title: String
  @Binding private var isOn: Bool
  private let disabled: Bool

  public init(_ title: String, isOn: Binding<Bool>, disabled: Bool = false) {
    self.title = title
    _isOn = isOn
    self.disabled = disabled
  }

  public var body: some View {
    CoolGlassSurface(material: .clear, size: .small) {
      Toggle(title, isOn: $isOn)
    }
    .coolControlState(disabled: disabled, selected: isOn)
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolCheckbox: View {
  private let title: String
  @Binding private var isChecked: Bool
  private let disabled: Bool
  private let errorMessage: String?

  public init(
    _ title: String,
    isChecked: Binding<Bool>,
    disabled: Bool = false,
    errorMessage: String? = nil
  ) {
    self.title = title
    _isChecked = isChecked
    self.disabled = disabled
    self.errorMessage = errorMessage
  }

  public var body: some View {
    CoolGlassSurface(material: .clear, tone: errorMessage == nil ? .neutral : .danger, size: .small, interactive: true) {
      Button { isChecked.toggle() } label: {
        Label(title, systemImage: isChecked ? "checkmark.square.fill" : "square")
          .frame(maxWidth: .infinity, alignment: .leading)
      }
      .buttonStyle(.plain)
      .accessibilityValue(isChecked ? "Checked" : "Not checked")
    }
    .coolControlState(disabled: disabled, selected: isChecked, errorMessage: errorMessage)
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolRadioGroup<Value: Hashable & Sendable>: View {
  private let title: String
  @Binding private var selection: Value
  private let options: [CoolSelectionOption<Value>]
  private let disabled: Bool

  public init(
    _ title: String,
    selection: Binding<Value>,
    options: [CoolSelectionOption<Value>],
    disabled: Bool = false
  ) {
    self.title = title
    _selection = selection
    self.options = options
    self.disabled = disabled
  }

  public var body: some View {
    VStack(alignment: .leading, spacing: CoolTokenValue.points(CoolTokens.spaceSm)) {
      Text(title).font(.caption).foregroundStyle(.secondary)
      CoolGlassGroup(spacing: CoolTokenValue.points(CoolTokens.spaceXs)) {
        VStack(spacing: CoolTokenValue.points(CoolTokens.spaceXs)) {
          ForEach(options) { option in
            CoolGlassSurface(
              material: selection == option.id ? .regular : .clear,
              tone: selection == option.id ? .accent : .neutral,
              size: .small,
              interactive: true
            ) {
              Button { selection = option.id } label: {
                HStack {
                  Image(systemName: selection == option.id ? "largecircle.fill.circle" : "circle")
                  if let systemImage = option.systemImage {
                    Image(systemName: CoolSemanticIcons.sfSymbol(for: systemImage))
                  }
                  Text(option.title)
                  Spacer()
                }
              }
              .buttonStyle(.plain)
              .accessibilityValue(selection == option.id ? "Selected" : "Not selected")
            }
          }
        }
      }
    }
    .coolControlState(disabled: disabled)
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolSelect<Value: Hashable & Sendable>: View {
  private let title: String
  @Binding private var selection: Value
  private let options: [CoolSelectionOption<Value>]
  private let disabled: Bool

  public init(
    _ title: String,
    selection: Binding<Value>,
    options: [CoolSelectionOption<Value>],
    disabled: Bool = false
  ) {
    self.title = title
    _selection = selection
    self.options = options
    self.disabled = disabled
  }

  public var body: some View {
    CoolGlassSurface(material: .regular, size: .small) {
      Picker(title, selection: $selection) {
        ForEach(options) { option in
          if let systemImage = option.systemImage {
            Label(option.title, systemImage: CoolSemanticIcons.sfSymbol(for: systemImage)).tag(option.id)
          } else {
            Text(option.title).tag(option.id)
          }
        }
      }
    }
    .coolControlState(disabled: disabled)
  }
}
