const coolBehavior = require('../../behaviors/cool-ui');

function isOptionValue(value) {
  return typeof value === 'string' || typeof value === 'number';
}

function firstSelectedIndex(options, value) {
  if (!Array.isArray(options)) return -1;
  return options.findIndex((option) => option && isOptionValue(option.value) && option.value === value);
}

function warnForDuplicateValues(options) {
  const seen = new Set();
  const duplicates = new Set();
  for (const option of options) {
    if (!option || !isOptionValue(option.value)) continue;
    const identity = typeof option.value + ':' + String(option.value);
    if (seen.has(identity)) duplicates.add(identity);
    seen.add(identity);
  }
  if (duplicates.size > 0 && typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn('[cooL UI] TabBar options contain duplicate values; the first match is selected.', [...duplicates]);
  }
}

Component({
  behaviors: [coolBehavior],
  options: { multipleSlots: true, styleIsolation: 'apply-shared' },
  data: { componentName: 'TabBar', interactive: true, selectedIndex: -1 },
  observers: {
    'options, value': function validateOptions(options, value) {
      if (!Array.isArray(options)) {
        this.setData({ options: [], selectedIndex: -1 });
        return;
      }
      warnForDuplicateValues(options);
      this.setData({ selectedIndex: firstSelectedIndex(options, value) });
    },
  },
  methods: {
    handleOptionTap(event) {
      if (this.data.disabled) return;
      const dataset = event && event.currentTarget && event.currentTarget.dataset;
      const index = dataset ? Number(dataset.index) : Number.NaN;
      const options = Array.isArray(this.data.options) ? this.data.options : [];
      if (!Number.isInteger(index) || index < 0 || index >= options.length) return;
      const option = options[index];
      if (!option || !isOptionValue(option.value) || option.disabled || option.value === this.data.value) return;
      this.triggerEvent('change', { value: option.value, index });
    },
  },
});
