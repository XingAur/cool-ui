# MonthCalendar

MonthCalendar is a strictly controlled month-grid renderer. The consumer owns the displayed month, selected date, and visible day records. Selection and navigation callbacks are requests: the parent must update its state and pass the new value back.

## Controlled data contract

SwiftUI `Binding<Date>` and Compose `LocalDate` values are always non-empty and valid typed dates; each passed value is authoritative. Only ArkUI and WeChat string APIs treat an empty or invalid string as no selection. No platform falls back to `CoolCalendarDay.isSelected`.

| CoolCalendarDay field | Meaning |
| --- | --- |
| `date` | Swift `Date`, Compose `LocalDate`, or ISO `YYYY-MM-DD` on ArkUI and WeChat |
| `day` | Gregorian day number, 1–31 |
| `secondaryText` | Optional consumer-provided secondary label |
| `accessibilityLabel` | Optional localized complete override for spoken output |
| `isToday` | Consumer-provided today state |
| `isSelected` | Serialized field; controlled selection still wins |
| `isDisabled` | Prevents selection requests |
| `tone` | Semantic tone |
| `badge` | Optional compact badge |
| `markers` | Zero to 3 `CoolCalendarMarker` values; extra markers are clipped |

cooL UI does not calculate Gregorian grids, lunar dates, holidays, or work-rest/shift-day schedules. Those policies and localized strings belong to the consumer.

## Four-platform API

| Platform | Controlled API | Requests and slots |
| --- | --- | --- |
| SwiftUI | `Binding<Date> selection`, `Binding<Date> displayedMonth`, `[CoolCalendarDay]` | `onSelect`, `onMonthChange`; typed `CoolMonthCalendarHeaderContext`, day, and `CoolCalendarMarker` builders |
| Compose | `LocalDate selectedDate`, `YearMonth displayedMonth`, `List<CoolCalendarDay>` | `onDaySelected`, `onMonthChange`; `header`, `dayContent`, and `markerContent` lambdas |
| ArkUI | ISO `selectedDate`, `displayedMonth` (`YYYY-MM`), `CoolCalendarDay[]` | `onSelect`, `onMonthChange`; typed `@BuilderParam` `header`, `day`, and `marker` |
| WeChat | `year`, `month`, `days`, `selected-date` | `bind:select`, `bind:monthchange`; `header` named slot; `componentGenerics` maps `day` and `marker` |

WeChat payloads are exactly `select: { day: CoolCalendarDay }` and `monthchange: { direction: 'previous' | 'next' }`.

Maturity: SwiftUI **planned**, Compose **planned**, ArkUI **planned**, WeChat **planned**. ArkUI source contracts are verified, but the HarmonyOS 6 HAR build is still **pending**; documentation alone does not make a platform stable.

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| default | planned | planned | planned | planned |
| pressed | planned | planned | planned | planned |
| focused | planned | planned | planned | planned |
| selected | planned | planned | planned | planned |
| disabled | planned | planned | planned | planned |

## Accessibility and rendering

When `accessibilityLabel` is non-empty, SwiftUI and ArkUI treat it as a complete override and append no secondary text, badge, today state, or marker details. Otherwise native implementations start with a localized or ISO date and append the supported secondary details. WeChat falls back to the ISO date plus `secondaryText`, so provide a localized label when badges, today state, or markers must be read.

Use a single glass surface around the header and grid. Do not add a blur layer to every day cell.

## SwiftUI

```swift
@State private var selectedDate = Date()
@State private var displayedMonth = Date()

CoolMonthCalendar(
  selection: $selectedDate,
  displayedMonth: $displayedMonth,
  days: calendarDays,
  onSelect: { selectedDate = $0.date },
  onMonthChange: { direction in
    let offset = direction == .previous ? -1 : 1
    if let month = Calendar.autoupdatingCurrent.date(byAdding: .month, value: offset, to: displayedMonth) {
      displayedMonth = month
    }
  }
)
```

The full initializer supplies `CoolMonthCalendarHeaderContext`, `CoolCalendarDay`, and `CoolCalendarMarker` to custom builders. `context.requestMonthChange(_:)` emits a request; the parent still updates the binding.

## Compose

```kotlin
var selectedDate by remember { mutableStateOf(LocalDate.of(2026, 7, 12)) }
var displayedMonth by remember { mutableStateOf(YearMonth.of(2026, 7)) }

CoolMonthCalendar(
  selectedDate = selectedDate,
  displayedMonth = displayedMonth,
  days = calendarDays,
  onDaySelected = { selectedDate = it.date },
  onMonthChange = { direction ->
    displayedMonth = if (direction == CoolMonthDirection.Previous) displayedMonth.minusMonths(1) else displayedMonth.plusMonths(1)
  },
)
```

## ArkUI

```ts
@State selectedDate: string = '2026-07-12'
@State displayedMonth: string = '2026-07'

CoolMonthCalendar({
  selectedDate: this.selectedDate,
  displayedMonth: this.displayedMonth,
  days: createCalendarDays(this.displayedMonth),
  onSelect: (day: CoolCalendarDay) => { this.selectedDate = day.date },
  onMonthChange: (direction: CoolMonthDirection) => {
    this.displayedMonth = shiftMonth(this.displayedMonth, direction)
  }
})
```

## WeChat Mini Program

```json
{
  "usingComponents": {
    "cool-month-calendar": "@cool-ui/wechat/components/cool-month-calendar/index",
    "calendar-day": "/components/calendar-day/index",
    "calendar-marker": "/components/calendar-marker/index"
  }
}
```

```html
<cool-month-calendar
  year="{{calendarYear}}"
  month="{{calendarMonth}}"
  days="{{calendarDays}}"
  selected-date="{{calendarSelectedDate}}"
  use-custom-header="{{true}}"
  generic:day="calendar-day"
  generic:marker="calendar-marker"
  bind:select="onCalendarSelect"
  bind:monthchange="onCalendarMonthChange"
>
  <view slot="header">{{calendarYear}} / {{calendarMonth}}</view>
</cool-month-calendar>
```

```js
Page({
  onCalendarSelect(event) {
    this.setData({ calendarSelectedDate: event.detail.day.date })
  },
  onCalendarMonthChange(event) {
    const offset = event.detail.direction === 'previous' ? -1 : 1
    const next = new Date(Date.UTC(this.data.calendarYear, this.data.calendarMonth - 1 + offset, 1))
    const calendarYear = next.getUTCFullYear()
    const calendarMonth = next.getUTCMonth() + 1
    this.setData({ calendarYear, calendarMonth, calendarDays: createCalendarDays(calendarYear, calendarMonth) })
  },
})
```
