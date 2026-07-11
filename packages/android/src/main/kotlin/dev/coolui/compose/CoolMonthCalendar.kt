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
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.disabled
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import dev.coolui.tokens.CoolTokens
import java.text.DateFormatSymbols
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Calendar
import java.util.Locale
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow

enum class CoolMonthDirection { Previous, Next }

internal const val CALENDAR_SUPPLEMENTARY_CONTENT_FONT_SCALE_THRESHOLD = 1.5f

internal fun showsCalendarSupplementaryContent(fontScale: Float): Boolean =
  fontScale < CALENDAR_SUPPLEMENTARY_CONTENT_FONT_SCALE_THRESHOLD

internal fun contrastRatio(foreground: Color, background: Color): Double {
  fun Color.relativeLuminance(): Double {
    fun linearized(channel: Float): Double {
      val value = channel.toDouble()
      return if (value <= 0.04045) value / 12.92 else ((value + 0.055) / 1.055).pow(2.4)
    }
    return (0.2126 * linearized(red)) + (0.7152 * linearized(green)) + (0.0722 * linearized(blue))
  }

  val foregroundLuminance = foreground.relativeLuminance()
  val backgroundLuminance = background.relativeLuminance()
  return (max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (min(foregroundLuminance, backgroundLuminance) + 0.05)
}

internal fun mostContrastingColor(background: Color, candidates: List<Color>): Color {
  require(candidates.isNotEmpty()) { "At least one foreground candidate is required" }
  return candidates.maxBy { contrastRatio(it, background) }
}

@Immutable
data class CoolCalendarMarker(
  val tone: Tone = Tone.neutral,
  val accessibilityLabel: String? = null,
)

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
  dateFormatter: DateTimeFormatter,
): String {
  accessibilityLabel?.takeIf(String::isNotBlank)?.let { return it }
  return buildList {
    add(date.format(dateFormatter))
    secondaryText?.takeIf(String::isNotBlank)?.let(::add)
    badge?.takeIf(String::isNotBlank)?.let { add(it) }
    if (isToday) add(labels.today)
    markers.forEach { marker ->
      add(
        marker.accessibilityLabel?.takeIf(String::isNotBlank)
          ?: labels.markerToneLabel(marker.tone),
      )
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
  val firstDayOfWeek = Calendar.getInstance(locale).firstDayOfWeek
  return List(7) { offset ->
    val calendarDay = ((firstDayOfWeek - Calendar.SUNDAY + offset) % 7) + Calendar.SUNDAY
    shortWeekdays[calendarDay]
  }
}

internal data class ResolvedCoolCalendarDayItem(
  val day: CoolCalendarDay,
  val key: String,
)

internal fun resolveCoolCalendarDayItems(
  days: List<CoolCalendarDay>,
  selectedDate: LocalDate,
): List<ResolvedCoolCalendarDayItem> {
  val occurrences = mutableMapOf<LocalDate, Int>()
  return days.map { day ->
    val occurrence = occurrences.getOrDefault(day.date, 0)
    occurrences[day.date] = occurrence + 1
    ResolvedCoolCalendarDayItem(day.resolved(selectedDate), "${day.date}#$occurrence")
  }
}

internal fun resolveCoolCalendarDayCellHeight(
  customHeight: Dp?,
  controlLarge: Dp,
  touchTarget: Dp,
  fontScale: Float,
): Dp = maxOf(
  touchTarget,
  controlLarge,
  customHeight ?: ((controlLarge + touchTarget) * fontScale.coerceAtLeast(1f)),
)

internal fun resolveCoolCalendarGridHeight(
  dayCellHeight: Dp,
  rowCount: Int,
  rowSpacing: Dp,
): Dp = if (rowCount <= 0) {
  0.dp
} else {
  (dayCellHeight * rowCount) + (rowSpacing * (rowCount - 1))
}

private data class CoolMonthCalendarMetrics(
  val borderWidth: Dp,
  val radius: Dp,
  val spaceXs: Dp,
  val spaceSm: Dp,
  val spaceMd: Dp,
  val touchTarget: Dp,
  val dayCellHeight: Dp,
  val edgeOpacity: Float,
  val highlightOpacity: Float,
  val disabledOpacity: Float,
)

/**
 * A strictly controlled month calendar whose consumer supplies all visible days.
 * At accessibility font scales, default secondary text and badges are hidden visually while their
 * complete values remain in each day button's accessibility description.
 *
 * @param dayCellHeight Optional explicit cell constraint. When custom dayContent is taller than
 * the token-derived default, pass a matching dayCellHeight so the lazy grid can measure exactly.
 */
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
  dayCellHeight: Dp? = null,
  locale: Locale = Locale.getDefault(),
  accessibilityLabels: CoolMonthCalendarAccessibilityLabels = CoolMonthCalendarAccessibilityLabels(),
  header: (@Composable (YearMonth, (CoolMonthDirection) -> Unit) -> Unit)? = null,
  dayContent: (@Composable (CoolCalendarDay) -> Unit)? = null,
  markerContent: (@Composable (CoolCalendarMarker) -> Unit)? = null,
) {
  val fontScale = LocalDensity.current.fontScale
  val showSupplementaryContent = showsCalendarSupplementaryContent(fontScale)
  val metrics = remember(dayCellHeight, fontScale) {
    val touchTarget = CoolTokens.sizeTouchTarget.tokenDp()
    CoolMonthCalendarMetrics(
      borderWidth = CoolTokens.borderHairline.tokenDp(),
      radius = CoolTokens.radiusSmall.tokenDp(),
      spaceXs = CoolTokens.spaceXs.tokenDp(),
      spaceSm = CoolTokens.spaceSm.tokenDp(),
      spaceMd = CoolTokens.spaceMd.tokenDp(),
      touchTarget = touchTarget,
      dayCellHeight = resolveCoolCalendarDayCellHeight(
        dayCellHeight,
        CoolTokens.sizeControlLarge.tokenDp(),
        touchTarget,
        fontScale,
      ),
      edgeOpacity = CoolTokens.lightingEdgeOpacity.toFloat(),
      highlightOpacity = CoolTokens.lightingHighlightOpacity.toFloat(),
      disabledOpacity = CoolTokens.opacityDisabled.toFloat(),
    )
  }
  val resolvedWeekdays = remember(weekdays, locale) {
    if (weekdays.size == 7) weekdays else defaultCoolCalendarWeekdays(locale)
  }
  val monthFormatter = remember(locale) {
    val monthPattern = DateTimePatternGenerator.getInstance(locale).getBestPattern("yMMMM")
    DateTimeFormatter.ofPattern(monthPattern, locale)
  }
  val dateFormatter = remember(locale) {
    DateTimeFormatter.ofLocalizedDate(FormatStyle.LONG).withLocale(locale)
  }
  val resolvedItems = remember(days, selectedDate) { resolveCoolCalendarDayItems(days, selectedDate) }
  val dayRowCount = (resolvedItems.size + 6) / 7
  val gridHeight = resolveCoolCalendarGridHeight(metrics.dayCellHeight, dayRowCount, metrics.spaceXs)

  CoolGlassSurface(modifier = modifier, material = material, tone = tone) {
    BoxWithConstraints(Modifier.fillMaxWidth()) {
      val minimumCalendarWidth = (metrics.touchTarget * 7) + (metrics.spaceXs * 6)
      val calendarWidth = maxOf(maxWidth, minimumCalendarWidth)
      LazyRow(Modifier.fillMaxWidth()) {
        item {
          Column(
            modifier = Modifier.width(calendarWidth),
            verticalArrangement = Arrangement.spacedBy(metrics.spaceMd),
          ) {
            if (header == null) {
              DefaultCoolMonthCalendarHeader(
                title = displayedMonth.format(monthFormatter),
                labels = accessibilityLabels,
                onMonthChange = onMonthChange,
              )
            } else {
              header(displayedMonth, onMonthChange)
            }
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(metrics.spaceXs),
            ) {
              resolvedWeekdays.forEach { weekday ->
                Text(
                  text = weekday,
                  modifier = Modifier.weight(1f).padding(vertical = metrics.spaceSm),
                  style = MaterialTheme.typography.labelMedium,
                  fontWeight = FontWeight.SemiBold,
                )
              }
            }
            if (resolvedItems.isNotEmpty()) {
              LazyVerticalGrid(
                columns = GridCells.Fixed(7),
                modifier = Modifier.fillMaxWidth().height(gridHeight),
                horizontalArrangement = Arrangement.spacedBy(metrics.spaceXs),
                verticalArrangement = Arrangement.spacedBy(metrics.spaceXs),
              ) {
                items(items = resolvedItems, key = { it.key }) { item ->
                  CoolMonthCalendarDayButton(
                    day = item.day,
                    selectedDate = selectedDate,
                    labels = accessibilityLabels,
                    dateFormatter = dateFormatter,
                    metrics = metrics,
                    showSupplementaryContent = showSupplementaryContent,
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
  dateFormatter: DateTimeFormatter,
  metrics: CoolMonthCalendarMetrics,
  showSupplementaryContent: Boolean,
  onDaySelected: (CoolCalendarDay) -> Unit,
  dayContent: (@Composable (CoolCalendarDay) -> Unit)?,
  markerContent: (@Composable (CoolCalendarMarker) -> Unit)?,
) {
  val selectedContainerColor = if (day.tone == Tone.neutral) {
    MaterialTheme.colorScheme.surfaceVariant
  } else {
    day.tone.tokenColor()
  }
  val containerColor = when {
    day.isSelected -> selectedContainerColor
    day.isToday -> day.tone.tokenColor().copy(alpha = metrics.edgeOpacity)
    else -> Color.Transparent
  }
  val contentColor = if (day.isSelected) {
    mostContrastingColor(
      selectedContainerColor,
      listOf(MaterialTheme.colorScheme.onSurface, MaterialTheme.colorScheme.onPrimary),
    )
  } else {
    MaterialTheme.colorScheme.onSurface
  }
  val borderColor = if (day.isToday || day.isSelected) day.tone.tokenColor() else Color.Transparent
  val semanticsModifier = Modifier.semantics {
    contentDescription = day.resolvedAccessibilityLabel(labels, dateFormatter)
    selected = day.isSelected
    if (day.isDisabled) disabled()
  }

  Button(
    onClick = { dispatchCoolCalendarDaySelection(day, selectedDate, onDaySelected) },
    enabled = !day.isDisabled,
    modifier = semanticsModifier
      .height(metrics.dayCellHeight)
      .sizeIn(minWidth = metrics.touchTarget, minHeight = metrics.touchTarget)
      .border(metrics.borderWidth, borderColor, RoundedCornerShape(metrics.radius)),
    shape = RoundedCornerShape(metrics.radius),
    colors = ButtonDefaults.buttonColors(
      containerColor = containerColor,
      contentColor = contentColor,
      disabledContainerColor = containerColor.copy(alpha = metrics.disabledOpacity),
      disabledContentColor = contentColor.copy(alpha = metrics.disabledOpacity),
    ),
    contentPadding = PaddingValues(metrics.spaceXs),
  ) {
    Column(
      modifier = Modifier.clearAndSetSemantics {},
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.spacedBy(metrics.borderWidth),
    ) {
      if (dayContent == null) {
        DefaultCoolMonthCalendarDay(day, metrics, showSupplementaryContent)
      } else {
        dayContent(day)
      }
      if (day.visibleMarkers.isNotEmpty()) {
        CoolMonthCalendarMarkerRow(day.visibleMarkers, markerContent, metrics)
      }
    }
  }
}

@Composable
private fun DefaultCoolMonthCalendarDay(
  day: CoolCalendarDay,
  metrics: CoolMonthCalendarMetrics,
  showSupplementaryContent: Boolean,
) {
  Text(text = day.day.toString(), style = MaterialTheme.typography.bodyMedium)
  if (showSupplementaryContent) {
    day.secondaryText?.let {
      Text(
        text = it,
        style = MaterialTheme.typography.labelSmall,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis,
      )
    }
    day.badge?.let {
      Text(
        text = it,
        modifier = Modifier
          .background(day.tone.tokenColor().copy(alpha = metrics.highlightOpacity), CircleShape)
          .padding(
            horizontal = metrics.spaceXs,
            vertical = metrics.borderWidth,
          ),
        style = MaterialTheme.typography.labelSmall,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis,
      )
    }
  }
}

@Composable
private fun CoolMonthCalendarMarkerRow(
  markers: List<CoolCalendarMarker>,
  markerContent: (@Composable (CoolCalendarMarker) -> Unit)?,
  metrics: CoolMonthCalendarMetrics,
) {
  Row(horizontalArrangement = Arrangement.spacedBy(metrics.borderWidth)) {
    markers.forEach { marker ->
      if (markerContent == null) {
        Box(Modifier.size(metrics.spaceXs).background(marker.tone.tokenColor(), CircleShape))
      } else {
        markerContent(marker)
      }
    }
  }
}
