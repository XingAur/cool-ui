const semanticStates = ['default', 'pressed', 'focused', 'selected', 'disabled', 'loading', 'error'];

module.exports = Behavior({
  properties: {
    themeMode: { type: String, value: 'system' },
    material: { type: String, value: 'regular' },
    tone: { type: String, value: 'neutral' },
    size: { type: String, value: 'medium' },
    contrastMode: { type: String, value: 'standard' },
    motionMode: { type: String, value: 'full' },
    transparencyMode: { type: String, value: 'full' },
    state: { type: String, value: 'default' },
    label: { type: String, value: '' },
    value: { type: null, value: '' },
    displayValue: { type: String, value: '' },
    placeholder: { type: String, value: '' },
    selected: { type: Boolean, value: false },
    disabled: { type: Boolean, value: false },
    loading: { type: Boolean, value: false },
    open: { type: Boolean, value: false },
    error: { type: Boolean, value: false },
    errorMessage: { type: String, value: '' },
    accessibilityLabel: { type: String, value: '' },
    semanticIcon: { type: String, value: '' },
    options: { type: Array, value: [] },
    min: { type: Number, value: 0 },
    max: { type: Number, value: 100 },
  },
  data: { resolvedMaterial: 'regular', resolvedAccessibilityLabel: '' },
  observers: {
    'material, transparencyMode': function resolveMaterial(material, transparencyMode) {
      this.setData({ resolvedMaterial: transparencyMode === 'reduced' ? 'solidFallback' : material });
    },
    'accessibilityLabel, label': function resolveAccessibilityLabel(accessibilityLabel, label) {
      this.setData({ resolvedAccessibilityLabel: accessibilityLabel || label || '' });
    },
    state(value) {
      if (!semanticStates.includes(value)) this.setData({ state: 'default' });
    },
  },
  methods: {
    handleTap() {
      if (this.data.disabled || this.data.loading || !this.data.interactive) return;
      this.triggerEvent('tap', { value: this.data.value, selected: this.data.selected });
    },
    handleInput(event) {
      this.triggerEvent('change', { value: event.detail.value });
      this.triggerEvent('input', { value: event.detail.value });
    },
    handleNativeChange(event) {
      this.triggerEvent('change', { value: event.detail.value });
    },
    handleStep(event) {
      if (this.data.disabled || this.data.loading) return;
      const current = Number(this.data.value) || 0;
      const delta = Number(event.currentTarget.dataset.delta) || 0;
      const value = Math.min(this.data.max, Math.max(this.data.min, current + delta));
      this.triggerEvent('change', { value });
    },
    requestDismiss() { this.triggerEvent('dismiss'); },
    noop() {},
  },
});
