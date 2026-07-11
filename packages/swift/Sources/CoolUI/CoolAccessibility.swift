import SwiftUI

@available(iOS 26.0, macOS 26.0, *)
struct CoolControlStateModifier: ViewModifier {
  let disabled: Bool
  let loading: Bool
  let selected: Bool
  let errorMessage: String?

  func body(content: Content) -> some View {
    content
      .disabled(disabled || loading)
      .allowsHitTesting(!disabled && !loading)
      .opacity(disabled ? CoolTokens.opacityDisabled : 1)
      .accessibilityAddTraits(selected ? .isSelected : [])
      .accessibilityValue(loading ? "Loading" : "")
      .accessibilityHint(errorMessage ?? "")
  }
}

@available(iOS 26.0, macOS 26.0, *)
extension View {
  func coolControlState(
    disabled: Bool = false,
    loading: Bool = false,
    selected: Bool = false,
    errorMessage: String? = nil
  ) -> some View {
    modifier(CoolControlStateModifier(
      disabled: disabled,
      loading: loading,
      selected: selected,
      errorMessage: errorMessage
    ))
  }
}
