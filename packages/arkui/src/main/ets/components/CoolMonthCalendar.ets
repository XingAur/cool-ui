import { CoolTokens } from '../tokens/CoolTokens'
import { Tone, coolTokenNumber, coolToneColor } from './CoolCore'

export enum CoolMonthDirection {
  previous = 'previous',
  next = 'next'
}

export class CoolCalendarMarker {
  tone: Tone
  accessibilityLabel?: string

  constructor(tone: Tone = Tone.neutral, accessibilityLabel?: string) {
    this.tone = resolveCoolTone(tone)
    this.accessibilityLabel = accessibilityLabel
  }
}

export class CoolCalendarDay {
  date: string
  day: number
  secondaryText?: string
  accessibilityLabel?: string
  isToday: boolean
  isSelected: boolean
  isDisabled: boolean
  tone: Tone
  badge?: string
  markers: CoolCalendarMarker[]

  constructor(
    date: string,
    day: number,
    secondaryText?: string,
    accessibilityLabel?: string,
    isToday: boolean = false,
    isSelected: boolean = false,
    isDisabled: boolean = false,
    tone: Tone = Tone.neutral,
    badge?: string,
    markers: CoolCalendarMarker[] = []
  ) {
    this.date = date
    this.day = day
    this.secondaryText = secondaryText
    this.accessibilityLabel = accessibilityLabel
    this.isToday = isToday
    this.isSelected = isSelected
    this.isDisabled = isDisabled
    this.tone = resolveCoolTone(tone)
    this.badge = badge
    this.markers = markers.map((marker: CoolCalendarMarker) => {
      return new CoolCalendarMarker(marker.tone, marker.accessibilityLabel)
    })
  }
}

export class CoolMonthCalendarAccessibilityLabels {
  previousMonth: string
  nextMonth: string
  today: string
  neutralMarker: string
  accentMarker: string
  successMarker: string
  warningMarker: string
  dangerMarker: string

  constructor(
    previousMonth: string = 'Previous month',
    nextMonth: string = 'Next month',
    today: string = 'Today',
    neutralMarker: string = 'Neutral marker',
    accentMarker: string = 'Accent marker',
    successMarker: string = 'Success marker',
    warningMarker: string = 'Warning marker',
    dangerMarker: string = 'Danger marker'
  ) {
    this.previousMonth = previousMonth
    this.nextMonth = nextMonth
    this.today = today
    this.neutralMarker = neutralMarker
    this.accentMarker = accentMarker
    this.successMarker = successMarker
    this.warningMarker = warningMarker
    this.dangerMarker = dangerMarker
  }

  markerToneLabel(tone: Tone): string {
    if (tone === Tone.accent) return this.accentMarker
    if (tone === Tone.success) return this.successMarker
    if (tone === Tone.warning) return this.warningMarker
    if (tone === Tone.danger) return this.dangerMarker
    return this.neutralMarker
  }
}

export class CoolMonthCalendarHeaderContext {
  displayedMonth: string
  previousMonthLabel: string
  nextMonthLabel: string
  requestMonthChange: (direction: CoolMonthDirection) => void

  constructor(
    displayedMonth: string,
    previousMonthLabel: string,
    nextMonthLabel: string,
    requestMonthChange: (direction: CoolMonthDirection) => void
  ) {
    this.displayedMonth = displayedMonth
    this.previousMonthLabel = previousMonthLabel
    this.nextMonthLabel = nextMonthLabel
    this.requestMonthChange = requestMonthChange
  }
}

export class CoolResolvedCalendarDayItem {
  day: CoolCalendarDay
  key: string

  constructor(day: CoolCalendarDay, key: string) {
    this.day = day
    this.key = key
  }
}

export function resolveCoolTone(tone: Tone): Tone {
  if (tone === Tone.accent) return Tone.accent
  if (tone === Tone.success) return Tone.success
  if (tone === Tone.warning) return Tone.warning
  if (tone === Tone.danger) return Tone.danger
  return Tone.neutral
}

export function isCoolGregorianLeapYear(year: number): boolean {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)
}

