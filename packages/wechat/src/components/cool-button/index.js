const coolBehavior = require('../../behaviors/cool-ui');

Component({
  behaviors: [coolBehavior],
  options: { multipleSlots: true, styleIsolation: 'apply-shared' },
  properties: {
    openType: { type: String, value: '' },
    formType: { type: String, value: '' },
  },
  data: { componentName: 'Button', interactive: true },
  methods: {
    handleButtonTap() {
      if (this.data.disabled || this.data.loading) return;
      this.triggerEvent('tap', { value: this.data.value });
    },
    forwardNativeEvent(event) {
      this.triggerEvent(event.type, event.detail);
    },
  },
});
