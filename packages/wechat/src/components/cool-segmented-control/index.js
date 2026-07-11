const coolBehavior = require('../../behaviors/cool-ui');
const warnedDuplicateSignatures = new Set();

function isOptionValue(value) {
  return typeof value === 'string' || typeof value === 'number';
}

function firstSelectedIndex(options, value) {
  if (!Array.isArray(options)) return -1;
  return options.findIndex((option) => option && isOptionValue(option.value) && option.value === value);
}

function createViewOptions(options) {
  return options.map((option, index) => {
    const safeOption = option && typeof option === 'object' ? option : {};
    const value = safeOption.value;
    return { ...safeOption, _key: typeof value + ':' + String(value) + ':' + index };
  });
}

function duplicateValueIdentities(options) {
  const seen = new Set();
  const duplicates = new Set();
  for (const option of options) {
    if (!option || !isOptionValue(option.value)) continue;
    const identity = typeof option.value + ':' + String(option.value);
    if (seen.has(identity)) duplicates.add(identity);
    seen.add(identity);
  }
  return [...duplicates].sort();
}

function isReleaseEnvironment() {
  try {
    return wx.getAccountInfoSync().miniProgram.envVersion === 'release';
  } catch {
    return false;
  }
}

function warnForDuplicateValues(options) {
  const duplicates = duplicateValueIdentities(options);
  if (duplicates.length === 0) return;
  if (isReleaseEnvironment()) return;
  const signature = duplicates.join('|');
  if (warnedDuplicateSignatures.has(signature)) return;
  warnedDuplicateSignatures.add(signature);
  console.warn('[cooL UI] SegmentedControl options contain duplicate values; the first match is selected.', duplicates);
}

Component({
  behaviors: [coolBehavior],
  options: { multipleSlots: true, styleIsolation: 'apply-shared' },
  data: { componentName: 'SegmentedControl', interactive: true, viewOptions: [], selectedIndex: -1 },
  observers: {
    'options, value': function validateOptions(options, value) {
      if (!Array.isArray(options)) {
        this.setData({ options: [], viewOptions: [], selectedIndex: -1 });
        return;
      }
      this.setData({ viewOptions: createViewOptions(options), selectedIndex: firstSelectedIndex(options, value) });
      warnForDuplicateValues(options);
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
