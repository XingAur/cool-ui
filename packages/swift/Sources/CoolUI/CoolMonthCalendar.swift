import SwiftUI

public enum CoolMonthDirection: String, CaseIterable, Hashable, Sendable {
  case previous
  case next
}

public struct CoolMonthCalendarHeaderContext {
  public let displayedMonth: Date
  private let onMonthChange: (CoolMonthDirection) -> Void

  init(displayedMonth: Date, onMonthChange: @escaping (CoolMonthDirection) -> Void) {
    self.displayedMonth = displayedMonth
    self.onMonthChange = onMonthChange
  }

  public func requestMonthChange(_ direction: CoolMonthDirection) {
    onMonthChange(direction)
  }
}

public struct CoolMonthCalendarAccessibilityLabels: Hashable, Sendable {
  public let previousMonth: String
  public let nextMonth: String
  public let today: String
  public let neutralMarker: String
  public let accentMarker: String
  public let successMarker: String
  public let warningMarker: String
  public let dangerMarker: String

  public init(
    previousMonth: String = "Previous month",
    nextMonth: String = "Next month",
    today: String = "Today",
    neutralMarker: String = "Neutral marker",
    accentMarker: String = "Accent marker",
    successMarker: String = "Success marker",
    warningMarker: String = "Warning marker",
    dangerMarker: String = "Danger marker"
  ) {
    self.previousMonth = previousMonth
    self.nextMonth = nextMonth
    self.today = today
    self.neutralMarker = neutralMarker
    self.accentMarker = accentMarker
    self.successMarker = successMarker
    self.warningMarker = warningMarker
    self.dangerMarker = dangerMarker
  }

  public func markerLabel(for tone: CoolTone) -> String {
    switch tone {
    case .neutral: return neutralMarker
    case .accent: return accentMarker
    case .success: return successMarker
    case .warning: return warningMarker
    case .danger: return dangerMarker
    }
  }
}

public struct CoolCalendarMarker: Hashable, Sendable {
  public let tone: CoolTone
  public let accessibilityLabel: String?

  public init(tone: CoolTone = .neutral, accessibilityLabel: String? = nil) {
    self.tone = tone
    self.accessibilityLabel = accessibilityLabel
  }
}

public struct CoolCalendarDay: Identifiable, Hashable, Sendable {
  public let date: Date
  public let day: Int
  public let secondaryText: String?
  public let accessibilityLabel: String?
  public let isToday: Bool
  public let isSelected: Bool
  public let isDisabled: Bool
  public let tone: CoolTone
  public let badge: String?
  public let markers: [CoolCalendarMarker]

  public var id: Date { date }

  public init(
    date: Date,
    day: Int,
    secondaryText: String? = nil,
    accessibilityLabel: String? = nil,
    isToday: Bool = false,
    isSelected: Bool = false,
    isDisabled: Bool = false,
    tone: CoolTone = .neutral,
    badge: String? = nil,
    markers: [CoolCalendarMarker] = []
  ) {
    self.date = date
    self.day = day
    self.secondaryText = secondaryText
    self.accessibilityLabel = accessibilityLabel
    self.isToday = isToday
    self.isSelected = isSelected
    self.isDisabled = isDisabled
    self.tone = tone
    self.badge = badge
    self.markers = Array(markers.prefix(3))
  }
}

@available(iOS 26.0, macOS 26.0, *)
public struct CoolMonthCalendar<Header: View, DayContent: View, MarkerContent: View>: View {
  @Environment(\.coolResolvedEnvironment) private var resolvedEnvironment
  @Binding private var selection: Date
  @Binding private var displayedMonth: Date

