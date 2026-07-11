import { CoolTokens } from '../tokens/CoolTokens'

export enum ThemeMode { system = 'system', light = 'light', dark = 'dark' }
export enum GlassMaterial { clear = 'clear', regular = 'regular', prominent = 'prominent', solidFallback = 'solidFallback' }
export enum Tone { neutral = 'neutral', accent = 'accent', success = 'success', warning = 'warning', danger = 'danger' }
export enum Size { small = 'small', medium = 'medium', large = 'large' }
export enum ContrastMode { standard = 'standard', high = 'high' }
export enum MotionMode { full = 'full', reduced = 'reduced' }
export enum TransparencyMode { full = 'full', reduced = 'reduced' }
export enum ComponentState { normal = 'default', pressed = 'pressed', focused = 'focused', selected = 'selected', disabled = 'disabled', loading = 'loading', error = 'error' }

@Observed
export class CoolComponentConfig {
  label: string
  value: string = ''
  placeholder: string = ''
  material: GlassMaterial = GlassMaterial.regular
  tone: Tone = Tone.neutral
  size: Size = Size.medium
  state: ComponentState = ComponentState.normal
  selected: boolean = false
  disabled: boolean = false
  loading: boolean = false
  errorMessage: string = ''
  accessibilityLabel: string
  semanticIcon: string = ''
  options: string[] = []
  minimumValue: number = 0
  maximumValue: number = 100
  transparencyMode: TransparencyMode = TransparencyMode.full

  constructor(label: string) {
    this.label = label
    this.accessibilityLabel = label
  }
}

export interface CoolGeneratedParams {
  name: string
  interactive: boolean
  config: CoolComponentConfig
  onEvent: (event: string) => void
}

function tokenNumber(value: string): number {
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function materialBlur(config: CoolComponentConfig): number {
  if (config.transparencyMode === TransparencyMode.reduced || config.material === GlassMaterial.solidFallback) return 0
  if (config.material === GlassMaterial.clear) return tokenNumber(CoolTokens.blurClear)
  if (config.material === GlassMaterial.prominent) return tokenNumber(CoolTokens.blurProminent)
  return tokenNumber(CoolTokens.blurRegular)
}

function componentRadius(size: Size): number {
  if (size === Size.small) return tokenNumber(CoolTokens.radiusSmall)
  if (size === Size.large) return tokenNumber(CoolTokens.radiusLarge)
  return tokenNumber(CoolTokens.radiusMedium)
}

function toneColor(tone: Tone): string {
  if (tone === Tone.accent) return CoolTokens.colorLightAccent
  if (tone === Tone.success) return CoolTokens.colorLightSuccess
  if (tone === Tone.warning) return CoolTokens.colorLightWarning
  if (tone === Tone.danger) return CoolTokens.colorLightDanger
  return CoolTokens.colorLightSurfaceTint
}

@Builder
export function CoolGeneratedComponent(params: CoolGeneratedParams) {
  Stack() {
    Row({ space: tokenNumber(CoolTokens.spaceSm) }) {
      if (params.config.loading) {
        LoadingProgress().width(CoolTokens.sizeControlSmall).height(CoolTokens.sizeControlSmall)
      }
      if (params.name === 'TextField' || params.name === 'SearchField') {
        TextInput({ text: params.config.value, placeholder: params.config.placeholder })
          .enabled(!params.config.disabled)
          .onChange((value: string) => params.onEvent(`valueChanged:${value}`))
      } else if (params.name === 'TextArea') {
        TextArea({ text: params.config.value, placeholder: params.config.placeholder })
          .enabled(!params.config.disabled)
          .onChange((value: string) => params.onEvent(`valueChanged:${value}`))
      } else if (params.name === 'Toggle') {
        Toggle({ type: ToggleType.Switch, isOn: params.config.selected })
          .enabled(!params.config.disabled)
          .onChange((value: boolean) => params.onEvent(`valueChanged:${value}`))
      } else if (params.name === 'Checkbox') {
        Checkbox({ name: params.config.label, group: 'coolui' })
          .select(params.config.selected)
          .enabled(!params.config.disabled)
          .onChange((value: boolean) => params.onEvent(`valueChanged:${value}`))
      } else if (params.name === 'Slider') {
        Slider({ value: Number(params.config.value), min: params.config.minimumValue, max: params.config.maximumValue })
          .enabled(!params.config.disabled)
          .onChange((value: number) => params.onEvent(`valueChanged:${value}`))
      } else if (params.name === 'Stepper') {
        Button('−').onClick(() => params.onEvent(`valueChanged:${Number(params.config.value) - 1}`))
        Text(params.config.value)
        Button('+').onClick(() => params.onEvent(`valueChanged:${Number(params.config.value) + 1}`))
      } else if (params.name === 'Progress') {
        Progress({ value: Number(params.config.value), total: params.config.maximumValue, type: ProgressType.Linear })
      } else if (params.name === 'CircularProgress') {
        Progress({ value: Number(params.config.value), total: params.config.maximumValue, type: ProgressType.Ring })
      } else {
        Text(params.config.label).fontSize(CoolTokens.typographyBody)
      }
      if (params.config.errorMessage.length > 0) {
        Text(params.config.errorMessage).fontColor(CoolTokens.colorLightDanger)
      }
    }
    .constraintSize({ minHeight: CoolTokens.sizeTouchTarget })
    .padding({ left: CoolTokens.spaceLg, right: CoolTokens.spaceLg })
  }
  .borderRadius(componentRadius(params.config.size))
  .backgroundColor(toneColor(params.config.tone))
  .backdropBlur(materialBlur(params.config))
  .enabled(!params.config.disabled && !params.config.loading)
  .accessibilityText(params.config.accessibilityLabel)
  .onClick(() => {
    if (params.interactive && !params.config.disabled && !params.config.loading) params.onEvent('activate')
  })
}
