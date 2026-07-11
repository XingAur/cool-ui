// Generated from contracts/components.json. Do not edit.
import SwiftUI


@available(iOS 26.0, *)
public struct CoolTopBar: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "TopBar"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "TopBar", interactive: true, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolBottomNavigation: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "BottomNavigation"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "BottomNavigation", interactive: true, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolTabBar: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "TabBar"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "TabBar", interactive: true, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolSegmentedControl: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "SegmentedControl"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "SegmentedControl", interactive: true, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolNavigationRail: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "NavigationRail"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "NavigationRail", interactive: true, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolCard: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "Card"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "Card", interactive: true, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolList: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "List"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "List", interactive: false, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolListItem: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "ListItem"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "ListItem", interactive: true, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolBadge: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "Badge"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "Badge", interactive: false, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolAvatar: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "Avatar"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "Avatar", interactive: false, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolProgress: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "Progress"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "Progress", interactive: false, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolCircularProgress: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "CircularProgress"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "CircularProgress", interactive: false, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolSkeleton: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "Skeleton"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "Skeleton", interactive: false, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolStatTile: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "StatTile"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "StatTile", interactive: false, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolEmptyState: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "EmptyState"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "EmptyState", interactive: false, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolToast: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "Toast"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "Toast", interactive: false, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolBanner: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "Banner"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "Banner", interactive: true, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolAlertDialog: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "AlertDialog"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "AlertDialog", interactive: true, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolBottomSheet: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "BottomSheet"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "BottomSheet", interactive: true, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolPopover: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "Popover"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "Popover", interactive: true, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolTooltip: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "Tooltip"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "Tooltip", interactive: false, props: props, onEvent: onEvent)
  }
}

@available(iOS 26.0, *)
public struct CoolLoadingOverlay: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "LoadingOverlay"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "LoadingOverlay", interactive: false, props: props, onEvent: onEvent)
  }
}