  private let days: [CoolCalendarDay]
  let weekdayLabels: [String]
  private let calendar: Calendar
  private let material: CoolGlassMaterial
  private let tone: CoolTone
  private let accessibilityLabels: CoolMonthCalendarAccessibilityLabels
  private let onSelect: (CoolCalendarDay) -> Void
  private let onMonthChange: (CoolMonthDirection) -> Void
  private let header: (CoolMonthCalendarHeaderContext) -> Header
  private let day: (CoolCalendarDay) -> DayContent
  private let marker: (CoolCalendarMarker) -> MarkerContent
  private let usesDefaultSlots: Bool

  public init(
    selection: Binding<Date>,
    displayedMonth: Binding<Date>,
    days: [CoolCalendarDay],
    weekdayLabels: [String]? = nil,
    calendar: Calendar = .autoupdatingCurrent,
    material: CoolGlassMaterial = .regular,
    tone: CoolTone = .neutral,
    accessibilityLabels: CoolMonthCalendarAccessibilityLabels = .init(),
    onSelect: @escaping (CoolCalendarDay) -> Void = { _ in },
    onMonthChange: @escaping (CoolMonthDirection) -> Void = { _ in },
    @ViewBuilder header: @escaping (CoolMonthCalendarHeaderContext) -> Header,
    @ViewBuilder day: @escaping (CoolCalendarDay) -> DayContent,
    @ViewBuilder marker: @escaping (CoolCalendarMarker) -> MarkerContent
  ) {
    _selection = selection
    _displayedMonth = displayedMonth
    self.days = days
    self.weekdayLabels = Self.resolvedWeekdayLabels(weekdayLabels, calendar: calendar)
    self.calendar = calendar
    self.material = material
    self.tone = tone
    self.accessibilityLabels = accessibilityLabels
    self.onSelect = onSelect
    self.onMonthChange = onMonthChange
    self.header = header
    self.day = day
    self.marker = marker
    self.usesDefaultSlots = false
  }

  private static func defaultWeekdayLabels(for calendar: Calendar) -> [String] {
    let symbols = calendar.veryShortStandaloneWeekdaySymbols
    guard symbols.count == 7 else {
      return Calendar(identifier: .gregorian).veryShortStandaloneWeekdaySymbols
    }
    let start = max(0, min(symbols.count - 1, calendar.firstWeekday - 1))
    return Array(symbols[start...]) + Array(symbols[..<start])
  }

  private static func resolvedWeekdayLabels(_ labels: [String]?, calendar: Calendar) -> [String] {
    guard let labels, labels.count == 7 else { return defaultWeekdayLabels(for: calendar) }
    return labels
  }

  private var spacingExtraSmall: CGFloat { CoolTokenValue.points(CoolTokens.spaceXs) }
  private var spacingSmall: CGFloat { CoolTokenValue.points(CoolTokens.spaceSm) }
  private var spacingMedium: CGFloat { CoolTokenValue.points(CoolTokens.spaceMd) }
  private var touchTarget: CGFloat { CoolTokenValue.points(CoolTokens.sizeTouchTarget) }
  private var smallRadius: CGFloat { CoolTokenValue.points(CoolTokens.radiusSmall) }
  private var hairlineWidth: CGFloat { CoolTokenValue.points(CoolTokens.borderHairline) }

  private var columns: [GridItem] {
    Array(
      repeating: GridItem(.flexible(minimum: touchTarget), spacing: spacingExtraSmall, alignment: .top),
      count: 7
    )
  }

  private var minimumGridWidth: CGFloat {
    (touchTarget * 7) + (spacingExtraSmall * 6)
  }

  private func toneColor(_ tone: CoolTone) -> Color {
    let dark = resolvedEnvironment.colorScheme == .dark
    switch tone {
    case .neutral: return .primary
    case .accent: return CoolTokenValue.color(dark ? CoolTokens.colorDarkAccent : CoolTokens.colorLightAccent)
    case .success: return CoolTokenValue.color(dark ? CoolTokens.colorDarkSuccess : CoolTokens.colorLightSuccess)
    case .warning: return CoolTokenValue.color(dark ? CoolTokens.colorDarkWarning : CoolTokens.colorLightWarning)
    case .danger: return CoolTokenValue.color(dark ? CoolTokens.colorDarkDanger : CoolTokens.colorLightDanger)
    }
  }