export function daysInCoolGregorianMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0
  const monthLengths: number[] = [31, isCoolGregorianLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return monthLengths[month - 1]
}

function isCoolDateDigit(value: string): boolean {
  const code = value.charCodeAt(0)
  return code >= 48 && code <= 57
}

function coolGregorianDay(value: string): number {
  if (value.length !== 10 || value.charAt(4) !== '-' || value.charAt(7) !== '-') return 0
  for (let index = 0; index < value.length; index += 1) {
    if (index === 4 || index === 7) continue
    if (!isCoolDateDigit(value.charAt(index))) return 0
  }
  const year = Number(value.substring(0, 4))
  const month = Number(value.substring(5, 7))
  const day = Number(value.substring(8, 10))
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return 0
  if (day < 1 || day > daysInCoolGregorianMonth(year, month)) return 0
  return day
}

export function isCoolGregorianDate(value: string): boolean {
  return coolGregorianDay(value) > 0
}

export function isCoolDisplayedMonth(value: string): boolean {
  return value.length === 7 && isCoolGregorianDate(`${value}-01`)
}

function cloneCoolCalendarMarker(marker: CoolCalendarMarker): CoolCalendarMarker {
  return new CoolCalendarMarker(resolveCoolTone(marker.tone), marker.accessibilityLabel)
}

export function cloneCoolCalendarDay(model: CoolCalendarDay): CoolCalendarDay {
  const markers = model.markers.slice(0, 3).map((marker: CoolCalendarMarker) => {
    return new CoolCalendarMarker(resolveCoolTone(marker.tone), marker.accessibilityLabel)
  })
  return new CoolCalendarDay(
    model.date,
    model.day,
    model.secondaryText,
    model.accessibilityLabel,
    model.isToday,
    model.isSelected,
    model.isDisabled,
    resolveCoolTone(model.tone),
    model.badge,
    markers
  )
}

function resolvedCoolAccessibilityLabel(
  model: CoolCalendarDay,
  labels: CoolMonthCalendarAccessibilityLabels,
  markers: CoolCalendarMarker[]
): string {
  const baseLabel = model.accessibilityLabel !== undefined && model.accessibilityLabel.length > 0 ? model.accessibilityLabel : model.date
  const details: string[] = [baseLabel]
  if (model.secondaryText !== undefined && model.secondaryText.length > 0) details.push(model.secondaryText)
  if (model.badge !== undefined && model.badge.length > 0) details.push(model.badge)
  if (model.isToday) details.push(labels.today)
  markers.forEach((marker: CoolCalendarMarker) => {
    if (marker.accessibilityLabel !== undefined && marker.accessibilityLabel.length > 0) {
      details.push(marker.accessibilityLabel)
    } else {
      details.push(labels.markerToneLabel(marker.tone))
    }
  })
  return details.join(', ')
}

export function resolveCoolCalendarDays(
  days: CoolCalendarDay[],
  selectedDate: string,
  labels: CoolMonthCalendarAccessibilityLabels = new CoolMonthCalendarAccessibilityLabels()
): CoolResolvedCalendarDayItem[] {
  const hasControlledSelection = isCoolGregorianDate(selectedDate)
  const occurrences: Map<string, number> = new Map<string, number>()
  const resolved: CoolResolvedCalendarDayItem[] = []
  days.forEach((model: CoolCalendarDay) => {
    const gregorianDay = coolGregorianDay(model.date)
    if (gregorianDay === 0 || gregorianDay !== model.day) return
    const markers = model.markers.slice(0, 3).map((marker: CoolCalendarMarker) => cloneCoolCalendarMarker(marker))
    const occurrence = occurrences.get(model.date) ?? 0
    occurrences.set(model.date, occurrence + 1)
    const day = new CoolCalendarDay(
      model.date,
      model.day,
      model.secondaryText,
      resolvedCoolAccessibilityLabel(model, labels, markers),
      model.isToday,
      hasControlledSelection ? model.date === selectedDate : model.isSelected,
      model.isDisabled,
      resolveCoolTone(model.tone),
      model.badge,
      markers
    )
    resolved.push(new CoolResolvedCalendarDayItem(day, `${model.date}#${occurrence}`))
  })
  return resolved
}

