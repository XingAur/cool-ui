package dev.coolui.compose

import android.icu.text.DateTimePatternGenerator
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.sizeIn
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.disabled
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import java.text.DateFormatSymbols
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.util.Locale

enum class CoolMonthDirection { Previous, Next }

@Immutable
data class CoolCalendarMarker(
  val tone: Tone = Tone.neutral,
  val accessibilityLabel: String? = null,
)

@Immutable
data class CoolCalendarDay(
  val date: LocalDate,
  val day: Int,
  val secondaryText: String? = null,
  val accessibilityLabel: String? = null,
  val isToday: Boolean = false,
  val isSelected: Boolean = false,
  val isDisabled: Boolean = false,
  val tone: Tone = Tone.neutral,
  val badge: String? = null,
  val markers: List<CoolCalendarMarker> = emptyList(),
) {
  val visibleMarkers: List<CoolCalendarMarker> get() = markers.take(3)

  fun resolved(selectedDate: LocalDate): CoolCalendarDay = copy(
    isSelected = date == selectedDate,
    markers = visibleMarkers,
  )
}

class CoolMonthCalendarAccessibilityLabels(
  val previousMonth: String = "Previous month",
  val nextMonth: String = "Next month",
  val today: String = "Today",
  val markerToneLabel: (Tone) -> String = { tone -> "${tone.name} marker" },
)

internal fun CoolCalendarDay.resolvedAccessibilityLabel(
  labels: CoolMonthCalendarAccessibilityLabels,
): String {
  accessibilityLabel?.takeIf(String::isNotBlank)?.let { return it }
  return buildList {
    add(date.toString())
    secondaryText?.takeIf(String::isNotBlank)?.let(::add)
    badge?.takeIf(String::isNotBlank)?.let { add(it) }
    if (isToday) add(labels.today)
    markers.forEach { marker ->
      add(marker.accessibilityLabel?.takeIf(String::isNotBlank) ?: labels.markerToneLabel(marker.tone))
    }
  }.joinToString(", ")
}

internal fun dispatchCoolCalendarDaySelection(
  day: CoolCalendarDay,
  selectedDate: LocalDate,
  onDaySelected: (CoolCalendarDay) -> Unit,
): Boolean {
  if (day.isDisabled) return false
  onDaySelected(day.resolved(selectedDate))
  return true
}

internal fun defaultCoolCalendarWeekdays(locale: Locale): List<String> {
  val shortWeekdays = DateFormatSymbols.getInstance(locale).shortWeekdays
  return listOf(
    shortWeekdays[2],
    shortWeekdays[3],
    shortWeekdays[4],
    shortWeekdays[5],
    shortWeekdays[6],
    shortWeekdays[7],
    shortWeekdays[1],
  )
}

@Composable
fun CoolMonthCalendar(
  selectedDate: LocalDate,
  displayedMonth: YearMonth,
  days: List<CoolCalendarDay>,
  weekdays: List<String> = emptyList(),
  onDaySelected: (CoolCalendarDay) -> Unit,
  onMonthChange: (CoolMonthDirection) -> Unit,
  modifier: Modifier = Modifier,
  material: GlassMaterial = GlassMaterial.regular,
  tone: Tone = Tone.neutral,
  locale: Locale = Locale.getDefault(),
  accessibilityLabels: CoolMonthCalendarAccessibilityLabels = CoolMonthCalendarAccessibilityLabels(),
  header: (@Composable (YearMonth, (CoolMonthDirection) -> Unit) -> Unit)? = null,
  dayContent: (@Composable (CoolCalendarDay) -> Unit)? = null,
  markerContent: (@Composable (CoolCalendarMarker) -> Unit)? = null,
) {
  val resolvedDays = days.map { it.resolved(selectedDate) }
  val resolvedWeekdays = if (weekdays.size == 7) weekdays else defaultCoolCalendarWeekdays(locale)
  val monthPattern = DateTimePatternGenerator.getInstance(locale).getBestPattern("yMMMM")
  val monthFormatter = DateTimeFormatter.ofPattern(monthPattern, locale)
  val dayRowCount = ((resolvedDays.size + 6) / 7).coerceAtLeast(1)
  val calendarHeight = 112.dp + (96.dp * dayRowCount)

  CoolGlassSurface(modifier = modifier, material = material, tone = tone) {
    BoxWithConstraints(Modifier.fillMaxWidth()) {
      val minimumCalendarWidth = 360.dp
      val calendarWidth = maxOf(maxWidth, minimumCalendarWidth)
      LazyRow(Modifier.fillMaxWidth()) {
        item {
          LazyVerticalGrid(
            columns = GridCells.Fixed(7),
            modifier = Modifier.width(calendarWidth).height(calendarHeight),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
          ) {
            item(span = { GridItemSpan(7) }) {
              if (header == null) {
                DefaultCoolMonthCalendarHeader(
                  title = displayedMonth.format(monthFormatter),
                  labels = accessibilityLabels,
                  onMonthChange = onMonthChange,
                )
              } else {
                header(displayedMonth, onMonthChange)
              }
            }
            items(7) { index ->
              Text(
                text = resolvedWeekdays[index],
                modifier = Modifier.padding(vertical = 8.dp),
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.SemiBold,
              )
            }
            itemsIndexed(
              items = resolvedDays,
              key = { index, day -> "${day.date}:$index" },
            ) { _, day ->
              CoolMonthCalendarDayButton(
                day = day,
                selectedDate = selectedDate,
                labels = accessibilityLabels,
                onDaySelected = onDaySelected,
                dayContent = dayContent,
                markerContent = markerContent,
              )
            }
          }
        }
      }
    }
  }
}