  func localizedMonth(_ date: Date) -> String {
    var style = Date.FormatStyle.dateTime.year().month(.wide)
    style.calendar = calendar
    style.timeZone = calendar.timeZone
    if let locale = calendar.locale { style.locale = locale }
    return date.formatted(style)
  }

  func localizedDay(_ date: Date) -> String {
    var style = Date.FormatStyle(date: .long, time: .omitted)
    style.calendar = calendar
    style.timeZone = calendar.timeZone
    if let locale = calendar.locale { style.locale = locale }
    return date.formatted(style)
  }

  func localizedAccessibilityLabel(_ model: CoolCalendarDay) -> String {
    var details = [model.accessibilityLabel ?? localizedDay(model.date)]
    if let secondaryText = model.secondaryText { details.append(secondaryText) }
    if let badge = model.badge { details.append(badge) }
    details.append(contentsOf: model.markers.map { marker in
      marker.accessibilityLabel ?? accessibilityLabels.markerLabel(for: marker.tone)
    })
    return details.joined(separator: ", ")
  }

  func resolvedDay(_ model: CoolCalendarDay) -> CoolCalendarDay {
    CoolCalendarDay(
      date: model.date,
      day: model.day,
      secondaryText: model.secondaryText,
      accessibilityLabel: model.accessibilityLabel,
      isToday: model.isToday,
      isSelected: calendar.isDate(model.date, inSameDayAs: selection),
      isDisabled: model.isDisabled,
      tone: model.tone,
      badge: model.badge,
      markers: model.markers
    )
  }

  func requestSelection(_ model: CoolCalendarDay) {
    let resolved = resolvedDay(model)
    guard !resolved.isDisabled else { return }
    onSelect(resolved)
  }

  func requestMonthChange(_ direction: CoolMonthDirection) {
    onMonthChange(direction)
  }

  @ViewBuilder
  private var headerSlot: some View {
    if usesDefaultSlots {
      HStack(spacing: spacingSmall) {
        Button {
          requestMonthChange(.previous)
        } label: {
          Image(systemName: CoolSemanticIcons.sfSymbol(for: "back"))
            .frame(minWidth: touchTarget, minHeight: touchTarget)
        }
        .accessibilityLabel(accessibilityLabels.previousMonth)

        Text(localizedMonth(displayedMonth))
          .font(.headline)
          .multilineTextAlignment(.center)
          .frame(maxWidth: .infinity)

        Button {
          requestMonthChange(.next)
        } label: {
          Image(systemName: CoolSemanticIcons.sfSymbol(for: "forward"))
            .frame(minWidth: touchTarget, minHeight: touchTarget)
        }
        .accessibilityLabel(accessibilityLabels.nextMonth)
      }
      .buttonStyle(.plain)
    } else {
      header(CoolMonthCalendarHeaderContext(
        displayedMonth: displayedMonth,
        onMonthChange: requestMonthChange
      ))
    }
  }

