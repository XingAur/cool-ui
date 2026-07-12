import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8').catch(() => '');

test('SwiftUI foundations are public content-building APIs', async () => {
  const theme = await read('packages/swift/Sources/CoolUI/CoolTheme.swift');
  const glass = await read('packages/swift/Sources/CoolUI/CoolGlass.swift');
  const content = await read('packages/swift/Sources/CoolUI/CoolContent.swift');

  assert.match(theme, /public struct CoolThemeProvider<Content: View>/);
  assert.match(theme, /public struct CoolResolvedEnvironment/);
  assert.match(glass, /public struct CoolBackdrop<Background: View, Content: View>/);
  assert.match(glass, /public struct CoolGlassSurface<Content: View>/);
  assert.match(glass, /public struct CoolGlassGroup<Content: View>/);
  assert.match(glass, /GlassEffectContainer/);
  assert.doesNotMatch(`${glass}\n${content}`, /= CoolTokenValue\./, 'public defaults cannot reference internal token helpers');
});

test('Swift Catalog consumes public components instead of the generic renderer', async () => {
  const catalog = await read('apps/catalog-swift/CoolUICatalog/CoolUICatalogApp.swift');
  assert.doesNotMatch(catalog, /CoolGeneratedComponent/);
  assert.match(catalog, /CoolThemeProvider/);
  assert.match(catalog, /CoolGlassSurface/);
});

