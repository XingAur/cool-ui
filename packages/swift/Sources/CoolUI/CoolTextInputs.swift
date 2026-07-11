import SwiftUI

@available(iOS 26.0, macOS 26.0, *)
private struct CoolInputError: View {
  let message: String

  var body: some View {
    Label(message, systemImage: "exclamationmark.circle.fill")
      .font(.caption)
      .foregroundStyle(CoolTokenValue.color(CoolTokens.colorLightDanger))
      .accessibilityLabel("Error: \(message)")
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolTextField: View {
  private let title: String
  @Binding private var text: String
  private let prompt: String?
  private let disabled: Bool
  private let errorMessage: String?

  public init(
    _ title: String,
    text: Binding<String>,
    prompt: String? = nil,
    disabled: Bool = false,
    errorMessage: String? = nil
  ) {
    self.title = title
    _text = text
    self.prompt = prompt
    self.disabled = disabled
    self.errorMessage = errorMessage
  }

  public var body: some View {
    VStack(alignment: .leading, spacing: CoolTokenValue.points(CoolTokens.spaceXs)) {
      CoolGlassSurface(material: .regular, tone: errorMessage == nil ? .neutral : .danger) {
        TextField(title, text: $text, prompt: prompt.map(Text.init))
          .textFieldStyle(.plain)
          .accessibilityLabel(title)
      }
      .coolControlState(disabled: disabled, errorMessage: errorMessage)

      if let errorMessage { CoolInputError(message: errorMessage) }
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolTextArea: View {
  private let title: String
  @Binding private var text: String
  private let disabled: Bool
  private let errorMessage: String?
  private let minimumHeight: CGFloat

  public init(
    _ title: String,
    text: Binding<String>,
    disabled: Bool = false,
    errorMessage: String? = nil,
    minimumHeight: CGFloat = 104
  ) {
    self.title = title
    _text = text
    self.disabled = disabled
    self.errorMessage = errorMessage
    self.minimumHeight = minimumHeight
  }

  public var body: some View {
    VStack(alignment: .leading, spacing: CoolTokenValue.points(CoolTokens.spaceXs)) {
      Text(title).font(.caption).foregroundStyle(.secondary)
      CoolGlassSurface(material: .regular, tone: errorMessage == nil ? .neutral : .danger) {
        TextEditor(text: $text)
          .scrollContentBackground(.hidden)
          .frame(minHeight: minimumHeight)
          .accessibilityLabel(title)
      }
      .coolControlState(disabled: disabled, errorMessage: errorMessage)

      if let errorMessage { CoolInputError(message: errorMessage) }
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolSearchField: View {
  @Binding private var text: String
  private let prompt: String
  private let disabled: Bool
  private let onSubmit: () -> Void

  public init(
    text: Binding<String>,
    prompt: String = "Search",
    disabled: Bool = false,
    onSubmit: @escaping () -> Void = {}
  ) {
    _text = text
    self.prompt = prompt
    self.disabled = disabled
    self.onSubmit = onSubmit
  }

  public var body: some View {
    CoolGlassSurface(material: .clear, size: .small) {
      HStack(spacing: CoolTokenValue.points(CoolTokens.spaceSm)) {
        Image(systemName: CoolSemanticIcons.sfSymbol(for: "search"))
          .foregroundStyle(.secondary)
          .accessibilityHidden(true)
        TextField(prompt, text: $text)
          .textFieldStyle(.plain)
          .submitLabel(.search)
          .onSubmit(onSubmit)
        if !text.isEmpty {
          Button { text = "" } label: {
            Image(systemName: "xmark.circle.fill")
          }
          .buttonStyle(.plain)
          .accessibilityLabel("Clear search")
        }
      }
    }
    .coolControlState(disabled: disabled)
  }
}
