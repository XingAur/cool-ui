package dev.coolui.compose

import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.assert
import androidx.compose.ui.test.assertCountEquals
import androidx.compose.ui.test.assertHasClickAction
import androidx.compose.ui.test.assertHeightIsAtLeast
import androidx.compose.ui.test.assertIsNotEnabled
import androidx.compose.ui.test.assertIsSelected
import androidx.compose.ui.test.hasContentDescription
import androidx.compose.ui.test.junit4.v2.createComposeRule
import androidx.compose.ui.test.onAllNodesWithContentDescription
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import androidx.test.ext.junit.runners.AndroidJUnit4
import dev.coolui.tokens.CoolTokens
import java.time.LocalDate
import java.time.YearMonth
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class CoolMonthCalendarSemanticsTest {
  @get:Rule val composeRule = createComposeRule()

  @Test fun selectedAndDisabledDaysExposeNativeButtonSemanticsOnce() {
    val selected = LocalDate.of(2026, 7, 12)
    composeRule.setContent {
      CoolThemeProvider {
        CoolMonthCalendar(
          selectedDate = selected,
          displayedMonth = YearMonth.of(2026, 7),
          days = listOf(
            CoolCalendarDay(selected, 12, accessibilityLabel = "Selected day"),
            CoolCalendarDay(selected.plusDays(1), 13, accessibilityLabel = "Disabled day", isDisabled = true),
          ),
          onDaySelected = {},
          onMonthChange = {},
        )
      }
    }

    composeRule.onNodeWithContentDescription("Selected day")
      .assertHasClickAction()
      .assertIsSelected()
      .assert(SemanticsMatcher.expectValue(SemanticsProperties.Role, Role.Button))
    composeRule.onAllNodesWithContentDescription("Selected day").assertCountEquals(1)
    composeRule.onNodeWithContentDescription("Disabled day").assertIsNotEnabled()
  }

  @Test fun highFontScaleKeepsDayAtLeastTokenTouchTarget() {
    val selected = LocalDate.of(2026, 7, 12)
    val secondary = "A very long accessibility secondary description"
    val badge = "A very long accessibility badge description"
    composeRule.setContent {
      CompositionLocalProvider(LocalDensity provides Density(density = 1f, fontScale = 2f)) {
        CoolThemeProvider {
          CoolMonthCalendar(
            selectedDate = selected,
            displayedMonth = YearMonth.of(2026, 7),
            days = listOf(CoolCalendarDay(selected, 12, secondaryText = secondary, badge = badge)),
            onDaySelected = {},
            onMonthChange = {},
          )
        }
      }
    }

    val touchTarget = CoolTokens.sizeTouchTarget.removeSuffix("px").toFloat().dp
    composeRule.onAllNodesWithText(secondary, useUnmergedTree = true).assertCountEquals(0)
    composeRule.onAllNodesWithText(badge, useUnmergedTree = true).assertCountEquals(0)
    composeRule.onNode(hasContentDescription(secondary, substring = true))
      .assertHeightIsAtLeast(touchTarget)
    composeRule.onAllNodes(hasContentDescription(secondary, substring = true)).assertCountEquals(1)
  }
}
