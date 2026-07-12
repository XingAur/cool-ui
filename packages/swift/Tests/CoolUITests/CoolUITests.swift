import Testing
import SwiftUI
@testable import CoolUI

@Test func semanticTypesRemainStable() {
  #expect(CoolThemeMode.allCases.map(\.rawValue) == ["system", "light", "dark"])
  #expect(CoolGlassMaterial.allCases.map(\.rawValue) == ["clear", "regular", "prominent", "solidFallback"])
}

@Test func semanticIconFallbackIsSafe() {
  #expect(CoolSemanticIcons.sfSymbol(for: "search") == "magnifyingglass")
  #expect(CoolSemanticIcons.sfSymbol(for: "custom") == "custom")
}

@Test @MainActor func foundationsAcceptContentAndConfiguration() {
  _ = CoolThemeProvider(configuration: .init(themeMode: .dark)) { Text("Content") }
  _ = CoolBackdrop { Text("Background") } content: { Text("Content") }
  _ = CoolGlassSurface(material: .regular, tone: .accent) { Text("Surface") }
  _ = CoolGlassGroup(spacing: 12) { Text("Grouped") }
}

@Test @MainActor func actionsAndInputsUseNativeBindings() {
  _ = CoolButton("Continue", tone: .accent, action: {})
  _ = CoolIconButton(systemImage: "search", accessibilityLabel: "Search", action: {})
  _ = CoolFloatingActionButton(systemImage: "plus", accessibilityLabel: "Add", action: {})
  _ = CoolChip("Selected", isSelected: .constant(true))
  _ = CoolTextField("Name", text: .constant(""))
  _ = CoolTextArea("Notes", text: .constant(""))
  _ = CoolSearchField(text: .constant(""), prompt: "Search")
  _ = CoolToggle("Wi-Fi", isOn: .constant(true))
  _ = CoolCheckbox("Remember me", isChecked: .constant(false))
  let options = [
    CoolSelectionOption(id: "one", title: "One"),
    CoolSelectionOption(id: "two", title: "Two"),
  ]
  _ = CoolRadioGroup("Choice", selection: .constant("one"), options: options)
  _ = CoolSelect("Choice", selection: .constant("one"), options: options)
  _ = CoolSlider(value: .constant(25.0), in: 0...100)
  _ = CoolStepper("Count", value: .constant(2.0), in: 0...10)
  _ = CoolDatePicker("Date", selection: .constant(Date()))
  _ = CoolTimePicker("Time", selection: .constant(Date()))
}

@Test @MainActor func navigationContentAndFeedbackUseNativeComposition() {
  let items = [CoolNavigationItem(id: "home", title: "Home", systemImage: "house")]
  _ = CoolTopBar("Library")
  _ = CoolBottomNavigation(selection: .constant("home"), items: items)
  _ = CoolTabBar(selection: .constant("home"), items: items)
  _ = CoolSegmentedControl(selection: .constant("home"), options: [CoolSelectionOption(id: "home", title: "Home")])
  _ = CoolNavigationRail(selection: .constant("home"), items: items)
  _ = CoolCard { Text("Card content") }
  _ = CoolList { CoolListItem(title: "Item", action: {}) }
  _ = CoolBadge("New")
  _ = CoolAvatar(name: "Ada Lovelace")
  _ = CoolProgress(value: 0.5)
  _ = CoolCircularProgress(value: 0.5)
  _ = CoolSkeleton { Text("Loading") }
  _ = CoolStatTile(title: "Sessions", value: "24", trend: "+12%")
  _ = CoolEmptyState(title: "No results", description: "Try another query")
  _ = Text("Host").coolToast(isPresented: .constant(false)) { Text("Saved") }
  _ = Text("Host").coolAlertDialog("Delete?", isPresented: .constant(false)) { Button("Delete") {} } message: { Text("This cannot be undone.") }
  _ = Text("Host").coolBottomSheet(isPresented: .constant(false)) { Text("Sheet") }
  _ = Text("Host").coolPopover(isPresented: .constant(false)) { Text("Popover") }
  _ = Text("Host").coolTooltip(isPresented: .constant(false)) { Text("Tooltip") }
  _ = Text("Host").coolLoadingOverlay(isPresented: true) { ProgressView("Loading") }
}

