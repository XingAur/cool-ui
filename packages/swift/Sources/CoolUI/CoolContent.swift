import SwiftUI

@available(iOS 26.0, macOS 26.0, *)
public struct CoolCard<Content: View>: View {
  private let material: CoolGlassMaterial
  private let tone: CoolTone
  private let action: (() -> Void)?
  private let content: Content

  public init(
    material: CoolGlassMaterial = .regular,
    tone: CoolTone = .neutral,
    action: (() -> Void)? = nil,
    @ViewBuilder content: () -> Content
  ) {
    self.material = material
    self.tone = tone
    self.action = action
    self.content = content()
  }

  @ViewBuilder
  public var body: some View {
    if let action {
      CoolGlassSurface(material: material, tone: tone, size: .large, interactive: true) {
        Button(action: action) { content.frame(maxWidth: .infinity, alignment: .leading) }
          .buttonStyle(.plain)
      }
    } else {
      CoolGlassSurface(material: material, tone: tone, size: .large) {
        content.frame(maxWidth: .infinity, alignment: .leading)
      }
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolList<Content: View>: View {
  private let spacing: CGFloat
  private let content: Content

  public init(
    spacing: CGFloat = CoolTokenValue.points(CoolTokens.spaceXs),
    @ViewBuilder content: () -> Content
  ) {
    self.spacing = spacing
    self.content = content()
  }

  public var body: some View {
    CoolGlassGroup(spacing: spacing) {
      LazyVStack(spacing: spacing) { content }
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolListItem: View {
  private let title: String
  private let subtitle: String?
  private let systemImage: String?
  private let trailingText: String?
  private let disabled: Bool
  private let action: (() -> Void)?

  public init(
    title: String,
    subtitle: String? = nil,
    systemImage: String? = nil,
    trailingText: String? = nil,
    disabled: Bool = false,
    action: (() -> Void)? = nil
  ) {
    self.title = title
    self.subtitle = subtitle
    self.systemImage = systemImage
    self.trailingText = trailingText
    self.disabled = disabled
    self.action = action
  }

  private var label: some View {
    HStack(spacing: CoolTokenValue.points(CoolTokens.spaceMd)) {
      if let systemImage {
        Image(systemName: CoolSemanticIcons.sfSymbol(for: systemImage))
          .frame(width: CoolTokenValue.points(CoolTokens.sizeControlSmall))
          .accessibilityHidden(true)
      }
      VStack(alignment: .leading, spacing: CoolTokenValue.points(CoolTokens.spaceXs)) {
        Text(title)
        if let subtitle { Text(subtitle).font(.caption).foregroundStyle(.secondary) }
      }
      Spacer()
      if let trailingText { Text(trailingText).foregroundStyle(.secondary) }
      if action != nil { Image(systemName: "chevron.forward").foregroundStyle(.tertiary).accessibilityHidden(true) }
    }
    .frame(maxWidth: .infinity)
  }

  @ViewBuilder
  public var body: some View {
    CoolGlassSurface(material: .clear, size: .small, interactive: action != nil) {
      if let action {
        Button(action: action) { label }.buttonStyle(.plain)
      } else {
        label
      }
    }
    .coolControlState(disabled: disabled)
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolBadge: View {
  private let text: String
  private let tone: CoolTone

  public init(_ text: String, tone: CoolTone = .accent) {
    self.text = text
    self.tone = tone
  }

  public var body: some View {
    CoolGlassSurface(material: .prominent, tone: tone, size: .small) {
      Text(text).font(.caption.weight(.semibold))
    }
    .fixedSize()
    .accessibilityLabel(text)
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolAvatar: View {
  private let name: String
  private let systemImage: String?
  private let size: CoolSize

  public init(name: String, systemImage: String? = nil, size: CoolSize = .medium) {
    self.name = name
    self.systemImage = systemImage
    self.size = size
  }

  private var initials: String {
    name.split(separator: " ").prefix(2).compactMap(\.first).map(String.init).joined().uppercased()
  }

  public var body: some View {
    CoolGlassSurface(material: .regular, tone: .accent, size: size) {
      Group {
        if let systemImage {
          Image(systemName: CoolSemanticIcons.sfSymbol(for: systemImage))
        } else {
          Text(initials).font(.headline)
        }
      }
      .frame(width: CoolTokenValue.points(CoolTokens.sizeControlMedium), height: CoolTokenValue.points(CoolTokens.sizeControlMedium))
    }
    .clipShape(Circle())
    .accessibilityLabel(name)
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolProgress: View {
  private let value: Double
  private let total: Double
  private let label: String?

  public init(value: Double, total: Double = 1, label: String? = nil) {
    self.value = value
    self.total = max(total, .leastNonzeroMagnitude)
    self.label = label
  }

  public var body: some View {
    ProgressView(value: min(max(value, 0), total), total: total) {
      if let label { Text(label) }
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolCircularProgress: View {
  private let value: Double?
  private let total: Double
  private let accessibilityLabel: String

  public init(value: Double? = nil, total: Double = 1, accessibilityLabel: String = "Progress") {
    self.value = value
    self.total = max(total, .leastNonzeroMagnitude)
    self.accessibilityLabel = accessibilityLabel
  }

  @ViewBuilder
  public var body: some View {
    if let value {
      ProgressView(value: min(max(value, 0), total), total: total)
        .progressViewStyle(.circular)
        .accessibilityLabel(accessibilityLabel)
    } else {
      ProgressView()
        .progressViewStyle(.circular)
        .accessibilityLabel(accessibilityLabel)
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolSkeleton<Content: View>: View {
  @Environment(\.coolResolvedEnvironment) private var environment
  private let content: Content

  public init(@ViewBuilder content: () -> Content) {
    self.content = content()
  }

  public var body: some View {
    content
      .redacted(reason: .placeholder)
      .opacity(environment.reduceMotion ? 0.55 : 0.72)
      .accessibilityHidden(true)
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolStatTile: View {
  private let title: String
  private let value: String
  private let trend: String?
  private let tone: CoolTone

  public init(title: String, value: String, trend: String? = nil, tone: CoolTone = .accent) {
    self.title = title
    self.value = value
    self.trend = trend
    self.tone = tone
  }

  public var body: some View {
    CoolCard(tone: tone) {
      VStack(alignment: .leading, spacing: CoolTokenValue.points(CoolTokens.spaceSm)) {
        Text(title).font(.caption).foregroundStyle(.secondary)
        Text(value).font(.title.bold())
        if let trend { Text(trend).font(.caption.weight(.semibold)) }
      }
    }
    .accessibilityElement(children: .combine)
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolEmptyState: View {
  private let title: String
  private let description: String
  private let systemImage: String
  private let actionTitle: String?
  private let action: (() -> Void)?

  public init(
    title: String,
    description: String,
    systemImage: String = "tray",
    actionTitle: String? = nil,
    action: (() -> Void)? = nil
  ) {
    self.title = title
    self.description = description
    self.systemImage = systemImage
    self.actionTitle = actionTitle
    self.action = action
  }

  public var body: some View {
    CoolCard {
      VStack(spacing: CoolTokenValue.points(CoolTokens.spaceMd)) {
        Image(systemName: CoolSemanticIcons.sfSymbol(for: systemImage)).font(.largeTitle)
        Text(title).font(.headline)
        Text(description).font(.subheadline).foregroundStyle(.secondary).multilineTextAlignment(.center)
        if let actionTitle, let action { CoolButton(actionTitle, tone: .accent, action: action) }
      }
      .frame(maxWidth: .infinity)
    }
  }
}
