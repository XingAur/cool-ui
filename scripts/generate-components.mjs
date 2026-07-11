import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contract = JSON.parse(await readFile(resolve(root, 'contracts/components.json'), 'utf8'));
const components = contract.components;
const componentApiName = (name) => name;
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

async function output(path, contents) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${contents.trim()}\n`, 'utf8');
}

const swift = `
// Generated from contracts/components.json. Do not edit.
import SwiftUI

${components.map(({ name, interactive }) => `
@available(iOS 26.0, *)
public struct Cool${componentApiName(name)}: View {
  private let props: CoolComponentProps
  private let onEvent: (CoolComponentEvent) -> Void

  public init(_ props: CoolComponentProps = .init(label: "${name}"), onEvent: @escaping (CoolComponentEvent) -> Void = { _ in }) {
    self.props = props
    self.onEvent = onEvent
  }

  public var body: some View {
    CoolGeneratedComponent(name: "${name}", interactive: ${interactive}, props: props, onEvent: onEvent)
  }
}`).join('\n')}
`;

const kotlin = `
// Generated from contracts/components.json. Do not edit.
package dev.coolui.compose

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

${components.map(({ name, interactive }) => `
@Composable
fun Cool${componentApiName(name)}(
  props: CoolComponentProps = CoolComponentProps(label = "${name}"),
  modifier: Modifier = Modifier,
  onEvent: (CoolComponentEvent) -> Unit = {},
) {
  CoolGeneratedComponent(name = "${name}", interactive = ${interactive}, props = props, modifier = modifier, onEvent = onEvent)
}`).join('\n')}
`;

const ark = `
// Generated from contracts/components.json. Do not edit.
import { CoolComponentConfig, CoolGeneratedComponent } from './CoolCore'

${components.map(({ name, interactive }) => `
@Component
export struct Cool${componentApiName(name)} {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("${name}")
  onEvent: (event: string) => void = () => {}

  build() {
    CoolGeneratedComponent({ name: "${name}", interactive: ${interactive}, config: this.config, onEvent: this.onEvent })
  }
}`).join('\n')}
`;

await output('packages/swift/Sources/CoolUI/GeneratedComponents.swift', swift);
await output('packages/android/src/main/kotlin/dev/coolui/compose/GeneratedComponents.kt', kotlin);
await output('packages/arkui/src/main/ets/components/GeneratedComponents.ets', ark);

const manifest = {};
for (const component of components) {
  const tag = `cool-${kebab(component.name)}`;
  manifest[tag] = `./dist/components/${tag}/index`;
  const dir = `packages/wechat/src/components/${tag}`;
  const role = /Button|Chip|Item|Card|Navigation|TabBar|Segmented|Banner|Dialog|Sheet|Popover/.test(component.name) ? 'button' : 'none';
  const inputType = /TextField|SearchField/.test(component.name) ? 'input'
    : component.name === 'TextArea' ? 'textarea'
    : component.name === 'Toggle' ? 'switch'
    : component.name === 'Checkbox' ? 'checkbox'
    : component.name === 'RadioGroup' ? 'radio'
    : component.name === 'Slider' ? 'slider'
    : component.name === 'Stepper' ? 'stepper'
    : /Select|DatePicker|TimePicker/.test(component.name) ? 'picker'
    : 'view';
  const pickerMode = component.name === 'DatePicker' ? 'date' : component.name === 'TimePicker' ? 'time' : 'selector';
  const control = inputType === 'input'
    ? `<input class="cool-native-input" value="{{value}}" placeholder="{{placeholder}}" disabled="{{disabled}}" bindinput="handleInput" aria-label="{{accessibilityLabel}}" />`
    : inputType === 'textarea'
      ? `<textarea class="cool-native-input cool-native-textarea" value="{{value}}" placeholder="{{placeholder}}" disabled="{{disabled}}" bindinput="handleInput" aria-label="{{accessibilityLabel}}" />`
      : inputType === 'switch'
        ? `<switch checked="{{selected}}" disabled="{{disabled}}" bindchange="handleNativeChange" aria-label="{{accessibilityLabel}}" />`
      : inputType === 'checkbox'
        ? `<checkbox-group bindchange="handleNativeChange"><label><checkbox value="true" checked="{{selected}}" disabled="{{disabled}}" />{{label}}</label></checkbox-group>`
      : inputType === 'radio'
        ? `<radio-group bindchange="handleNativeChange"><label wx:for="{{options}}" wx:key="*this"><radio value="{{item}}" checked="{{item === value}}" disabled="{{disabled}}" />{{item}}</label></radio-group>`
      : inputType === 'slider'
        ? `<slider value="{{value}}" min="{{min}}" max="{{max}}" disabled="{{disabled}}" bindchange="handleNativeChange" aria-label="{{accessibilityLabel}}" />`
      : inputType === 'stepper'
        ? `<view class="cool-stepper"><button size="mini" data-delta="-1" disabled="{{disabled}}" bindtap="handleStep">−</button><text>{{value}}</text><button size="mini" data-delta="1" disabled="{{disabled}}" bindtap="handleStep">+</button></view>`
      : inputType === 'picker'
        ? `<picker mode="${pickerMode}" range="{{options}}" value="{{value}}" disabled="{{disabled}}" bindchange="handleNativeChange"><view class="cool-picker-value">{{displayValue || label}}</view></picker>`
      : `<view class="cool-content" role="${role}" aria-label="{{accessibilityLabel}}" bindtap="handleTap"><text wx:if="{{label}}" class="cool-label">{{label}}</text><slot/></view>`;
  await output(`${dir}/index.js`, `
const coolBehavior = require('../../behaviors/cool-ui');

