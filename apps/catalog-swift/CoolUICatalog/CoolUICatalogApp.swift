import SwiftUI
import CoolUI

@main
struct CoolUICatalogApp: App {
  var body: some Scene {
    WindowGroup { CatalogView() }
  }
}

struct CatalogView: View {
  private static let calendarToday = catalogDate(year: 2026, month: 7, day: 12)

  @State private var themeMode: CoolThemeMode = .system
  @State private var contrastMode: CoolContrastMode = .standard
  @State private var motionMode: CoolMotionMode = .full
  @State private var transparencyMode: CoolTransparencyMode = .full
  @State private var chipSelected = true
  @State private var name = "Ada"
  @State private var notes = "Native controls, shared semantics."
  @State private var search = ""
  @State private var notificationsEnabled = true
  @State private var remembered = false
  @State private var choice = "regular"
  @State private var sliderValue = 64.0
  @State private var stepperValue = 3.0
  @State private var date = Date()
  @State private var calendarSelection = CatalogView.calendarToday
  @State private var displayedMonth = CatalogView.catalogDate(year: 2026, month: 7, day: 1)
  @State private var navigationSelection = "home"
  @State private var showToast = false
  @State private var showDialog = false
  @State private var showSheet = false
  @State private var showPopover = false
  @State private var showTooltip = false
  @State private var showLoadingOverlay = false

  private let materialOptions = [
    CoolSelectionOption(id: "clear", title: "Clear", systemImage: "sparkles"),
    CoolSelectionOption(id: "regular", title: "Regular", systemImage: "square.on.square"),
    CoolSelectionOption(id: "prominent", title: "Prominent", systemImage: "star.fill"),
  ]

  private let navigationItems = [
    CoolNavigationItem(id: "home", title: "Home", systemImage: "home"),
    CoolNavigationItem(id: "search", title: "Search", systemImage: "search"),
    CoolNavigationItem(id: "settings", title: "Settings", systemImage: "settings"),
  ]

  private static func catalogDate(year: Int, month: Int, day: Int) -> Date {
    Calendar.autoupdatingCurrent.date(from: DateComponents(year: year, month: month, day: day)) ?? Date()
  }

  private var calendarDays: [CoolCalendarDay] {
    let calendar = Calendar.autoupdatingCurrent
    guard let interval = calendar.dateInterval(of: .month, for: displayedMonth) else { return [] }
    let firstDay = interval.start
    let firstWeekdayOffset = (calendar.component(.weekday, from: firstDay) - calendar.firstWeekday + 7) % 7
    guard let gridStart = calendar.date(byAdding: .day, value: -firstWeekdayOffset, to: firstDay) else { return [] }

    return (0..<42).compactMap { offset in
      guard let fixtureDate = calendar.date(byAdding: .day, value: offset, to: gridStart) else { return nil }
      let belongsToDisplayedMonth = calendar.isDate(fixtureDate, equalTo: displayedMonth, toGranularity: .month)
      return CoolCalendarDay(
        date: fixtureDate,
        day: calendar.component(.day, from: fixtureDate),
        secondaryText: offset == 17 ? "Quarterly planning sync" : (offset == 19 ? "Festival" : nil),
        accessibilityLabel: fixtureDate.formatted(.dateTime.year().month(.wide).day()),
        isToday: calendar.isDate(fixtureDate, inSameDayAs: Self.calendarToday),
        isSelected: calendar.isDate(fixtureDate, inSameDayAs: calendarSelection),
        isDisabled: !belongsToDisplayedMonth || offset == 21,
        tone: offset == 19 ? .success : (offset == 20 ? .warning : .neutral),
        badge: offset == 16 ? "3" : nil,
        markers: offset == 17 ? [
          CoolCalendarMarker(tone: .accent, accessibilityLabel: "Work"),
          CoolCalendarMarker(tone: .success, accessibilityLabel: "Personal"),
          CoolCalendarMarker(tone: .warning, accessibilityLabel: "Reminder"),
        ] : []
      )
    }
  }

  private var configuration: CoolThemeConfiguration {
    CoolThemeConfiguration(
      themeMode: themeMode,
      contrastMode: contrastMode,
      motionMode: motionMode,
      transparencyMode: transparencyMode
    )
  }

