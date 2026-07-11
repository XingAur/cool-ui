import {
  CoolButton,
  CoolCard,
  CoolComponentConfig,
  CoolSlider,
  CoolTextField,
  CoolToggle
} from '@cool-ui/arkui'

@Entry
@Component
struct Index {
  build() {
    Scroll() {
      Column({ space: 12 }) {
        Text('cooL UI / ARKUI').fontSize(12)
        Text('Native component catalog').fontSize(34).fontWeight(FontWeight.Medium)
        CoolButton({ config: new CoolComponentConfig('Button') })
        CoolTextField({ config: new CoolComponentConfig('TextField') })
        CoolToggle({ config: new CoolComponentConfig('Toggle') })
        CoolSlider({ config: new CoolComponentConfig('Slider') })
        CoolCard({ config: new CoolComponentConfig('Card') })
      }.padding(24).width('100%')
    }.width('100%').height('100%')
  }
}