Component({
  behaviors: [coolBehavior],
  options: { multipleSlots: true, styleIsolation: 'apply-shared' },
  data: { componentName: '${component.name}', interactive: ${component.interactive} },
});`);
  await output(`${dir}/index.json`, JSON.stringify({ component: true, styleIsolation: 'apply-shared' }, null, 2));
  await output(`${dir}/index.wxml`, `
<view class="cool-component cool-glass cool-${kebab(component.name)} cool-material-{{resolvedMaterial}} cool-tone-{{tone}} cool-size-{{size}} {{selected ? 'is-selected' : ''}} {{disabled ? 'is-disabled' : ''}} {{error ? 'is-error' : ''}}" data-component="${component.name}">
  <view wx:if="{{loading}}" class="cool-loading" aria-label="loading"></view>
  <slot name="icon"/>
  ${control}
  <text wx:if="{{errorMessage}}" class="cool-error" role="alert">{{errorMessage}}</text>
</view>`);
  await output(`${dir}/index.wxss`, `@import "../../styles/glass.wxss";`);
}
await output('packages/wechat/component-manifest.json', JSON.stringify(manifest, null, 2));

const usingComponents = Object.fromEntries(Object.keys(manifest).map((tag) => [tag, `../../../packages/wechat/dist/components/${tag}/index`]));
await output('apps/catalog-wechat/app.json', JSON.stringify({ pages: ['pages/index/index'], window: { navigationStyle: 'custom', backgroundColor: '#071018' }, style: 'v2', lazyCodeLoading: 'requiredComponents' }, null, 2));
await output('apps/catalog-wechat/pages/index/index.json', JSON.stringify({ usingComponents }, null, 2));
await output('apps/catalog-wechat/pages/index/index.wxml', `
<view class="catalog-shell cool-theme">
  <view class="catalog-orb catalog-orb-cyan"></view><view class="catalog-orb catalog-orb-amber"></view>
  <view class="catalog-header"><text class="catalog-eyebrow">cooL UI / WECHAT</text><text class="catalog-title">Native glass catalog</text><text class="catalog-copy">42 components · 7 interaction states · semantic fallbacks</text></view>
${['foundations', 'actions-inputs', 'navigation', 'content', 'feedback-overlays'].map((category) => `
  <view class="catalog-section"><text class="catalog-section-title">${category}</text><view class="catalog-grid">
    ${components.filter((component) => component.category === category).map(({ name }) => `<cool-${kebab(name)} label="${name}" accessibility-label="${name} example" />`).join('\n    ')}
  </view></view>`).join('\n')}
</view>`);

for (const component of components) {
  const swiftName = `Cool${componentApiName(component.name)}`;
  const nativeName = `Cool${componentApiName(component.name)}`;
  const tag = `cool-${kebab(component.name)}`;
  const stateRows = component.interactive ? component.states.map((state) => `| ${state} | Supported | Supported | Supported | Supported |`).join('\n') : '| display | Supported | Supported | Supported | Supported |';
  await output(`docs/components/${kebab(component.name)}.md`, `
# ${component.name}

${component.name} is a ${component.category} component with shared geometry and semantic behavior, rendered through native platform primitives.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| \`${swiftName}\` | \`${nativeName}\` | \`${nativeName}\` | \`<${tag}>\` |

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
${stateRows}

## Accessibility

Provide a localized accessibility label. The component preserves native screen-reader and keyboard semantics, the shared touch target, Dynamic Type or platform font scaling, reduced motion, reduced transparency and high contrast.

## Examples

\`\`\`swift
${swiftName}(.init(label: "${component.name}", accessibilityLabel: "${component.name}"))
\`\`\`

\`\`\`kotlin
${nativeName}(props = CoolComponentProps(label = "${component.name}"))
\`\`\`

\`\`\`html
<${tag} label="${component.name}" accessibility-label="${component.name}" />
\`\`\`
`);
  await output(`docs/zh/components/${kebab(component.name)}.md`, `
# ${component.name}

${component.name} 属于 ${component.category} 组件，四端共享几何与语义行为，并通过各平台原生能力渲染。

## 四端 API 对照

| SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- |
| \`${swiftName}\` | \`${nativeName}\` | \`${nativeName}\` | \`<${tag}>\` |

## 状态矩阵

| 状态 | SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- | --- |
${stateRows}

## 可访问性

请提供本地化无障碍标签。组件保留平台读屏与键盘语义，并支持统一触控目标、动态字体或平台字体缩放、减少动画、降低透明度和高对比度。

## 示例

\`\`\`swift
${swiftName}(.init(label: "${component.name}", accessibilityLabel: "${component.name}"))
\`\`\`

\`\`\`kotlin
${nativeName}(props = CoolComponentProps(label = "${component.name}"))
\`\`\`

\`\`\`html
<${tag} label="${component.name}" accessibility-label="${component.name}" />
\`\`\`
`);
}

const tokenSource = resolve(root, 'packages/tokens/generated/swift/CoolTokens.swift');
await cp(tokenSource, resolve(root, 'packages/swift/Sources/CoolUI/CoolTokens.swift'));
const kotlinToken = await readFile(resolve(root, 'packages/tokens/generated/kotlin/CoolTokens.kt'), 'utf8');
await output('packages/android/src/main/kotlin/dev/coolui/tokens/CoolTokens.kt', kotlinToken);
const arkToken = await readFile(resolve(root, 'packages/tokens/generated/arkts/CoolTokens.ets'), 'utf8');
await output('packages/arkui/src/main/ets/tokens/CoolTokens.ets', arkToken);
const wechatToken = await readFile(resolve(root, 'packages/tokens/generated/wechat/cool-ui-tokens.wxss'), 'utf8');
await output('packages/wechat/src/styles/tokens.wxss', wechatToken);

await rm(resolve(root, 'packages/wechat/dist'), { recursive: true, force: true });
