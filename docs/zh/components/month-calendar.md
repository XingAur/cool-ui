# MonthCalendar

MonthCalendar 是严格受控的月历网格。调用方拥有展示月份、选中日期和所有可见日期数据；选择与月份切换回调只表达请求，父级必须更新状态并把新值传回组件。

## 受控数据契约

SwiftUI `Binding<Date>` 与 Compose `LocalDate` 都是非空且合法的类型化日期；传入值是权威选中值。只有 ArkUI 与微信的字符串 API 把空字符串或非法字符串解释为无选中。任何平台都不会回退到 `CoolCalendarDay.isSelected`。

| CoolCalendarDay 字段 | 含义 |
| --- | --- |
| `date` | Swift 使用 `Date`，Compose 使用 `LocalDate`，ArkUI 与微信使用 ISO `YYYY-MM-DD` |
| `day` | 1–31 的公历日序号 |
| `secondaryText` | 调用方提供的可选次级文本 |
| `accessibilityLabel` | 可选的本地化朗读完整覆盖文本 |
| `isToday` | 调用方提供的“今天”状态 |
| `isSelected` | 序列化字段；受控选中值仍优先 |
| `isDisabled` | 禁止发送选择请求 |
| `tone` | 语义色调 |
| `badge` | 可选的紧凑徽标 |
| `markers` | 0 至 3 个 `CoolCalendarMarker`，超出的标记会被截断 |

cooL UI 不计算公历网格、农历、节假日或调休/工作日安排。这些业务规则和本地化文字由调用方负责。

## 四端 API 对照

| 平台 | 受控 API | 请求与插槽 |
| --- | --- | --- |
| SwiftUI | `Binding<Date> selection`、`Binding<Date> displayedMonth`、`[CoolCalendarDay]` | `onSelect`、`onMonthChange`；类型化 `CoolMonthCalendarHeaderContext`、日期和 `CoolCalendarMarker` Builder |
| Compose | `LocalDate selectedDate`、`YearMonth displayedMonth`、`List<CoolCalendarDay>` | `onDaySelected`、`onMonthChange`；`header`、`dayContent`、`markerContent` lambda |
| ArkUI | ISO `selectedDate`、`displayedMonth`（`YYYY-MM`）、`CoolCalendarDay[]` | `onSelect`、`onMonthChange`；类型化 `@BuilderParam`：`header`、`day`、`marker` |
| 微信小程序 | `year`、`month`、`days`、`selected-date` | `bind:select`、`bind:monthchange`；`header` 具名插槽；`componentGenerics` 映射 `day` 和 `marker` |

微信事件详情严格为 `select: { day: CoolCalendarDay }` 与 `monthchange: { direction: 'previous' | 'next' }`。

成熟度：SwiftUI **planned**、Compose **planned**、ArkUI **planned**、微信小程序 **planned**。ArkUI 已完成源码契约验证，但 HarmonyOS 6 HAR 构建仍为**待验证（pending）**；仅凭文档不会把平台标为 stable。

## 状态矩阵

| 状态 | SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- | --- |
| default | planned | planned | planned | planned |
| pressed | planned | planned | planned | planned |
| focused | planned | planned | planned | planned |
| selected | planned | planned | planned | planned |
| disabled | planned | planned | planned | planned |

## 无障碍与渲染

SwiftUI、Compose、ArkUI 与 WeChat 均将非空 `accessibilityLabel` 作为朗读内容的完整覆盖，不再追加次级文本、徽标、今天状态或标记详情。否则各原生实现从本地化日期或 ISO 日期开始并追加支持的次级信息；微信回退为 ISO 日期加 `secondaryText`。

日历整体只使用一个玻璃表面，包住头部和网格。不要给每个日期单元添加独立模糊层。

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

完整初始化器会把 `CoolMonthCalendarHeaderContext`、`CoolCalendarDay`、`CoolCalendarMarker` 传给自定义 Builder。`context.requestMonthChange(_:)` 只发送请求，父级仍需更新 Binding。

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

## 微信小程序

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
