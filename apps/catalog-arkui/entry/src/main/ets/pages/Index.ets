import { CoolButton, CoolComponentConfig } from '@cool-ui/arkui'

@Entry
@Component
struct Index {
  private names: string[] = ['Button', 'IconButton', 'Chip', 'TextField', 'Toggle', 'Slider', 'TopBar', 'Card', 'ListItem', 'Toast', 'AlertDialog', 'BottomSheet']
  build() {
    Scroll() {
      Column({ space: 12 }) {
        Text('cooL UI / ARKUI').fontSize(12)
        Text('Native glass catalog').fontSize(34).fontWeight(FontWeight.Medium)
        ForEach(this.names, (name: string) => { CoolButton({ config: new CoolComponentConfig(name) }) })
      }.padding(24).width('100%')
    }.width('100%').height('100%')
  }
}