@Test func calendarDayCapsMarkersAtThree() {
  let markers = CoolTone.allCases.map { CoolCalendarMarker(tone: $0, accessibilityLabel: $0.rawValue) }
  let day = CoolCalendarDay(date: Date(timeIntervalSince1970: 0), day: 1, markers: markers)

  #expect(day.markers.count == 3)
  #expect(day.markers.map(\.tone) == [.neutral, .accent, .success])
}

@Test @MainActor func monthCalendarAcceptsDefaultAndCustomSlots() {
  let date = Date(timeIntervalSince1970: 0)
  let marker = CoolCalendarMarker(tone: .accent, accessibilityLabel: "Appointment")
  let day = CoolCalendarDay(
    date: date,
    day: 1,
    secondaryText: "New year",
    accessibilityLabel: "January 1",
    isToday: true,
    isSelected: true,
    tone: .accent,
    badge: "2",
    markers: [marker]
  )

  _ = CoolMonthCalendar(selection: .constant(date), displayedMonth: .constant(date), days: [day])
  _ = CoolMonthCalendar(
    selection: .constant(date),
    displayedMonth: .constant(date),
    days: [day],
    header: { context in
      Button(context.displayedMonth.formatted(.dateTime.year().month())) { context.requestMonthChange(.next) }
    },
    day: { model in Text(String(model.day)) },
    marker: { model in Circle().accessibilityLabel(model.accessibilityLabel ?? model.tone.rawValue) }
  )
}

@Test @MainActor func monthCalendarRequestsSelectionWithoutWritingBinding() {
  let initialSelection = Date(timeIntervalSince1970: 0)
  let requestedDate = Date(timeIntervalSince1970: 86_400)
  var boundSelection = initialSelection
  var selectedDay: CoolCalendarDay?
  let enabledDay = CoolCalendarDay(date: requestedDate, day: 2)
  let disabledDay = CoolCalendarDay(date: requestedDate, day: 2, isDisabled: true)
  let selection = Binding(
    get: { boundSelection },
    set: { boundSelection = $0 }
  )
  let calendar = CoolMonthCalendar(
    selection: selection,
    displayedMonth: .constant(initialSelection),
    days: [enabledDay, disabledDay],
    onSelect: { selectedDay = $0 }
  )

  calendar.requestSelection(enabledDay)
  #expect(boundSelection == initialSelection)
  #expect(selectedDay == enabledDay)

  selectedDay = nil
  calendar.requestSelection(disabledDay)
  #expect(boundSelection == initialSelection)
  #expect(selectedDay == nil)
}

@Test @MainActor func monthCalendarRequestsMonthChangeWithoutWritingDisplayedMonth() {
  let initialMonth = Date(timeIntervalSince1970: 0)
  var boundMonth = initialMonth
  var requestedDirection: CoolMonthDirection?
  let displayedMonth = Binding(
    get: { boundMonth },
    set: { boundMonth = $0 }
  )
  let calendar = CoolMonthCalendar(
    selection: .constant(initialMonth),
    displayedMonth: displayedMonth,
    days: [],
    onMonthChange: { requestedDirection = $0 }
  )

  calendar.requestMonthChange(.next)
  #expect(boundMonth == initialMonth)
  #expect(requestedDirection == .next)
}

@Test @MainActor func monthCalendarResolvesSelectionForSlotsAndCallbacks() {
  let selectedDate = Date(timeIntervalSince1970: 0)
  let otherDate = Date(timeIntervalSince1970: 86_400)
  let markers = CoolTone.allCases.map { CoolCalendarMarker(tone: $0) }
  let source = CoolCalendarDay(
    date: selectedDate,
    day: 1,
    secondaryText: "Holiday",
    accessibilityLabel: "January 1",
    isToday: true,
    isSelected: false,
    isDisabled: false,
    tone: .success,
    badge: "2",
    markers: markers
  )
  let staleSelection = CoolCalendarDay(date: otherDate, day: 2, isSelected: true)
  var callbackPayload: CoolCalendarDay?
  let calendar = CoolMonthCalendar(
    selection: .constant(selectedDate),
    displayedMonth: .constant(selectedDate),
    days: [source, staleSelection],
    onSelect: { callbackPayload = $0 }
  )

  let resolved = calendar.resolvedDay(source)
  #expect(resolved.date == source.date)
  #expect(resolved.secondaryText == source.secondaryText)
  #expect(resolved.accessibilityLabel == source.accessibilityLabel)
  #expect(resolved.isToday == source.isToday)
  #expect(resolved.isSelected)
  #expect(resolved.tone == source.tone)
  #expect(resolved.badge == source.badge)
  #expect(resolved.markers.count == 3)
  #expect(!calendar.resolvedDay(staleSelection).isSelected)

  calendar.requestSelection(source)
  #expect(callbackPayload?.isSelected == true)
  #expect(callbackPayload?.markers.count == 3)
}

