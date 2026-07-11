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
