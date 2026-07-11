Page({
  data: { version: '0.2.0', buttonSubmitResult: 'Not submitted' },
  handleButtonSubmit(event) {
    this.setData({ buttonSubmitResult: JSON.stringify(event.detail) });
  },
});
