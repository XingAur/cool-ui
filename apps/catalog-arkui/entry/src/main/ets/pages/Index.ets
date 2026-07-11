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

function catalogDate(index: number): string {
  if (index < 3) return `2026-06-${twoDigit(index + 28)}`
  if (index < 34) return `2026-07-${twoDigit(index - 2)}`
  return `2026-08-${twoDigit(index - 33)}`
}

function createCalendarDays(displayedMonth: string): CoolCalendarDay[] {
  const days: CoolCalendarDay[] = []
  if (displayedMonth !== '2026-07') return days
  for (let index = 0; index < 42; index += 1) {
    const date = catalogDate(index)
    const day = index < 3 ? index + 28 : (index < 34 ? index - 2 : index - 33)
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
          displayedMonth: '2026-07',
          days: createCalendarDays('2026-07'),
          weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          onSelect: (day: CoolCalendarDay) => {
            this.selectedDate = day.date
          },
          onMonthChange: (direction: CoolMonthDirection) => {
            this.lastMonthDirection = direction
          }
        })
      }.padding(24).width('100%')
    }.width('100%').height('100%')
  }
}