@Composable
private fun DefaultCoolMonthCalendarHeader(
  title: String,
  labels: CoolMonthCalendarAccessibilityLabels,
  onMonthChange: (CoolMonthDirection) -> Unit,
) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically,
  ) {
    TextButton(
      onClick = { onMonthChange(CoolMonthDirection.Previous) },
      modifier = Modifier.semantics { contentDescription = labels.previousMonth },
    ) { Text("‹") }
    Text(
      text = title,
      style = MaterialTheme.typography.titleMedium,
      fontWeight = FontWeight.SemiBold,
    )
    TextButton(
      onClick = { onMonthChange(CoolMonthDirection.Next) },
      modifier = Modifier.semantics { contentDescription = labels.nextMonth },
    ) { Text("›") }
  }
}

@Composable
private fun CoolMonthCalendarDayButton(
  day: CoolCalendarDay,
  selectedDate: LocalDate,
  labels: CoolMonthCalendarAccessibilityLabels,
  onDaySelected: (CoolCalendarDay) -> Unit,
  dayContent: (@Composable (CoolCalendarDay) -> Unit)?,
  markerContent: (@Composable (CoolCalendarMarker) -> Unit)?,
) {
  val containerColor = when {
    day.isSelected -> day.tone.tokenColor().copy(alpha = .88f)
    day.isToday -> day.tone.tokenColor().copy(alpha = .24f)
    else -> Color.Transparent
  }
  val contentColor = if (day.isSelected) Color.White else MaterialTheme.colorScheme.onSurface
  val borderColor = if (day.isToday || day.isSelected) day.tone.tokenColor() else Color.Transparent
  val semanticsModifier = Modifier.semantics {
    contentDescription = day.resolvedAccessibilityLabel(labels)
    selected = day.isSelected
    if (day.isDisabled) disabled()
  }

  Button(
    onClick = { dispatchCoolCalendarDaySelection(day, selectedDate, onDaySelected) },
    enabled = !day.isDisabled,
    modifier = semanticsModifier
      .sizeIn(minWidth = 48.dp, minHeight = 48.dp)
      .border(1.dp, borderColor, RoundedCornerShape(12.dp)),
    shape = RoundedCornerShape(12.dp),
    colors = ButtonDefaults.buttonColors(
      containerColor = containerColor,
      contentColor = contentColor,
      disabledContainerColor = containerColor.copy(alpha = .35f),
      disabledContentColor = contentColor.copy(alpha = .38f),
    ),
    contentPadding = PaddingValues(4.dp),
  ) {
    Column(
      modifier = Modifier.clearAndSetSemantics {},
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.spacedBy(2.dp),
    ) {
      if (dayContent == null) {
        DefaultCoolMonthCalendarDay(day)
      } else {
        dayContent(day)
      }
      if (day.visibleMarkers.isNotEmpty()) {
        CoolMonthCalendarMarkerRow(day.visibleMarkers, markerContent)
      }
    }
  }
}

@Composable
private fun DefaultCoolMonthCalendarDay(
  day: CoolCalendarDay,
) {
  Text(text = day.day.toString(), style = MaterialTheme.typography.bodyMedium)
  day.secondaryText?.let { Text(text = it, style = MaterialTheme.typography.labelSmall) }
  day.badge?.let {
    Text(
      text = it,
      modifier = Modifier
        .background(day.tone.tokenColor().copy(alpha = .18f), CircleShape)
        .padding(horizontal = 4.dp, vertical = 1.dp),
      style = MaterialTheme.typography.labelSmall,
    )
  }
}

@Composable
private fun CoolMonthCalendarMarkerRow(
  markers: List<CoolCalendarMarker>,
  markerContent: (@Composable (CoolCalendarMarker) -> Unit)?,
) {
  Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
    markers.forEach { marker ->
      if (markerContent == null) {
        Box(Modifier.size(6.dp).background(marker.tone.tokenColor(), CircleShape))
      } else {
        markerContent(marker)
      }
    }
  }
}
