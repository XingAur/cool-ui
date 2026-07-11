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
            Text("cooL UI / SWIFTUI")
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
          }
          .padding(24)
        }
      }
    }
  }
}
