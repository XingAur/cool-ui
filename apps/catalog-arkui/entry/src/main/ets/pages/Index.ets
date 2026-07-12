import {
  CoolButton,
  CoolCalendarDay,
  CoolCalendarMarker,
  CoolCard,
  CoolComponentConfig,
  CoolMonthCalendar,
  CoolMonthDirection,
  CoolTokens,
  CoolSlider,
  CoolTextField,
  CoolToggle,
  Tone
} from '@cool-ui/arkui'

function twoDigit(value: number): string {
  return value < 10 ? `0${value}` : `${value}`
}

function calendarDate(value: Date): string {
  return `${value.getUTCFullYear()}-${twoDigit(value.getUTCMonth() + 1)}-${twoDigit(value.getUTCDate())}`
}

function shiftMonth(displayedMonth: string, direction: CoolMonthDirection): string {
  const year = Number(displayedMonth.substring(0, 4))
  const month = Number(displayedMonth.substring(5, 7))
  const offset = direction === CoolMonthDirection.previous ? -1 : 1
  const shifted = new Date(Date.UTC(year, month - 1 + offset, 1))
  return `${shifted.getUTCFullYear()}-${twoDigit(shifted.getUTCMonth() + 1)}`
}

function createCalendarDays(displayedMonth: string): CoolCalendarDay[] {
  const days: CoolCalendarDay[] = []
  const year = Number(displayedMonth.substring(0, 4))
  const month = Number(displayedMonth.substring(5, 7))
  if (displayedMonth.length !== 7 || !Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return days
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const gridOffset = firstDay.getUTCDay()
  for (let index = 0; index < 42; index += 1) {
    const cellDate = new Date(Date.UTC(year, month - 1, 1 - gridOffset + index))
    const date = calendarDate(cellDate)
    const day = cellDate.getUTCDate()
    const isSelectedToday = date === '2026-07-12'
    const markers: CoolCalendarMarker[] = isSelectedToday ? [
      new CoolCalendarMarker(Tone.accent),
      new CoolCalendarMarker(Tone.success, 'Release ready'),
      new CoolCalendarMarker(Tone.warning)
    ] : []
    days.push(new CoolCalendarDay(
      date,
      day,
      date === '2026-07-18' ? 'A deliberately long secondary calendar label that wraps' : undefined,
      undefined,
      isSelectedToday,
      isSelectedToday,
      date === '2026-07-05',
      date === '2026-07-20' ? Tone.success : Tone.neutral,
      date === '2026-07-20' ? '3' : undefined,
      markers
    ))
  }
  return days
}

@Entry
@Component
struct Index {
  @State selectedDate: string = '2026-07-12'
  @State displayedMonth: string = '2026-07'
  @State lastMonthDirection: string = 'none'

  build() {
    Scroll() {
      Column({ space: 12 }) {
        Text(`cooL UI ${CoolTokens.metaVersion} / ARKUI`).fontSize(12)
        Text('Native component catalog').fontSize(34).fontWeight(FontWeight.Medium)
        CoolButton({ config: new CoolComponentConfig('Button') })
        CoolTextField({ config: new CoolComponentConfig('TextField') })
        CoolToggle({ config: new CoolComponentConfig('Toggle') })
        CoolSlider({ config: new CoolComponentConfig('Slider') })
        CoolCard({ config: new CoolComponentConfig('Card') })
        Text(`Month request: ${this.lastMonthDirection}`).fontSize(CoolTokens.typographyCaption)
        CoolMonthCalendar({
          selectedDate: this.selectedDate,
          displayedMonth: this.displayedMonth,
          days: createCalendarDays(this.displayedMonth),
          weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          onSelect: (day: CoolCalendarDay) => {
            this.selectedDate = day.date
          },
          onMonthChange: (direction: CoolMonthDirection) => {
            this.lastMonthDirection = direction
            this.displayedMonth = shiftMonth(this.displayedMonth, direction)
          }
        })
      }.padding(24).width('100%')
    }.width('100%').height('100%')
  }
}
