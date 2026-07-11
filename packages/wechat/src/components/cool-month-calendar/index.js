const coolBehavior = require('../../behaviors/cool-ui');
const calendarTones = new Set(['neutral', 'accent', 'success', 'warning', 'danger']);

function normalizedTone(tone) {
  return calendarTones.has(tone) ? tone : 'neutral';
}

function normalizeMarker(marker) {
  const value = marker && typeof marker === 'object' ? marker : {};
  const normalized = { tone: normalizedTone(value.tone) };
  if (typeof value.accessibilityLabel === 'string' && value.accessibilityLabel) {
    normalized.accessibilityLabel = value.accessibilityLabel;
  }
  return normalized;
}

function gregorianDayFromISO(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const roundTrip = new Date(Date.UTC(year, month - 1, day));
  if (year >= 0 && year <= 99) roundTrip.setUTCFullYear(year);
  if (roundTrip.getUTCFullYear() !== year || roundTrip.getUTCMonth() !== month - 1 || roundTrip.getUTCDate() !== day) return null;
  return day;
}

function normalizeDays(days, selectedDate) {
  if (!Array.isArray(days)) return [];
  const hasControlledSelection = gregorianDayFromISO(selectedDate) !== null;
  const viewDays = [];
  days.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const gregorianDay = gregorianDayFromISO(item.date);
    if (gregorianDay === null || !Number.isInteger(item.day) || item.day !== gregorianDay) return;
    const secondaryText = typeof item.secondaryText === 'string' ? item.secondaryText : '';
    const accessibilityLabel = typeof item.accessibilityLabel === 'string' ? item.accessibilityLabel : '';
    const normalized = {
      date: item.date,
      day: item.day,
      markers: Array.isArray(item.markers) ? item.markers.slice(0, 3).map(normalizeMarker) : [],
      tone: normalizedTone(item.tone),
      isDisabled: Boolean(item.isDisabled),
      isToday: Boolean(item.isToday),
      isSelected: hasControlledSelection ? item.date === selectedDate : Boolean(item.isSelected),
      resolvedAccessibilityLabel: accessibilityLabel || [item.date, secondaryText].filter(Boolean).join(' ') || String(item.day),
      _index: index,
    };
    if (secondaryText) normalized.secondaryText = secondaryText;
    if (typeof item.badge === 'string' || typeof item.badge === 'number') normalized.badge = item.badge;
    viewDays.push(normalized);
  });
  return viewDays;
}

function eventDay(viewDay) {
  const { _index, ...day } = viewDay;
  return { ...day, markers: day.markers.map((marker) => ({ ...marker })) };
}

Component({
  behaviors: [coolBehavior],
  options: { multipleSlots: true, styleIsolation: 'apply-shared' },
  properties: {
    year: { type: Number, value: 1970 },
    month: { type: Number, value: 1 },
    days: { type: Array, value: [] },
    selectedDate: { type: String, value: '' },
    weekdays: { type: Array, value: ['一', '二', '三', '四', '五', '六', '日'] },
    useCustomHeader: { type: Boolean, value: false },
  },
  data: { componentName: 'MonthCalendar', interactive: true, viewDays: [] },
  observers: {
    'days, selectedDate': function resolveDays(days, selectedDate) {
      if (!Array.isArray(days)) {
        this.setData({ viewDays: [] });
        return;
      }
      this.setData({ viewDays: normalizeDays(days, selectedDate) });
    },
  },
  methods: {
    handleDayTap(event) {
      if (this.data.disabled || this.data.loading) return;
      const dataset = event && event.currentTarget && event.currentTarget.dataset;
      const index = dataset ? Number(dataset.index) : Number.NaN;
      if (!Number.isInteger(index)) return;
      const day = (Array.isArray(this.data.viewDays) ? this.data.viewDays : []).find((item) => item._index === index);
      if (!day || day.isDisabled) return;
      this.triggerEvent('select', { day: eventDay(day) });
    },
    handleMonthChange(event) {
      if (this.data && (this.data.disabled || this.data.loading)) return;
      const dataset = event && event.currentTarget && event.currentTarget.dataset;
      const direction = dataset && dataset.direction;
      if (direction !== 'previous' && direction !== 'next') return;
      this.triggerEvent('monthchange', { direction });
    },
  },
});