test('SwiftUI actions and inputs expose native typed values', async () => {
  const actions = await read('packages/swift/Sources/CoolUI/CoolActions.swift');
  const textInputs = await read('packages/swift/Sources/CoolUI/CoolTextInputs.swift');
  const selections = await read('packages/swift/Sources/CoolUI/CoolSelectionInputs.swift');
  const numeric = await read('packages/swift/Sources/CoolUI/CoolNumericInputs.swift');
  const dates = await read('packages/swift/Sources/CoolUI/CoolDateInputs.swift');

  assert.match(actions, /public struct CoolButton<Label: View>/);
  assert.match(actions, /public struct CoolIconButton: View/);
  assert.match(actions, /public struct CoolFloatingActionButton: View/);
  assert.match(actions, /public struct CoolChip<Label: View>/);
  assert.match(actions, /if #available\(iOS 26\.1/);
  assert.match(actions, /GlassButtonStyle\(\)/);
  assert.match(textInputs, /Binding<String>/);
  assert.match(selections, /Binding<Bool>/);
  assert.match(selections, /public struct CoolSelectionOption<Value: Hashable/);
  assert.match(numeric, /Binding<Double>/);
  assert.match(dates, /Binding<Date>/);
});

test('SwiftUI navigation, content, and feedback use composed native APIs', async () => {
  const navigation = await read('packages/swift/Sources/CoolUI/CoolNavigation.swift');
  const content = await read('packages/swift/Sources/CoolUI/CoolContent.swift');
  const feedback = await read('packages/swift/Sources/CoolUI/CoolFeedback.swift');

  assert.match(navigation, /public struct CoolNavigationItem<Value: Hashable/);
  assert.match(navigation, /public struct CoolTabBar<Value: Hashable/);
  assert.match(content, /public struct CoolCard<Content: View>/);
  assert.match(content, /public struct CoolList<Content: View>/);
  assert.match(feedback, /public struct CoolAlertDialog<Actions: View, Message: View>: ViewModifier/);
  assert.match(feedback, /\.alert\(/);
  assert.match(feedback, /public struct CoolBottomSheet<SheetContent: View>: ViewModifier/);
  assert.match(feedback, /\.sheet\(/);
  assert.match(feedback, /public struct CoolPopover<PopoverContent: View>: ViewModifier/);
  assert.match(feedback, /\.popover\(/);
  assert.match(feedback, /public struct CoolLoadingOverlay<OverlayContent: View>: ViewModifier/);
});

test('SwiftUI MonthCalendar exposes controlled models and native grid composition', async () => {
  const calendar = await read('packages/swift/Sources/CoolUI/CoolMonthCalendar.swift');
  const accessibilityHelper = calendar.match(/func localizedAccessibilityLabel[\s\S]*?\n  }/)?.[0] ?? '';

  assert.match(calendar, /public enum CoolMonthDirection[^\n]*Hashable[^\n]*Sendable/);
  assert.match(calendar, /public struct CoolCalendarMarker: Hashable, Sendable/);
  assert.match(calendar, /public struct CoolCalendarDay: Identifiable, Hashable, Sendable/);
  assert.match(calendar, /Array\(markers\.prefix\(3\)\)/);
  assert.match(calendar, /public struct CoolMonthCalendarHeaderContext/);
  assert.match(calendar, /public struct CoolMonthCalendarAccessibilityLabels: Hashable, Sendable/);
  assert.match(calendar, /public let previousMonth: String/);
  assert.match(calendar, /public let nextMonth: String/);
  assert.match(calendar, /public let today: String/);
  assert.match(calendar, /public let neutralMarker: String/);
  assert.match(calendar, /public let accentMarker: String/);
  assert.match(calendar, /public let successMarker: String/);
  assert.match(calendar, /public let warningMarker: String/);
  assert.match(calendar, /public let dangerMarker: String/);
  assert.match(calendar, /public func markerLabel\(for tone: CoolTone\) -> String/);
  assert.match(calendar, /public struct CoolMonthCalendar<Header: View, DayContent: View, MarkerContent: View>: View/);
  assert.match(calendar, /header: @escaping \(CoolMonthCalendarHeaderContext\) -> Header/);
  assert.match(calendar, /@Binding private var selection: Date/);
  assert.match(calendar, /@Binding private var displayedMonth: Date/);
  assert.match(calendar, /LazyVGrid\(columns:/);
  assert.match(calendar, /CoolGlassSurface/);
  assert.match(calendar, /CoolSemanticIcons\.sfSymbol\(for:/);
  assert.match(calendar, /\n  func requestSelection\(_ model: CoolCalendarDay\)/);
  assert.match(calendar, /\n  func requestMonthChange\(_ direction: CoolMonthDirection\)/);
  assert.match(calendar, /\n  func resolvedDay\(_ model: CoolCalendarDay\) -> CoolCalendarDay/);
  assert.match(calendar, /style\.timeZone = calendar\.timeZone/);
  assert.match(calendar, /if let locale = calendar\.locale/);
  assert.match(calendar, /style\.locale = locale/);
  assert.match(calendar, /GridItem\(\.flexible\(minimum: touchTarget\)/);
  assert.match(calendar, /minimumGridWidth/);
  assert.match(calendar, /ScrollView\(\.horizontal\)/);
  assert.match(calendar, /\.frame\(minWidth: touchTarget[^\n]*minHeight: touchTarget/);
  assert.match(calendar, /\.fixedSize\(horizontal: false, vertical: true\)/);
  assert.match(calendar, /ForEach\(Array\(days\.enumerated\(\)\), id: \\.offset\)/);
  assert.doesNotMatch(calendar, /ForEach\(days\)/, 'duplicate dates require offset-based cell identity');
  assert.doesNotMatch(calendar, /\.lineLimit\(2\)/, 'secondary text must grow at accessibility sizes');
  assert.doesNotMatch(calendar, /ZStack\(alignment: \.topTrailing\)/, 'badges must stay in flow layout');
  assert.doesNotMatch(calendar, /precondition\(labels\.count == 7/, 'invalid weekday labels must fall back safely');
  assert.doesNotMatch(calendar, /selection\s*=\s*\w+\.date/, 'the strictly controlled component must not write selection');
  assert.match(calendar, /onMonthChange\(direction\)/);
  assert.doesNotMatch(calendar, /\(Date, @escaping \(CoolMonthDirection\) -> Void\) -> Header/);
  assert.match(accessibilityHelper, /model\.secondaryText/);
  assert.match(accessibilityHelper, /model\.badge/);
  assert.match(accessibilityHelper, /model\.markers\.map/);
  assert.match(accessibilityHelper, /accessibilityLabels\.markerLabel\(for: marker\.tone\)/);
  assert.doesNotMatch(accessibilityHelper, /compactMap/, 'nil marker labels must use the injected tone fallback');
  assert.doesNotMatch(calendar, /markerSlot\(markerModel\)\s*\n\s*\.accessibilityLabel/, 'ignored marker children must not advertise ineffective labels');
  assert.doesNotMatch(calendar, /date\(byAdding:\s*\.month/, 'the controlled component must not calculate a new month');
  assert.doesNotMatch(calendar, /\.glassEffect\(/, 'calendar days must remain native buttons inside one glass surface');
});

test('SwiftUI MonthCalendar uses AA selected ink and explicit labels fully override synthesized speech', async () => {
  const [calendar, swiftTests, tokens] = await Promise.all([
    read('packages/swift/Sources/CoolUI/CoolMonthCalendar.swift'),
    read('packages/swift/Tests/CoolUITests/CoolUITests.swift'),
    read('packages/tokens/src/tokens.json').then(JSON.parse),
  ]);
  const resolveColor = (value) => value.startsWith('{')
    ? resolveColor(value.slice(1, -1).split('.').reduce((node, key) => node[key], tokens).$value)
    : value;
  const hex = (path) => resolveColor(path.split('.').reduce((node, key) => node[key], tokens).$value).slice(0, 7);
  const luminance = (rgb) => {
    const channel = (start) => {
      const value = Number.parseInt(rgb.slice(start, start + 2), 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return (0.2126 * channel(1)) + (0.7152 * channel(3)) + (0.0722 * channel(5));
  };
  const contrast = (foreground, background) => {
    const first = luminance(foreground);
    const second = luminance(background);
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  };
  const ink = hex('color.primitive.ink900');
  for (const background of ['color.primitive.ice0', 'color.light.accent', 'color.light.success', 'color.light.warning', 'color.light.danger']) {
    assert.ok(contrast(ink, hex(background)) >= 4.5, background);
  }

  assert.match(calendar, /func selectedDayBackground\(/);
  assert.match(calendar, /CoolTokens\.colorPrimitiveInk900/);
  assert.doesNotMatch(calendar, /foregroundStyle\(toneColor\(model\.tone\)\)/);
  assert.match(calendar, /if let accessibilityLabel = model\.accessibilityLabel, !accessibilityLabel\.isEmpty \{\s*return accessibilityLabel\s*\}/);
  assert.match(swiftTests, /localizedAccessibilityLabel\(overrideDay\) == "一月一日"/);
  assert.doesNotMatch(swiftTests, /一月一日, 强调标记/);
});

test('Swift Catalog owns a controlled 42-cell MonthCalendar fixture', async () => {
  const catalog = await read('apps/catalog-swift/CoolUICatalog/CoolUICatalogApp.swift');
  const selectionFixture = catalog.match(/@State private var calendarSelection = CatalogView\.(\w+)/)?.[1];
  const todayFixture = catalog.match(/isToday: calendar\.isDate\(fixtureDate, inSameDayAs: Self\.(\w+)\)/)?.[1];

  assert.match(catalog, /private static let calendarToday = catalogDate\(year: 2026, month: 7, day: 12\)/);
  assert.match(catalog, /@State private var calendarSelection/);
  assert.match(catalog, /@State private var displayedMonth/);
  assert.match(catalog, /0\.\.<42/);
  assert.match(catalog, /CoolMonthCalendar\(/);
  assert.match(catalog, /selection: \$calendarSelection/);
  assert.match(catalog, /displayedMonth: \$displayedMonth/);
  assert.match(catalog, /Quarterly planning sync/);
  assert.match(catalog, /isDisabled:/);
  assert.match(catalog, /isToday:/);
  assert.match(catalog, /isSelected:/);
  assert.match(catalog, /badge:/);
  assert.match(catalog, /markers:/);
  assert.equal(selectionFixture, 'calendarToday');
  assert.equal(todayFixture, selectionFixture);
});
