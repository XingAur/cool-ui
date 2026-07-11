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
  const occurrences = new Map();
  const viewOptions = [];
  options.forEach((option, index) => {
    if (!option || typeof option !== 'object' || !isOptionValue(option.value)) return;
    const identity = JSON.stringify([typeof option.value, option.value]);
    const occurrence = occurrences.get(identity) || 0;
    occurrences.set(identity, occurrence + 1);
    viewOptions.push({
      ...option,
      _key: JSON.stringify([typeof option.value, option.value, occurrence]),
      _index: index,
    });
  });
  return viewOptions;
}

function duplicateValueIdentities(options) {
  const seen = new Set();
  const duplicates = new Map();
  for (const option of options) {
    if (!option || !isOptionValue(option.value)) continue;
    const typedValue = [typeof option.value, option.value];
    const identity = JSON.stringify(typedValue);
    if (seen.has(identity)) duplicates.set(identity, typedValue);
    seen.add(identity);
  }
  return [...duplicates.values()].sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
}

function shouldWarnForDuplicateValues() {
  try {
    const envVersion = wx.getAccountInfoSync().miniProgram.envVersion;
    return envVersion === 'develop' || envVersion === 'trial';
  } catch {
    return false;
  }
}

function warnForDuplicateValues(options) {
  const duplicates = duplicateValueIdentities(options);
  if (duplicates.length === 0) return;
  if (!shouldWarnForDuplicateValues()) return;
  const signature = JSON.stringify(duplicates);
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
      if (this.data.disabled || this.data.loading) return;
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
