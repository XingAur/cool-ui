import SwiftUI

@available(iOS 26.0, macOS 26.0, *)
public struct CoolSlider: View {
  @Binding private var value: Double
  private let range: ClosedRange<Double>
  private let step: Double
  private let label: String?
  private let disabled: Bool

  public init(
    value: Binding<Double>,
    in range: ClosedRange<Double>,
    step: Double = 1,
    label: String? = nil,
    disabled: Bool = false
  ) {
    _value = value
    self.range = range
    self.step = max(step, .leastNonzeroMagnitude)
    self.label = label
    self.disabled = disabled
  }

  public var body: some View {
    CoolGlassSurface(material: .regular, size: .small) {
      VStack(alignment: .leading, spacing: CoolTokenValue.points(CoolTokens.spaceXs)) {
        if let label {
          LabeledContent(label, value: value.formatted())
            .font(.caption)
        }
        Slider(value: $value, in: range, step: step)
          .accessibilityLabel(label ?? "Value")
          .accessibilityValue(value.formatted())
      }
    }
    .coolControlState(disabled: disabled)
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolStepper: View {
  private let title: String
  @Binding private var value: Double
  private let range: ClosedRange<Double>
  private let step: Double
  private let disabled: Bool

  public init(
    _ title: String,
    value: Binding<Double>,
    in range: ClosedRange<Double>,
    step: Double = 1,
    disabled: Bool = false
  ) {
    self.title = title
    _value = value
    self.range = range
    self.step = max(step, .leastNonzeroMagnitude)
    self.disabled = disabled
  }

  public var body: some View {
    CoolGlassSurface(material: .regular, size: .small) {
      Stepper(value: $value, in: range, step: step) {
        LabeledContent(title, value: value.formatted())
      }
      .accessibilityValue(value.formatted())
    }
    .coolControlState(disabled: disabled)
  }
}
