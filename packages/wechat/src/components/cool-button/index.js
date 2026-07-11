const coolBehavior = require('../../behaviors/cool-ui');

Component({
  behaviors: [coolBehavior],
  options: { multipleSlots: true, styleIsolation: 'apply-shared' },
  properties: {
    openType: { type: String, value: '' },
    formType: { type: String, value: '' },
    lang: { type: String, value: 'en' },
    sessionFrom: { type: String, value: '' },
    sendMessageTitle: { type: String, value: '' },
    sendMessagePath: { type: String, value: '' },
    sendMessageImg: { type: String, value: '' },
    appParameter: { type: String, value: '' },
    showMessageCard: { type: Boolean, value: false },
    phoneNumberNoQuotaToast: { type: Boolean, value: true },
  },
  data: { componentName: 'Button', interactive: true },
  methods: {
    handleButtonTap() {
      if (this.data.disabled || this.data.loading) return;
      this.triggerEvent('tap', { value: this.data.value, selected: this.data.selected });
    },
    handleFormSubmit(event) {
      this.triggerEvent('submit', event.detail);
    },
    handleFormReset(event) {
      this.triggerEvent('reset', event.detail);
    },
    forwardNativeEvent(event) {
      this.triggerEvent(event.type, event.detail);
    },
  },
});
