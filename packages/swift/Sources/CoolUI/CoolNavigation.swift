import SwiftUI

public struct CoolNavigationItem<Value: Hashable & Sendable>: Identifiable, Hashable, Sendable {
  public let id: Value
  public let title: String
  public let systemImage: String

  public init(id: Value, title: String, systemImage: String) {
    self.id = id
    self.title = title
    self.systemImage = systemImage
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolTopBar<Leading: View, Title: View, Actions: View>: View {
  private let leading: Leading
  private let title: Title
  private let actions: Actions

  public init(
    @ViewBuilder leading: () -> Leading,
    @ViewBuilder title: () -> Title,
    @ViewBuilder actions: () -> Actions
  ) {
    self.leading = leading()
    self.title = title()
    self.actions = actions()
  }

  public var body: some View {
    CoolGlassSurface(material: .regular, size: .large) {
      HStack(spacing: CoolTokenValue.points(CoolTokens.spaceMd)) {
        leading
        title.font(.headline)
        Spacer(minLength: CoolTokenValue.points(CoolTokens.spaceMd))
        actions
      }
      .frame(maxWidth: .infinity)
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public extension CoolTopBar where Leading == EmptyView, Title == Text, Actions == EmptyView {
  init(_ title: String) {
    self.init(leading: { EmptyView() }, title: { Text(title) }, actions: { EmptyView() })
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolBottomNavigation<Value: Hashable & Sendable>: View {
  @Binding private var selection: Value
  private let items: [CoolNavigationItem<Value>]

  public init(selection: Binding<Value>, items: [CoolNavigationItem<Value>]) {
    _selection = selection
    self.items = items
  }

  public var body: some View {
    CoolGlassGroup(spacing: CoolTokenValue.points(CoolTokens.spaceXs)) {
      HStack(spacing: CoolTokenValue.points(CoolTokens.spaceXs)) {
        ForEach(items) { item in
          let itemButton = Button { selection = item.id } label: {
            VStack(spacing: CoolTokenValue.points(CoolTokens.spaceXs)) {
              Image(systemName: CoolSemanticIcons.sfSymbol(for: item.systemImage))
              Text(item.title).font(.caption)
            }
            .frame(maxWidth: .infinity)
            .frame(minHeight: CoolTokenValue.points(CoolTokens.sizeTouchTarget))
          }
          if #available(iOS 26.1, macOS 26.1, *) {
            itemButton
              .buttonStyle(GlassButtonStyle(selection == item.id ? .regular.tint(.accentColor) : .clear))
              .accessibilityValue(selection == item.id ? "Selected" : "")
          } else {
            itemButton
              .buttonStyle(GlassButtonStyle())
              .tint(selection == item.id ? Color.accentColor : Color.clear)
              .accessibilityValue(selection == item.id ? "Selected" : "")
          }
        }
      }
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolTabBar<Value: Hashable & Sendable, Content: View>: View {
  @Binding private var selection: Value
  private let items: [CoolNavigationItem<Value>]
  private let content: (Value) -> Content

  public init(
    selection: Binding<Value>,
    items: [CoolNavigationItem<Value>],
    @ViewBuilder content: @escaping (Value) -> Content
  ) {
    _selection = selection
    self.items = items
    self.content = content
  }

  public var body: some View {
    TabView(selection: $selection) {
      ForEach(items) { item in
        content(item.id)
          .tag(item.id)
          .tabItem {
            Label(item.title, systemImage: CoolSemanticIcons.sfSymbol(for: item.systemImage))
          }
      }
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public extension CoolTabBar where Content == EmptyView {
  init(selection: Binding<Value>, items: [CoolNavigationItem<Value>]) {
    self.init(selection: selection, items: items) { _ in EmptyView() }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolSegmentedControl<Value: Hashable & Sendable>: View {
  @Binding private var selection: Value
  private let options: [CoolSelectionOption<Value>]
  private let accessibilityLabel: String

  public init(
    selection: Binding<Value>,
    options: [CoolSelectionOption<Value>],
    accessibilityLabel: String = "Selection"
  ) {
    _selection = selection
    self.options = options
    self.accessibilityLabel = accessibilityLabel
  }

  public var body: some View {
    Picker(accessibilityLabel, selection: $selection) {
      ForEach(options) { option in Text(option.title).tag(option.id) }
    }
    .pickerStyle(.segmented)
    .accessibilityLabel(accessibilityLabel)
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolNavigationRail<Value: Hashable & Sendable>: View {
  @Binding private var selection: Value
  private let items: [CoolNavigationItem<Value>]

  public init(selection: Binding<Value>, items: [CoolNavigationItem<Value>]) {
    _selection = selection
    self.items = items
  }

  public var body: some View {
    CoolGlassGroup(spacing: CoolTokenValue.points(CoolTokens.spaceXs)) {
      VStack(spacing: CoolTokenValue.points(CoolTokens.spaceXs)) {
        ForEach(items) { item in
          let itemButton = Button { selection = item.id } label: {
            Label(item.title, systemImage: CoolSemanticIcons.sfSymbol(for: item.systemImage))
              .labelStyle(.iconOnly)
              .frame(width: CoolTokenValue.points(CoolTokens.sizeControlLarge), height: CoolTokenValue.points(CoolTokens.sizeControlLarge))
          }
          if #available(iOS 26.1, macOS 26.1, *) {
            itemButton
              .buttonStyle(GlassButtonStyle(selection == item.id ? .regular.tint(.accentColor) : .clear))
              .accessibilityLabel(item.title)
              .accessibilityValue(selection == item.id ? "Selected" : "")
          } else {
            itemButton
              .buttonStyle(GlassButtonStyle())
              .tint(selection == item.id ? Color.accentColor : Color.clear)
              .accessibilityLabel(item.title)
              .accessibilityValue(selection == item.id ? "Selected" : "")
          }
        }
      }
    }
  }
}