const COOL_DEFAULT_WEEKDAYS: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function defaultCoolWeekdays(): string[] {
  return COOL_DEFAULT_WEEKDAYS.slice()
}

function coolDayBackground(day: CoolCalendarDay): string {
  if (day.isSelected) return CoolTokens.colorLightAccent
  return CoolTokens.colorLightSurfaceTint
}

function coolDayForeground(day: CoolCalendarDay): string {
  if (day.isSelected) return CoolTokens.colorPrimitiveWhite92
  if (day.tone === Tone.neutral) return CoolTokens.colorLightText
  return coolToneColor(day.tone)
}

function coolDayOpacity(day: CoolCalendarDay): number {
  if (day.isDisabled) return CoolTokens.opacityDisabled
  return coolTokenNumber(CoolTokens.borderHairline)
}

@Builder
export function CoolMonthCalendarDefaultHeader(context: CoolMonthCalendarHeaderContext) {
  Row({ space: coolTokenNumber(CoolTokens.spaceSm) }) {
    Button('‹')
      .constraintSize({ minWidth: CoolTokens.sizeTouchTarget, minHeight: CoolTokens.sizeTouchTarget })
      .accessibilityText(context.previousMonthLabel)
      .onClick(() => context.requestMonthChange(CoolMonthDirection.previous))
    Text(context.displayedMonth)
      .fontSize(CoolTokens.typographyTitle)
      .fontColor(CoolTokens.colorLightText)
      .layoutWeight(1)
      .textAlign(TextAlign.Center)
    Button('›')
      .constraintSize({ minWidth: CoolTokens.sizeTouchTarget, minHeight: CoolTokens.sizeTouchTarget })
      .accessibilityText(context.nextMonthLabel)
      .onClick(() => context.requestMonthChange(CoolMonthDirection.next))
  }
  .width('100%')
}

@Builder
export function CoolMonthCalendarDefaultDay(day: CoolCalendarDay) {
  Column({ space: coolTokenNumber(CoolTokens.spaceXs) }) {
    Text(`${day.day}`)
      .fontSize(CoolTokens.typographyBody)
      .fontColor(coolDayForeground(day))
      .fontWeight(day.isSelected || day.isToday ? FontWeight.Medium : FontWeight.Regular)
    if (day.secondaryText !== undefined && day.secondaryText.length > 0) {
      Text(day.secondaryText)
        .fontSize(CoolTokens.typographyCaption)
        .fontColor(day.isSelected ? CoolTokens.colorPrimitiveWhite92 : CoolTokens.colorLightTextSecondary)
    }
    if (day.badge !== undefined && day.badge.length > 0) {
      Text(day.badge)
        .fontSize(CoolTokens.typographyCaption)
        .fontColor(day.isSelected ? CoolTokens.colorPrimitiveWhite92 : coolToneColor(day.tone))
        .padding({ left: CoolTokens.spaceXs, right: CoolTokens.spaceXs })
        .borderRadius(coolTokenNumber(CoolTokens.radiusPill))
        .backgroundColor(CoolTokens.colorLightSurfaceTint)
    }
  }
  .width('100%')
}

@Builder
export function CoolMonthCalendarDefaultMarker(marker: CoolCalendarMarker) {
  Circle()
    .width(CoolTokens.spaceSm)
    .height(CoolTokens.spaceSm)
    .fill(coolToneColor(marker.tone))
    .accessibilityText(marker.accessibilityLabel ?? '')
}

