import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const contract = JSON.parse(await readFile(new URL('contracts/components.json', root), 'utf8'));

const expectedComponents = [
  'ThemeProvider', 'Backdrop', 'GlassSurface', 'GlassGroup', 'Divider',
  'Button', 'IconButton', 'FloatingActionButton', 'Chip', 'TextField', 'TextArea',
  'SearchField', 'Toggle', 'Checkbox', 'RadioGroup', 'Slider', 'Stepper', 'Select',
  'DatePicker', 'TimePicker', 'TopBar', 'BottomNavigation', 'TabBar',
  'SegmentedControl', 'NavigationRail', 'Card', 'List', 'ListItem', 'Badge', 'Avatar',
  'Progress', 'CircularProgress', 'Skeleton', 'StatTile', 'EmptyState', 'Toast',
  'Banner', 'AlertDialog', 'BottomSheet', 'Popover', 'Tooltip', 'LoadingOverlay',
];

const expectedTypes = {
  ThemeMode: ['system', 'light', 'dark'],
  GlassMaterial: ['clear', 'regular', 'prominent', 'solidFallback'],
  Tone: ['neutral', 'accent', 'success', 'warning', 'danger'],
  Size: ['small', 'medium', 'large'],
  ContrastMode: ['standard', 'high'],
  MotionMode: ['full', 'reduced'],
  TransparencyMode: ['full', 'reduced'],
};

test('publishing contract is versioned consistently', () => {
  assert.equal(contract.version, '0.1.0');
  assert.deepEqual(contract.packages, {
    tokens: '@cool-ui/tokens',
    wechat: '@cool-ui/wechat',
    swift: 'CoolUI',
    android: 'dev.coolui:coolui-compose',
    harmony: '@cool-ui/arkui',
  });
});

test('semantic types are stable and ordered', () => {
  assert.deepEqual(contract.semanticTypes, expectedTypes);
});

test('all planned components exist on every platform', () => {
  assert.deepEqual(contract.components.map(({ name }) => name), expectedComponents);
  for (const component of contract.components) {
    assert.deepEqual(component.platforms, ['swiftui', 'compose', 'arkui', 'wechat']);
    assert.equal(typeof component.category, 'string');
    assert.ok(component.category.length > 0);
  }
});

test('interactive components expose state, value, event, icon and accessibility contracts', () => {
  const requiredStates = ['default', 'pressed', 'focused', 'selected', 'disabled', 'loading', 'error'];
  for (const component of contract.components.filter(({ interactive }) => interactive)) {
    assert.deepEqual(component.states, requiredStates, component.name);
    assert.deepEqual(component.capabilities, ['controlledValue', 'event', 'accessibilityLabel', 'semanticIconSlot'], component.name);
  }
});
