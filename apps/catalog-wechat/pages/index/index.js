function padCalendarPart(value) {
  return String(value).padStart(2, '0');
}

function calendarISODate(date) {
  return [date.getUTCFullYear(), padCalendarPart(date.getUTCMonth() + 1), padCalendarPart(date.getUTCDate())].join('-');
}

function createCalendarDays(year, month) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, 1 - mondayOffset + index));
    const iso = calendarISODate(date);
    const day = {
      date: iso,
      day: date.getUTCDate(),
      isDisabled: date.getUTCMonth() !== month - 1,
      tone: iso === '2026-07-12' ? 'accent' : 'neutral',
    };
    if (iso === '2026-07-05') day.isDisabled = true;
    if (iso === '2026-07-12') {
      day.isToday = true;
      day.secondaryText = 'Today';
      day.badge = '3';
    }
    if (iso === '2026-07-16') {
      day.markers = [{ tone: 'accent' }, { tone: 'success' }, { tone: 'warning' }];
    }
    return day;
  });
}

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
    calendarYear: 2026,
    calendarMonth: 7,
    calendarSelectedDate: '2026-07-12',
    calendarDays: createCalendarDays(2026, 7),
  },
  handleButtonSubmit(event) {
    this.setData({ buttonSubmitResult: JSON.stringify(event.detail) });
  },
  handleButtonReset() {
    this.setData({ buttonSubmitResult: 'Reset' });
  },
  handleTabChange(event) {
    this.setData({ tabValue: event.detail.value });
  },
  handleSegmentChange(event) {
    this.setData({ segmentValue: event.detail.value });
  },
  onCalendarSelect(event) {
    this.setData({ calendarSelectedDate: event.detail.day.date });
  },
  onCalendarMonthChange(event) {
    const direction = event && event.detail && event.detail.direction;
    if (direction !== 'previous' && direction !== 'next') return;
    const offset = direction === 'previous' ? -1 : 1;
    const displayedMonth = new Date(Date.UTC(this.data.calendarYear, this.data.calendarMonth - 1 + offset, 1));
    const calendarYear = displayedMonth.getUTCFullYear();
    const calendarMonth = displayedMonth.getUTCMonth() + 1;
    this.setData({ calendarYear, calendarMonth, calendarDays: createCalendarDays(calendarYear, calendarMonth) });
  },
});
