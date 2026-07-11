import SwiftUI
import CoolUI

@main
struct CoolUICatalogApp: App {
  var body: some Scene {
    WindowGroup { CatalogView() }
  }
}

struct CatalogView: View {
  private let components = [
    "ThemeProvider", "Backdrop", "GlassSurface", "GlassGroup", "Divider", "Button", "IconButton",
    "FloatingActionButton", "Chip", "TextField", "TextArea", "SearchField", "Toggle", "Checkbox",
    "RadioGroup", "Slider", "Stepper", "Select", "DatePicker", "TimePicker", "TopBar", "BottomNavigation",
    "TabBar", "SegmentedControl", "NavigationRail", "Card", "List", "ListItem", "Badge", "Avatar",
    "Progress", "CircularProgress", "Skeleton", "StatTile", "EmptyState", "Toast", "Banner", "AlertDialog",
    "BottomSheet", "Popover", "Tooltip", "LoadingOverlay",
  ]

  var body: some View {
    ZStack {
      LinearGradient(colors: [.cyan.opacity(0.28), .clear, .orange.opacity(0.16)], startPoint: .topTrailing, endPoint: .bottomLeading).ignoresSafeArea()
      ScrollView {
        LazyVStack(alignment: .leading, spacing: 12) {
          Text("cooL UI / SWIFTUI").font(.caption.monospaced()).foregroundStyle(.secondary)
          Text("Native glass catalog").font(.largeTitle.weight(.semibold))
          ForEach(components, id: \.self) { name in
            CoolGeneratedComponent(name: name, interactive: true, props: .init(label: name, accessibilityLabel: "\(name) example"), onEvent: { _ in })
          }
        }.padding(24)
      }
    }
  }
}
