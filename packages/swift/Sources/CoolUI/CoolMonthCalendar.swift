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
  private let weekdayLabels: [String]
  private let calendar: Calendar
  private let material: CoolGlassMaterial
  private let tone: CoolTone
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
    onSelect: @escaping (CoolCalendarDay) -> Void = { _ in },
    onMonthChange: @escaping (CoolMonthDirection) -> Void = { _ in },
    @ViewBuilder header: @escaping (CoolMonthCalendarHeaderContext) -> Header,
    @ViewBuilder day: @escaping (CoolCalendarDay) -> DayContent,
    @ViewBuilder marker: @escaping (CoolCalendarMarker) -> MarkerContent
  ) {
    let labels = weekdayLabels ?? Self.defaultWeekdayLabels(for: calendar)
    precondition(labels.count == 7, "weekdayLabels must contain exactly seven labels")
    _selection = selection
    _displayedMonth = displayedMonth
    self.days = days
    self.weekdayLabels = labels
    self.calendar = calendar
    self.material = material
    self.tone = tone
    self.onSelect = onSelect
    self.onMonthChange = onMonthChange
    self.header = header
    self.day = day
    self.marker = marker
    self.usesDefaultSlots = false
  }

  private static func defaultWeekdayLabels(for calendar: Calendar) -> [String] {
    let symbols = calendar.veryShortStandaloneWeekdaySymbols
    guard symbols.count == 7 else { return symbols }
    let start = max(0, min(symbols.count - 1, calendar.firstWeekday - 1))
    return Array(symbols[start...]) + Array(symbols[..<start])
  }

  private var spacingExtraSmall: CGFloat { CoolTokenValue.points(CoolTokens.spaceXs) }
  private var spacingSmall: CGFloat { CoolTokenValue.points(CoolTokens.spaceSm) }
  private var spacingMedium: CGFloat { CoolTokenValue.points(CoolTokens.spaceMd) }
  private var touchTarget: CGFloat { CoolTokenValue.points(CoolTokens.sizeTouchTarget) }
  private var smallRadius: CGFloat { CoolTokenValue.points(CoolTokens.radiusSmall) }
  private var hairlineWidth: CGFloat { CoolTokenValue.points(CoolTokens.borderHairline) }

  private var columns: [GridItem] {
    Array(
      repeating: GridItem(.flexible(minimum: .zero), spacing: spacingExtraSmall, alignment: .top),
      count: 7
    )
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

  private func localizedMonth(_ date: Date) -> String {
    var style = Date.FormatStyle.dateTime.year().month(.wide)
    style.calendar = calendar
    return date.formatted(style)
  }

  private func localizedDay(_ date: Date) -> String {
    var style = Date.FormatStyle(date: .long, time: .omitted)
    style.calendar = calendar
    return date.formatted(style)
  }

  private func localizedAccessibilityLabel(_ model: CoolCalendarDay) -> String {
    var details = [model.accessibilityLabel ?? localizedDay(model.date)]
    if let secondaryText = model.secondaryText { details.append(secondaryText) }
    if let badge = model.badge { details.append(badge) }
    details.append(contentsOf: model.markers.compactMap(\.accessibilityLabel))
    return details.joined(separator: ", ")
  }

  func requestSelection(_ model: CoolCalendarDay) {
    guard !model.isDisabled else { return }
    onSelect(model)
  }

  func requestMonthChange(_ direction: CoolMonthDirection) {
    onMonthChange(direction)
  }

  private func isSelected(_ day: CoolCalendarDay) -> Bool {
    calendar.isDate(day.date, inSameDayAs: selection)
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
        .accessibilityLabel("Previous month")

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
        .accessibilityLabel("Next month")
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
      ZStack(alignment: .topTrailing) {
        VStack(spacing: spacingExtraSmall) {
          Text(String(model.day))
            .font(.body.weight(isSelected(model) ? .semibold : .regular))
          if let secondaryText = model.secondaryText {
            Text(secondaryText)
              .font(.caption)
              .foregroundStyle(.secondary)
              .lineLimit(2)
              .multilineTextAlignment(.center)
          }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, spacingExtraSmall)
        .foregroundStyle(toneColor(model.tone))
        .background {
          if isSelected(model) {
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

        if let badge = model.badge {
          Text(badge)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, spacingExtraSmall)
            .background(toneColor(model.tone).opacity(CoolTokens.lightingHighlightOpacity), in: Capsule())
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
                .accessibilityLabel(markerModel.accessibilityLabel ?? markerModel.tone.rawValue)
            }
          }
        }
      }
      .frame(maxWidth: .infinity, minHeight: touchTarget, alignment: .top)
      .contentShape(Rectangle())
    }
    .buttonStyle(.plain)
    .disabled(model.isDisabled)
    .opacity(model.isDisabled ? CoolTokens.opacityDisabled : 1)
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(localizedAccessibilityLabel(model))
    .accessibilityAddTraits(isSelected(model) ? .isSelected : [])
    .accessibilityHint(model.isToday ? "Today" : "")
  }

  public var body: some View {
    CoolGlassSurface(material: material, tone: tone, size: .large) {
      VStack(spacing: spacingMedium) {
        headerSlot
        LazyVGrid(columns: columns, spacing: spacingSmall) {
          ForEach(Array(weekdayLabels.enumerated()), id: \.offset) { _, label in
            Text(label)
              .font(.caption.weight(.semibold))
              .foregroundStyle(.secondary)
              .frame(maxWidth: .infinity)
              .accessibilityAddTraits(.isHeader)
          }
          ForEach(days) { model in dayCell(model) }
        }
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
    onSelect: @escaping (CoolCalendarDay) -> Void = { _ in },
    onMonthChange: @escaping (CoolMonthDirection) -> Void = { _ in }
  ) {
    let labels = weekdayLabels ?? Self.defaultWeekdayLabels(for: calendar)
    precondition(labels.count == 7, "weekdayLabels must contain exactly seven labels")
    _selection = selection
    _displayedMonth = displayedMonth
    self.days = days
    self.weekdayLabels = labels
    self.calendar = calendar
    self.material = material
    self.tone = tone
    self.onSelect = onSelect
    self.onMonthChange = onMonthChange
    self.header = { _ in EmptyView() }
    self.day = { _ in EmptyView() }
    self.marker = { _ in EmptyView() }
    self.usesDefaultSlots = true
  }
}
