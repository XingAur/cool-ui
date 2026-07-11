import SwiftUI
import CoolUI

@main
struct CoolUICatalogApp: App {
  var body: some Scene {
    WindowGroup { CatalogView() }
  }
}

struct CatalogView: View {
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
