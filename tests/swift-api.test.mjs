import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8').catch(() => '');

test('SwiftUI foundations are public content-building APIs', async () => {
  const theme = await read('packages/swift/Sources/CoolUI/CoolTheme.swift');
  const glass = await read('packages/swift/Sources/CoolUI/CoolGlass.swift');

  assert.match(theme, /public struct CoolThemeProvider<Content: View>/);
  assert.match(theme, /public struct CoolResolvedEnvironment/);
  assert.match(glass, /public struct CoolBackdrop<Background: View, Content: View>/);
  assert.match(glass, /public struct CoolGlassSurface<Content: View>/);
  assert.match(glass, /public struct CoolGlassGroup<Content: View>/);
  assert.match(glass, /GlassEffectContainer/);
});

test('Swift Catalog consumes public components instead of the generic renderer', async () => {
  const catalog = await read('apps/catalog-swift/CoolUICatalog/CoolUICatalogApp.swift');
  assert.doesNotMatch(catalog, /CoolGeneratedComponent/);
  assert.match(catalog, /CoolThemeProvider/);
  assert.match(catalog, /CoolGlassSurface/);
});

test('SwiftUI actions and inputs expose native typed values', async () => {
  const actions = await read('packages/swift/Sources/CoolUI/CoolActions.swift');
  const textInputs = await read('packages/swift/Sources/CoolUI/CoolTextInputs.swift');
  const selections = await read('packages/swift/Sources/CoolUI/CoolSelectionInputs.swift');
  const numeric = await read('packages/swift/Sources/CoolUI/CoolNumericInputs.swift');
  const dates = await read('packages/swift/Sources/CoolUI/CoolDateInputs.swift');

  assert.match(actions, /public struct CoolButton<Label: View>/);
  assert.match(actions, /public struct CoolIconButton: View/);
  assert.match(actions, /public struct CoolFloatingActionButton: View/);
  assert.match(actions, /public struct CoolChip<Label: View>/);
  assert.match(textInputs, /Binding<String>/);
  assert.match(selections, /Binding<Bool>/);
  assert.match(selections, /public struct CoolSelectionOption<Value: Hashable/);
  assert.match(numeric, /Binding<Double>/);
  assert.match(dates, /Binding<Date>/);
});