  var body: some View {
    CoolThemeProvider(configuration: configuration) {
      CoolBackdrop {
        LinearGradient(
          colors: [.cyan.opacity(0.32), .clear, .orange.opacity(0.18)],
          startPoint: .topTrailing,
          endPoint: .bottomLeading
        )
      } content: {
        ScrollView {
          VStack(alignment: .leading, spacing: 18) {
            Text("cooL UI \(CoolTokens.metaVersion) / SWIFTUI")
              .font(.caption.monospaced())
              .foregroundStyle(.secondary)
            Text("Native glass foundations")
              .font(.largeTitle.weight(.semibold))

            CoolGlassSurface(material: .clear, size: .small) {
              Picker("Theme", selection: $themeMode) {
                ForEach(CoolThemeMode.allCases, id: \.self) { mode in
                  Text(mode.rawValue.capitalized).tag(mode)
                }
              }
              .pickerStyle(.segmented)
            }

            CoolGlassGroup(spacing: 12) {
              VStack(spacing: 12) {
                CoolGlassSurface(material: .regular, tone: .neutral) {
                  LabeledContent("Material", value: "Regular")
                }
                CoolGlassSurface(material: .prominent, tone: .accent, interactive: true) {
                  LabeledContent("Prominence", value: "Interactive")
                }
                CoolGlassSurface(material: .solidFallback, tone: .success) {
                  LabeledContent("Fallback", value: "Reduced transparency safe")
                }
              }
            }

            GroupBox("Accessibility overrides") {
              Toggle("High contrast", isOn: Binding(
                get: { contrastMode == .high },
                set: { contrastMode = $0 ? .high : .standard }
              ))
              Toggle("Reduce motion", isOn: Binding(
                get: { motionMode == .reduced },
                set: { motionMode = $0 ? .reduced : .full }
              ))
              Toggle("Reduce transparency", isOn: Binding(
                get: { transparencyMode == .reduced },
                set: { transparencyMode = $0 ? .reduced : .full }
              ))
            }

            Text("Actions and inputs")
              .font(.title2.weight(.semibold))
              .padding(.top, 8)

            HStack(spacing: 12) {
              CoolButton("Continue", tone: .accent, action: {})
              CoolIconButton(systemImage: "search", accessibilityLabel: "Search", action: {})
              CoolFloatingActionButton(systemImage: "plus", accessibilityLabel: "Add", action: {})
            }

            CoolChip("Selected filter", isSelected: $chipSelected)
            CoolTextField("Name", text: $name, prompt: "Your name")
            CoolTextArea("Notes", text: $notes)
            CoolSearchField(text: $search, prompt: "Search components")
            CoolToggle("Notifications", isOn: $notificationsEnabled)
            CoolCheckbox("Remember selection", isChecked: $remembered)
            CoolRadioGroup("Material", selection: $choice, options: materialOptions)
            CoolSelect("Material", selection: $choice, options: materialOptions)
            CoolSlider(value: $sliderValue, in: 0...100, label: "Intensity")
            CoolStepper("Layers", value: $stepperValue, in: 0...8)
            CoolDatePicker("Date", selection: $date)
            CoolTimePicker("Time", selection: $date)

            CoolMonthCalendar(
              selection: $calendarSelection,
              displayedMonth: $displayedMonth,
              days: calendarDays,
              onSelect: { calendarSelection = $0.date },
              onMonthChange: { direction in
                let value = direction == .previous ? -1 : 1
                if let month = Calendar.autoupdatingCurrent.date(byAdding: .month, value: value, to: displayedMonth) {
                  displayedMonth = month
                }
              }
            )

            Text("Navigation")
              .font(.title2.weight(.semibold))
              .padding(.top, 8)
            CoolTopBar("Library")
            CoolBottomNavigation(selection: $navigationSelection, items: navigationItems)
            CoolSegmentedControl(
              selection: $navigationSelection,
              options: navigationItems.map { CoolSelectionOption(id: $0.id, title: $0.title) },
              accessibilityLabel: "Catalog section"
            )
            HStack(alignment: .top, spacing: 12) {
              CoolNavigationRail(selection: $navigationSelection, items: navigationItems)
              CoolTabBar(selection: $navigationSelection, items: navigationItems) { item in
                CoolCard { Text("Native tab content: \(item)") }
                  .padding()
              }
              .frame(height: 180)
            }

            Text("Content")
              .font(.title2.weight(.semibold))
              .padding(.top, 8)
            CoolCard { Text("Composable card content").font(.headline) }
            CoolList {
              CoolListItem(title: "Account", subtitle: "Profile and security", systemImage: "settings", action: {})
              CoolListItem(title: "Storage", trailingText: "64 GB")
            }
            HStack(spacing: 12) {
              CoolBadge("New")
              CoolAvatar(name: "Ada Lovelace")
              CoolCircularProgress(value: sliderValue, total: 100)
            }
            CoolProgress(value: sliderValue, total: 100, label: "Catalog progress")
            CoolSkeleton { CoolCard { Text("Loading content") } }
            CoolStatTile(title: "Sessions", value: "24", trend: "+12%")
            CoolEmptyState(title: "No results", description: "Try another query", actionTitle: "Clear", action: { search = "" })

            Text("Feedback and presentations")
              .font(.title2.weight(.semibold))
              .padding(.top, 8)
            CoolBanner(onDismiss: { showToast = false }) {
              Label("A native glass banner", systemImage: "info.circle")
            }
            HStack {
              CoolButton("Toast", action: { showToast = true })
              CoolButton("Alert", action: { showDialog = true })
              CoolButton("Sheet", action: { showSheet = true })
            }
            HStack {
              CoolButton("Popover", action: { showPopover = true })
              CoolButton("Tooltip", action: { showTooltip.toggle() })
              CoolButton("Loading", action: { showLoadingOverlay.toggle() })
            }
          }
          .padding(24)
        }
        .coolToast(isPresented: $showToast) { Label("Saved", systemImage: "checkmark.circle.fill") }
        .coolAlertDialog("Delete item?", isPresented: $showDialog) {
          Button("Delete", role: .destructive) {}
          Button("Cancel", role: .cancel) {}
        } message: {
          Text("This action uses SwiftUI's native alert presentation.")
        }
        .coolBottomSheet(isPresented: $showSheet) {
          VStack(spacing: 16) {
            Text("Native bottom sheet").font(.title2.bold())
            Text("Presentation and dismissal remain platform-owned.")
          }
          .padding()
        }
        .coolPopover(isPresented: $showPopover) {
          Text("Native popover").padding()
        }
        .coolTooltip(isPresented: $showTooltip) {
          Text("Contextual help")
        }
        .coolLoadingOverlay(isPresented: showLoadingOverlay) {
          ProgressView("Loading catalog")
        }
      }
    }
  }
}
