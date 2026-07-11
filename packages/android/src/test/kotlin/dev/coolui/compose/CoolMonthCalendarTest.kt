package dev.coolui.compose

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.text.DateFormatSymbols
import java.util.Calendar
import java.util.Locale
import androidx.compose.ui.unit.dp
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CoolMonthCalendarTest {
  private val selectedDate = LocalDate.of(2026, 7, 12)

  @Test fun resolvedDayCapsMarkersAndUsesControlledSelection() {
    val markers = listOf(Tone.neutral, Tone.accent, Tone.success, Tone.warning)
      .map { CoolCalendarMarker(tone = it) }
    val selected = CoolCalendarDay(
      date = selectedDate,
      day = 12,
      isSelected = false,
      markers = markers,
    ).resolved(selectedDate)
    val deselected = selected.copy(
      date = selectedDate.plusDays(1),
      day = 13,
      isSelected = true,
    ).resolved(selectedDate)

    assertTrue(selected.isSelected)
    assertFalse(deselected.isSelected)
    assertEquals(markers.take(3), selected.markers)
    assertEquals(markers.take(3), selected.visibleMarkers)
  }

  @Test fun disabledDayDoesNotDispatchSelection() {
    var callbacks = 0
    val dispatched = dispatchCoolCalendarDaySelection(
      day = CoolCalendarDay(selectedDate, 12, isDisabled = true),
      selectedDate = selectedDate,
    ) { callbacks += 1 }

    assertFalse(dispatched)
    assertEquals(0, callbacks)
  }

  @Test fun enabledDayDispatchesResolvedPayload() {
    val fourthMarker = CoolCalendarMarker(Tone.danger, "deadline")
    var payload: CoolCalendarDay? = null
    val dispatched = dispatchCoolCalendarDaySelection(
      day = CoolCalendarDay(
        date = selectedDate,
        day = 12,
        isSelected = false,
        markers = List(4) { fourthMarker },
      ),
      selectedDate = selectedDate,
    ) { payload = it }

    assertTrue(dispatched)
    assertEquals(true, payload?.isSelected)
    assertEquals(3, payload?.markers?.size)
  }

  @Test fun dayCellHeightScalesDefaultAndHonorsCustomConstraint() {
    assertEquals(144.dp, resolveCoolCalendarDayCellHeight(null, 52.dp, 44.dp, 1.5f))
    assertEquals(80.dp, resolveCoolCalendarDayCellHeight(80.dp, 52.dp, 44.dp, 2f))
    assertEquals(52.dp, resolveCoolCalendarDayCellHeight(20.dp, 52.dp, 44.dp, 1f))
    assertEquals(164.dp, resolveCoolCalendarGridHeight(52.dp, 3, 4.dp))
  }

  @Test fun weekdayLabelsFollowLocaleFirstDayOfWeek() {
    val us = defaultCoolCalendarWeekdays(Locale.US)
    val china = defaultCoolCalendarWeekdays(Locale.SIMPLIFIED_CHINESE)
    val france = defaultCoolCalendarWeekdays(Locale.FRANCE)

    assertEquals(Calendar.SUNDAY, Calendar.getInstance(Locale.US).firstDayOfWeek)
    assertEquals(DateFormatSymbols.getInstance(Locale.US).shortWeekdays[Calendar.SUNDAY], us.first())
    val chinaFirstDay = Calendar.getInstance(Locale.SIMPLIFIED_CHINESE).firstDayOfWeek
    assertEquals(DateFormatSymbols.getInstance(Locale.SIMPLIFIED_CHINESE).shortWeekdays[chinaFirstDay], china.first())
    assertEquals(Calendar.MONDAY, Calendar.getInstance(Locale.FRANCE).firstDayOfWeek)
    assertEquals(DateFormatSymbols.getInstance(Locale.FRANCE).shortWeekdays[Calendar.MONDAY], france.first())
  }

  @Test fun accessibilityFallbackUsesLocalizedLongDateAndExplicitLabelWins() {
    val labels = CoolMonthCalendarAccessibilityLabels()
    val usFormatter = DateTimeFormatter.ofLocalizedDate(FormatStyle.LONG).withLocale(Locale.US)
    val zhFormatter = DateTimeFormatter.ofLocalizedDate(FormatStyle.LONG).withLocale(Locale.SIMPLIFIED_CHINESE)
    val day = CoolCalendarDay(selectedDate, 12, secondaryText = "Release")

    val us = day.resolvedAccessibilityLabel(labels, usFormatter)
    val zh = day.resolvedAccessibilityLabel(labels, zhFormatter)
    assertTrue(us.contains("July"))
    assertTrue(zh.contains("2026"))
    assertFalse(us.startsWith(selectedDate.toString()))
    assertFalse(zh.startsWith(selectedDate.toString()))
    assertEquals(
      "Custom day",
      day.copy(accessibilityLabel = "Custom day").resolvedAccessibilityLabel(labels, usFormatter),
    )
  }

  @Test fun resolvedItemKeysUseTypedDateOccurrencesInsteadOfAbsoluteIndices() {
    val first = CoolCalendarDay(selectedDate, 12)
    val duplicate = first.copy(secondaryText = "duplicate")
    val later = CoolCalendarDay(selectedDate.plusDays(1), 13)
    val original = resolveCoolCalendarDayItems(listOf(first, duplicate, later), selectedDate)
    val withInsertion = resolveCoolCalendarDayItems(
      listOf(CoolCalendarDay(selectedDate.minusDays(1), 11), first, duplicate, later),
      selectedDate,
    )
    val reordered = resolveCoolCalendarDayItems(listOf(later, first, duplicate), selectedDate)

    assertEquals(listOf("2026-07-12#0", "2026-07-12#1", "2026-07-13#0"), original.map { it.key })
    assertEquals(original.map { it.key }, withInsertion.drop(1).map { it.key })
    assertEquals(original.map { it.key }.toSet(), reordered.map { it.key }.toSet())
  }
}