@Component
export struct CoolMonthCalendar {
  @Prop selectedDate: string = ''
  @Prop displayedMonth: string = ''
  @Prop days: CoolCalendarDay[] = []
  @Prop weekdays: string[] = []
  @Prop accessibilityLabels: CoolMonthCalendarAccessibilityLabels = new CoolMonthCalendarAccessibilityLabels()
  onSelect: (day: CoolCalendarDay) => void = () => {}
  onMonthChange: (direction: CoolMonthDirection) => void = () => {}
  @BuilderParam header: (context: CoolMonthCalendarHeaderContext) => void = CoolMonthCalendarDefaultHeader
  @BuilderParam day: (day: CoolCalendarDay) => void = CoolMonthCalendarDefaultDay
  @BuilderParam marker: (marker: CoolCalendarMarker) => void = CoolMonthCalendarDefaultMarker

  private resolvedWeekdays(): string[] {
    if (this.weekdays.length === 7) return this.weekdays.slice()
    return defaultCoolWeekdays()
  }

  private resolvedDays(): CoolResolvedCalendarDayItem[] {
    return resolveCoolCalendarDays(this.days, this.selectedDate, this.accessibilityLabels)
  }

  private requestSelection(day: CoolCalendarDay): void {
    if (day.isDisabled) return
    this.onSelect(cloneCoolCalendarDay(day))
  }

  private requestMonthChange(direction: CoolMonthDirection): void {
    if (direction !== CoolMonthDirection.previous && direction !== CoolMonthDirection.next) return
    this.onMonthChange(direction)
  }

  build() {
    Column({ space: coolTokenNumber(CoolTokens.spaceMd) }) {
      this.header(new CoolMonthCalendarHeaderContext(
        isCoolDisplayedMonth(this.displayedMonth) ? this.displayedMonth : '',
        this.accessibilityLabels.previousMonth,
        this.accessibilityLabels.nextMonth,
        (direction: CoolMonthDirection) => this.requestMonthChange(direction)
      ))
      Grid() {
        ForEach(this.resolvedWeekdays(), (weekday: string) => {
          GridItem() {
            Text(weekday)
              .fontSize(CoolTokens.typographyCaption)
              .fontColor(CoolTokens.colorLightTextSecondary)
              .textAlign(TextAlign.Center)
              .width('100%')
          }
        })
      }
      .columnsTemplate('1fr 1fr 1fr 1fr 1fr 1fr 1fr')
      .columnsGap(CoolTokens.spaceXs)
      Grid() {
        ForEach(this.resolvedDays(), (item: CoolResolvedCalendarDayItem) => {
          GridItem() {
            Button() {
              Column({ space: coolTokenNumber(CoolTokens.spaceXs) }) {
                this.day(item.day)
                Row({ space: coolTokenNumber(CoolTokens.spaceXs) }) {
                  ForEach(item.day.markers, (marker: CoolCalendarMarker) => {
                    this.marker(marker)
                  })
                }
              }
              .width('100%')
              .padding(CoolTokens.spaceXs)
            }
            .constraintSize({ minHeight: CoolTokens.sizeTouchTarget })
            .width('100%')
            .enabled(!item.day.isDisabled)
            .opacity(coolDayOpacity(item.day))
            .backgroundColor(coolDayBackground(item.day))
            .borderRadius(coolTokenNumber(CoolTokens.radiusSmall))
            .border({
              width: item.day.isToday ? CoolTokens.borderFocus : CoolTokens.borderHairline,
              color: item.day.isToday ? CoolTokens.colorLightAccent : CoolTokens.colorLightSurfaceTint
            })
            .accessibilityText(item.day.accessibilityLabel ?? `${item.day.day}`)
            .onClick(() => this.requestSelection(item.day))
          }
        }, (item: CoolResolvedCalendarDayItem) => item.key)
      }
      .columnsTemplate('1fr 1fr 1fr 1fr 1fr 1fr 1fr')
      .columnsGap(CoolTokens.spaceXs)
      .rowsGap(CoolTokens.spaceXs)
    }
    .width('100%')
    .padding(CoolTokens.spaceLg)
    .backgroundColor(CoolTokens.colorLightGlassSurface)
    .borderRadius(coolTokenNumber(CoolTokens.radiusLarge))
    .border({ width: CoolTokens.borderHairline, color: CoolTokens.colorLightSurfaceTint })
    .backdropBlur(coolTokenNumber(CoolTokens.blurRegular))
  }
}
