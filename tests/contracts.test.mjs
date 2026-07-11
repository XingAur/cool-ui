import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { release, releaseVersion } from './release-fixture.mjs';

const root = new URL('../', import.meta.url);
const contract = JSON.parse(await readFile(new URL('contracts/components.json', root), 'utf8'));
const capabilities = JSON.parse(await readFile(new URL('contracts/component-capabilities.json', root), 'utf8'));
const componentSchema = JSON.parse(await readFile(new URL('contracts/components.schema.json', root), 'utf8'));
const nonRenderedModes = new Set(['registryOnly', 'reserved']);
const registryOnlyComponents = new Set(Object.entries(capabilities.generationModes ?? {})
  .filter(([, modes]) => Object.values(modes).some((mode) => nonRenderedModes.has(mode)))
  .map(([name]) => name));
const versionedContracts = [
  'contracts/components.json',
  'contracts/component-capabilities.json',
  'contracts/accessibility.json',
  'contracts/performance.json',
];

const expectedComponents = [
  'ThemeProvider', 'Backdrop', 'GlassSurface', 'GlassGroup', 'Divider',
  'Button', 'IconButton', 'FloatingActionButton', 'Chip', 'TextField', 'TextArea',
  'SearchField', 'Toggle', 'Checkbox', 'RadioGroup', 'Slider', 'Stepper', 'Select',
  'DatePicker', 'TimePicker', 'TopBar', 'BottomNavigation', 'TabBar',
  'SegmentedControl', 'NavigationRail', 'Card', 'List', 'ListItem', 'Badge', 'Avatar',
  'Progress', 'CircularProgress', 'Skeleton', 'StatTile', 'EmptyState', 'Toast',
  'Banner', 'AlertDialog', 'BottomSheet', 'Popover', 'Tooltip', 'LoadingOverlay',
  'MonthCalendar',
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

test('release contract is the canonical 0.2 release policy', () => {
  assert.equal(release.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(release.version, '0.2.0');
  assert.equal(release.publicRegistryPublishing, false);
});

test('publishing contract is versioned consistently', async () => {
  assert.equal(contract.version, releaseVersion);
  assert.deepEqual(contract.packages, {
    tokens: '@cool-ui/tokens',
    wechat: '@cool-ui/wechat',
    swift: 'CoolUI',
    android: 'dev.coolui:coolui-compose',
    harmony: '@cool-ui/arkui',
  });

  for (const path of versionedContracts) {
    const versioned = JSON.parse(await readFile(new URL(path, root), 'utf8'));
    assert.equal(versioned.version, releaseVersion, path);
  }

  assert.equal(componentSchema.properties.version.const, releaseVersion);
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
  for (const component of contract.components.filter(({ interactive, name }) => interactive && !registryOnlyComponents.has(name))) {
    assert.deepEqual(component.states, requiredStates, component.name);
    assert.deepEqual(component.capabilities, ['controlledValue', 'event', 'accessibilityLabel', 'semanticIconSlot'], component.name);
  }
});

test('MonthCalendar is the 43rd controlled date component', () => {
  assert.equal(contract.components.length, 43);
  const calendar = contract.components.find(({ name }) => name === 'MonthCalendar');
  assert.ok(calendar, 'MonthCalendar contract');
  assert.equal(calendar.category, 'content');
  assert.equal(calendar.interactive, true);
  assert.deepEqual(calendar.states, ['default', 'pressed', 'focused', 'selected', 'disabled']);
  assert.deepEqual(calendar.capabilities, ['controlledValue', 'event', 'accessibilityLabel', 'semanticIconSlot']);
  assert.deepEqual(calendar.api, {
    kind: 'dateInput',
    valueType: 'date',
    events: ['select', 'monthChange'],
    slots: ['header', 'day', 'marker'],
    models: ['CalendarDay'],
  });
  assert.deepEqual(calendar.maturity, {
    swiftui: 'planned',
    compose: 'planned',
    arkui: 'planned',
    wechat: 'planned',
  });
});

test('MonthCalendar shares machine-validatable calendar day and marker models', () => {
  const tones = ['neutral', 'accent', 'success', 'warning', 'danger'];
  assert.deepEqual(capabilities.sharedModels?.CalendarMarker, {
    type: 'object',
    required: ['tone'],
    properties: {
      tone: { type: 'string', enum: tones },
      accessibilityLabel: { type: 'string' },
    },
    additionalProperties: false,
  });
  assert.deepEqual(capabilities.sharedModels?.CalendarDay, {
    type: 'object',
    required: ['date', 'day'],
    properties: {
      date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      day: { type: 'integer', minimum: 1, maximum: 31 },
      secondaryText: { type: 'string' },
      accessibilityLabel: { type: 'string' },
      isToday: { type: 'boolean' },
      isSelected: { type: 'boolean' },
      isDisabled: { type: 'boolean' },
      tone: { type: 'string', enum: tones },
      badge: { type: 'string' },
      markers: {
        type: 'array',
        maxItems: 3,
        items: { $ref: '#/sharedModels/CalendarMarker' },
      },
    },
    additionalProperties: false,
  });
});

test('MonthCalendar generation stays reserved until native implementations land', () => {
  assert.deepEqual(capabilities.generationModes?.MonthCalendar, {
    swiftui: 'registryOnly',
    compose: 'registryOnly',
    arkui: 'registryOnly',
    wechat: 'reserved',
  });
  assert.deepEqual(componentSchema.properties.components.items.properties.api.properties.models, {
    type: 'array',
    items: { type: 'string' },
    uniqueItems: true,
  });
});

test('every component declares native API shape and platform maturity', () => {
  const validKinds = new Set([
    'provider', 'container', 'action', 'textInput', 'booleanInput', 'choiceInput',
    'numericInput', 'dateInput', 'navigation', 'content', 'status', 'presentation',
  ]);
  const validMaturity = new Set(['stable', 'beta', 'planned']);

  for (const component of contract.components) {
    assert.ok(validKinds.has(component.api?.kind), `${component.name} api.kind`);
    assert.equal(typeof component.api.valueType, 'string', `${component.name} api.valueType`);
    assert.ok(Array.isArray(component.api.events), `${component.name} api.events`);
    assert.ok(Array.isArray(component.api.slots), `${component.name} api.slots`);
    assert.deepEqual(Object.keys(component.maturity), ['swiftui', 'compose', 'arkui', 'wechat'], `${component.name} maturity platforms`);
    assert.ok(Object.values(component.maturity).every((value) => validMaturity.has(value)), `${component.name} maturity values`);
  }
});
