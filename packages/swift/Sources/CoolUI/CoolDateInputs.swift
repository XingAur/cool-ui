import SwiftUI

@available(iOS 26.0, macOS 26.0, *)
public struct CoolDatePicker: View {
  private let title: String
  @Binding private var selection: Date
  private let range: ClosedRange<Date>?
  private let disabled: Bool

  public init(
    _ title: String,
    selection: Binding<Date>,
    in range: ClosedRange<Date>? = nil,
    disabled: Bool = false
  ) {
    self.title = title
    _selection = selection
    self.range = range
    self.disabled = disabled
  }

  @ViewBuilder
  private var picker: some View {
    if let range {
      DatePicker(title, selection: $selection, in: range, displayedComponents: .date)
    } else {
      DatePicker(title, selection: $selection, displayedComponents: .date)
    }
  }

  public var body: some View {
    CoolGlassSurface(material: .regular, size: .small) { picker }
      .coolControlState(disabled: disabled)
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolTimePicker: View {
  private let title: String
  @Binding private var selection: Date
  private let disabled: Bool

  public init(
    _ title: String,
    selection: Binding<Date>,
    disabled: Bool = false
  ) {
    self.title = title
    _selection = selection
    self.disabled = disabled
  }

  public var body: some View {
    CoolGlassSurface(material: .regular, size: .small) {
      DatePicker(title, selection: $selection, displayedComponents: .hourAndMinute)
    }
    .coolControlState(disabled: disabled)
  }
}
