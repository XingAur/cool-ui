Page({
  data: {
    version: '0.2.0',
    buttonSubmitResult: 'Not submitted',
    tabValue: 'overview',
    tabOptions: [
      { value: 'overview', label: 'Overview' },
      { value: 'updates', label: 'Updates', badge: 3 },
      { value: 'settings', label: 'Settings', disabled: true },
    ],
    segmentValue: 2,
    segmentOptions: [
      { value: 1, label: 'Day' },
      { value: 2, label: 'Week' },
      { value: 3, label: 'Month', badge: 'New' },
    ],
  },
  handleButtonSubmit(event) {
    this.setData({ buttonSubmitResult: JSON.stringify(event.detail) });
  },
  handleTabChange(event) {
    this.setData({ tabValue: event.detail.value });
  },
  handleSegmentChange(event) {
    this.setData({ segmentValue: event.detail.value });
  },
});