  @ViewBuilder
  private func daySlot(_ model: CoolCalendarDay) -> some View {
    if usesDefaultSlots {
      VStack(spacing: spacingExtraSmall) {
        Text(String(model.day))
          .font(.body.weight(model.isSelected ? .semibold : .regular))
        if let secondaryText = model.secondaryText {
          Text(secondaryText)
            .font(.caption)
            .foregroundStyle(.secondary)
            .multilineTextAlignment(.center)
            .fixedSize(horizontal: false, vertical: true)
        }
        if let badge = model.badge {
          Text(badge)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, spacingExtraSmall)
            .background(toneColor(model.tone).opacity(CoolTokens.lightingHighlightOpacity), in: Capsule())
        }
      }
      .frame(maxWidth: .infinity)
      .padding(.vertical, spacingExtraSmall)
      .foregroundStyle(toneColor(model.tone))
      .background {
        if model.isSelected {
          RoundedRectangle(cornerRadius: smallRadius, style: .continuous)
            .fill(toneColor(model.tone).opacity(CoolTokens.lightingEdgeOpacity))
        }
      }
      .overlay {
        if model.isToday {
          RoundedRectangle(cornerRadius: smallRadius, style: .continuous)
            .stroke(toneColor(model.tone), lineWidth: hairlineWidth)
        }
      }
    } else {
      day(model)
    }
  }

  @ViewBuilder
  private func markerSlot(_ model: CoolCalendarMarker) -> some View {
    if usesDefaultSlots {
      Circle()
        .fill(toneColor(model.tone))
        .frame(width: spacingExtraSmall, height: spacingExtraSmall)
    } else {
      marker(model)
    }
  }

  private func dayCell(_ model: CoolCalendarDay) -> some View {
    Button {
      requestSelection(model)
    } label: {
      VStack(spacing: spacingExtraSmall) {
        daySlot(model)
        if !model.markers.isEmpty {
          HStack(spacing: spacingExtraSmall) {
            ForEach(Array(model.markers.enumerated()), id: \.offset) { _, markerModel in
              markerSlot(markerModel)
            }
          }
        }
      }
      .frame(minWidth: touchTarget, maxWidth: .infinity, minHeight: touchTarget, alignment: .top)
      .contentShape(Rectangle())
    }
    .buttonStyle(.plain)
    .disabled(model.isDisabled)
    .opacity(model.isDisabled ? CoolTokens.opacityDisabled : 1)
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(localizedAccessibilityLabel(model))
    .accessibilityAddTraits(model.isSelected ? .isSelected : [])
    .accessibilityHint(model.isToday ? accessibilityLabels.today : "")
  }

  public var body: some View {
    CoolGlassSurface(material: material, tone: tone, size: .large) {
      VStack(spacing: spacingMedium) {
        headerSlot
        ScrollView(.horizontal) {
          LazyVGrid(columns: columns, spacing: spacingSmall) {
            ForEach(Array(weekdayLabels.enumerated()), id: \.offset) { _, label in
              Text(label)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity)
                .accessibilityAddTraits(.isHeader)
            }
            ForEach(Array(days.enumerated()), id: \.offset) { _, model in
              dayCell(resolvedDay(model))
            }
          }
          .frame(minWidth: minimumGridWidth)
        }
        .scrollIndicators(.hidden)
      }
      .frame(maxWidth: .infinity)
    }
  }
}

@available(iOS 26.0, macOS 26.0, *)
public extension CoolMonthCalendar where Header == EmptyView, DayContent == EmptyView, MarkerContent == EmptyView {
  init(
    selection: Binding<Date>,
    displayedMonth: Binding<Date>,
    days: [CoolCalendarDay],
    weekdayLabels: [String]? = nil,
    calendar: Calendar = .autoupdatingCurrent,
    material: CoolGlassMaterial = .regular,
    tone: CoolTone = .neutral,
    accessibilityLabels: CoolMonthCalendarAccessibilityLabels = .init(),
    onSelect: @escaping (CoolCalendarDay) -> Void = { _ in },
    onMonthChange: @escaping (CoolMonthDirection) -> Void = { _ in }
  ) {
    _selection = selection
    _displayedMonth = displayedMonth
    self.days = days
    self.weekdayLabels = Self.resolvedWeekdayLabels(weekdayLabels, calendar: calendar)
    self.calendar = calendar
    self.material = material
    self.tone = tone
    self.accessibilityLabels = accessibilityLabels
    self.onSelect = onSelect
    self.onMonthChange = onMonthChange
    self.header = { _ in EmptyView() }
    self.day = { _ in EmptyView() }
    self.marker = { _ in EmptyView() }
    self.usesDefaultSlots = true
  }
}
