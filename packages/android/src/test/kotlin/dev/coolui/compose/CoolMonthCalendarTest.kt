package dev.coolui.compose

import java.time.LocalDate
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
}