@Test @MainActor func monthCalendarFormattingUsesCalendarTimeZoneAndLocale() {
  let instant = Date(timeIntervalSince1970: 0)
  var eastCalendar = Calendar(identifier: .gregorian)
  eastCalendar.timeZone = TimeZone(secondsFromGMT: 14 * 60 * 60)!
  eastCalendar.locale = Locale(identifier: "en_US_POSIX")
  var westCalendar = Calendar(identifier: .gregorian)
  westCalendar.timeZone = TimeZone(secondsFromGMT: -12 * 60 * 60)!
  westCalendar.locale = Locale(identifier: "en_US_POSIX")
  let east = CoolMonthCalendar(
    selection: .constant(instant), displayedMonth: .constant(instant), days: [], calendar: eastCalendar
  )
  let west = CoolMonthCalendar(
    selection: .constant(instant), displayedMonth: .constant(instant), days: [], calendar: westCalendar
  )

  #expect(eastCalendar.component(.day, from: instant) == 1)
  #expect(east.localizedDay(instant).contains("January"))
  #expect(east.localizedMonth(instant).contains("January"))
  #expect(westCalendar.component(.day, from: instant) == 31)
  #expect(west.localizedDay(instant).contains("December"))
  #expect(west.localizedMonth(instant).contains("December"))
}

@Test @MainActor func monthCalendarFallsBackFromInvalidWeekdayLabelsAndAcceptsLocalizedAccessibility() {
  let date = Date(timeIntervalSince1970: 0)
  let labels = CoolMonthCalendarAccessibilityLabels(
    previousMonth: "上个月",
    nextMonth: "下个月",
    today: "今天"
  )
  let calendar = CoolMonthCalendar(
    selection: .constant(date),
    displayedMonth: .constant(date),
    days: [],
    weekdayLabels: ["invalid"],
    accessibilityLabels: labels
  )

  #expect(calendar.weekdayLabels.count == 7)
}

@Test @MainActor func monthCalendarUsesLocalizedMarkerFallbacksInParentAccessibilityLabel() {
  let date = Date(timeIntervalSince1970: 0)
  let labels = CoolMonthCalendarAccessibilityLabels(
    neutralMarker: "中性标记",
    accentMarker: "强调标记",
    successMarker: "成功标记",
    warningMarker: "警告标记",
    dangerMarker: "危险标记"
  )
  let day = CoolCalendarDay(
    date: date,
    day: 1,
    markers: [
      CoolCalendarMarker(tone: .accent),
      CoolCalendarMarker(tone: .warning),
      CoolCalendarMarker(tone: .danger, accessibilityLabel: "自定义危险标记"),
    ]
  )
  let calendar = CoolMonthCalendar(
    selection: .constant(date),
    displayedMonth: .constant(date),
    days: [day],
    accessibilityLabels: labels
  )

  #expect(labels.markerLabel(for: .neutral) == "中性标记")
  #expect(labels.markerLabel(for: .accent) == "强调标记")
  #expect(labels.markerLabel(for: .success) == "成功标记")
  #expect(labels.markerLabel(for: .warning) == "警告标记")
  #expect(labels.markerLabel(for: .danger) == "危险标记")
  let parentLabel = calendar.localizedAccessibilityLabel(calendar.resolvedDay(day))
  #expect(parentLabel.contains("强调标记"))
  #expect(parentLabel.contains("警告标记"))
  #expect(parentLabel.contains("自定义危险标记"))

  let overrideDay = CoolCalendarDay(
    date: date,
    day: 1,
    accessibilityLabel: "一月一日",
    markers: [CoolCalendarMarker(tone: .danger)]
  )
  #expect(calendar.localizedAccessibilityLabel(overrideDay) == "一月一日")
}
