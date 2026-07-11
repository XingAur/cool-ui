import SwiftUI

@available(iOS 26.0, macOS 26.0, *)
public struct CoolToast<ToastContent: View>: ViewModifier {
  @Environment(\.coolResolvedEnvironment) private var environment
  @Binding private var isPresented: Bool
  private let alignment: Alignment
  private let toastContent: ToastContent

  public init(
    isPresented: Binding<Bool>,
    alignment: Alignment = .top,
    @ViewBuilder content: () -> ToastContent
  ) {
    _isPresented = isPresented
    self.alignment = alignment
    self.toastContent = content()
  }

  public func body(content: Content) -> some View {
    content.overlay(alignment: alignment) {
      if isPresented {
        CoolGlassSurface(material: .prominent, tone: .accent, size: .small, interactive: true) {
          HStack(spacing: CoolTokenValue.points(CoolTokens.spaceSm)) {
            toastContent
            Button { isPresented = false } label: { Image(systemName: "xmark") }
              .buttonStyle(.plain)
              .accessibilityLabel("Dismiss")
          }
        }
        .padding()
        .transition(environment.reduceMotion ? .opacity : .move(edge: .top).combined(with: .opacity))
        .accessibilityElement(children: .combine)
      }
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolBanner<BannerContent: View, Actions: View>: View {
  private let tone: CoolTone
  private let onDismiss: (() -> Void)?
  private let bannerContent: BannerContent
  private let actions: Actions

  public init(
    tone: CoolTone = .accent,
    onDismiss: (() -> Void)? = nil,
    @ViewBuilder content: () -> BannerContent,
    @ViewBuilder actions: () -> Actions
  ) {
    self.tone = tone
    self.onDismiss = onDismiss
    self.bannerContent = content()
    self.actions = actions()
  }

  public var body: some View {
    CoolGlassSurface(material: .prominent, tone: tone, size: .large) {
      HStack(spacing: CoolTokenValue.points(CoolTokens.spaceMd)) {
        bannerContent
        Spacer()
        actions
        if let onDismiss {
          Button(action: onDismiss) { Image(systemName: "xmark") }
            .buttonStyle(.plain)
            .accessibilityLabel("Dismiss")
        }
      }
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public extension CoolBanner where Actions == EmptyView {
  init(
    tone: CoolTone = .accent,
    onDismiss: (() -> Void)? = nil,
    @ViewBuilder content: () -> BannerContent
  ) {
    self.init(tone: tone, onDismiss: onDismiss, content: content, actions: { EmptyView() })
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolAlertDialog<Actions: View, Message: View>: ViewModifier {
  private let title: String
  @Binding private var isPresented: Bool
  private let actions: Actions
  private let message: Message

  public init(
    title: String,
    isPresented: Binding<Bool>,
    @ViewBuilder actions: () -> Actions,
    @ViewBuilder message: () -> Message
  ) {
    self.title = title
    _isPresented = isPresented
    self.actions = actions()
    self.message = message()
  }

  public func body(content: Content) -> some View {
    content.alert(title, isPresented: $isPresented) { actions } message: { message }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolBottomSheet<SheetContent: View>: ViewModifier {
  @Binding private var isPresented: Bool
  private let onDismiss: (() -> Void)?
  private let sheetContent: SheetContent

  public init(
    isPresented: Binding<Bool>,
    onDismiss: (() -> Void)? = nil,
    @ViewBuilder content: () -> SheetContent
  ) {
    _isPresented = isPresented
    self.onDismiss = onDismiss
    self.sheetContent = content()
  }

  public func body(content: Content) -> some View {
    content.sheet(isPresented: $isPresented, onDismiss: onDismiss) { sheetContent }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolPopover<PopoverContent: View>: ViewModifier {
  @Binding private var isPresented: Bool
  private let attachmentAnchor: PopoverAttachmentAnchor
  private let arrowEdge: Edge?
  private let popoverContent: PopoverContent

  public init(
    isPresented: Binding<Bool>,
    attachmentAnchor: PopoverAttachmentAnchor = .rect(.bounds),
    arrowEdge: Edge? = nil,
    @ViewBuilder content: () -> PopoverContent
  ) {
    _isPresented = isPresented
    self.attachmentAnchor = attachmentAnchor
    self.arrowEdge = arrowEdge
    self.popoverContent = content()
  }

  public func body(content: Content) -> some View {
    content.popover(
      isPresented: $isPresented,
      attachmentAnchor: attachmentAnchor,
      arrowEdge: arrowEdge
    ) { popoverContent }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolTooltip<TooltipContent: View>: ViewModifier {
  @Environment(\.coolResolvedEnvironment) private var environment
  @Binding private var isPresented: Bool
  private let tooltipContent: TooltipContent

  public init(isPresented: Binding<Bool>, @ViewBuilder content: () -> TooltipContent) {
    _isPresented = isPresented
    self.tooltipContent = content()
  }

  public func body(content: Content) -> some View {
    content.overlay(alignment: .top) {
      if isPresented {
        CoolGlassSurface(material: .clear, size: .small) { tooltipContent }
          .offset(y: -CoolTokenValue.points(CoolTokens.sizeControlMedium))
          .transition(environment.reduceMotion ? .opacity : .scale.combined(with: .opacity))
      }
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolLoadingOverlay<OverlayContent: View>: ViewModifier {
  private let isPresented: Bool
  private let overlayContent: OverlayContent

  public init(isPresented: Bool, @ViewBuilder content: () -> OverlayContent) {
    self.isPresented = isPresented
    self.overlayContent = content()
  }

  public func body(content: Content) -> some View {
    content
      .disabled(isPresented)
      .overlay {
        if isPresented {
          ZStack {
            Rectangle().fill(.black.opacity(0.12)).ignoresSafeArea()
            CoolGlassSurface(material: .prominent, tone: .accent, size: .large) { overlayContent }
          }
          .accessibilityAddTraits(.updatesFrequently)
        }
      }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public extension View {
  func coolToast<ToastContent: View>(
    isPresented: Binding<Bool>,
    alignment: Alignment = .top,
    @ViewBuilder content: () -> ToastContent
  ) -> some View {
    modifier(CoolToast(isPresented: isPresented, alignment: alignment, content: content))
  }

  func coolAlertDialog<Actions: View, Message: View>(
    _ title: String,
    isPresented: Binding<Bool>,
    @ViewBuilder actions: () -> Actions,
    @ViewBuilder message: () -> Message
  ) -> some View {
    modifier(CoolAlertDialog(title: title, isPresented: isPresented, actions: actions, message: message))
  }

  func coolBottomSheet<SheetContent: View>(
    isPresented: Binding<Bool>,
    onDismiss: (() -> Void)? = nil,
    @ViewBuilder content: () -> SheetContent
  ) -> some View {
    modifier(CoolBottomSheet(isPresented: isPresented, onDismiss: onDismiss, content: content))
  }

  func coolPopover<PopoverContent: View>(
    isPresented: Binding<Bool>,
    @ViewBuilder content: () -> PopoverContent
  ) -> some View {
    modifier(CoolPopover(isPresented: isPresented, content: content))
  }

  func coolTooltip<TooltipContent: View>(
    isPresented: Binding<Bool>,
    @ViewBuilder content: () -> TooltipContent
  ) -> some View {
    modifier(CoolTooltip(isPresented: isPresented, content: content))
  }

  func coolLoadingOverlay<OverlayContent: View>(
    isPresented: Bool,
    @ViewBuilder content: () -> OverlayContent
  ) -> some View {
    modifier(CoolLoadingOverlay(isPresented: isPresented, content: content))
  }
}
