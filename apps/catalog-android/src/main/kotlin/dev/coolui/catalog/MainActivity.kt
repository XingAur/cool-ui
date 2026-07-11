package dev.coolui.catalog

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import dev.coolui.compose.*
import java.time.LocalDate
import java.time.LocalTime

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent { CoolThemeProvider { Catalog() } }
  }
}

@Composable
private fun Catalog() {
  var text by remember { mutableStateOf("") }
  var enabled by remember { mutableStateOf(true) }
  var selected by remember { mutableStateOf("home") }
  var slider by remember { mutableFloatStateOf(.42f) }
  var step by remember { mutableIntStateOf(3) }
  var date by remember { mutableStateOf(LocalDate.now()) }
  var time by remember { mutableStateOf(LocalTime.NOON) }
  var dialog by remember { mutableStateOf(false) }
  val navigation = listOf(CoolNavigationItem("home", "Home"), CoolNavigationItem("tools", "Tools"))

  CoolBackdrop(
    modifier = Modifier.fillMaxSize(),
    background = { Box(Modifier.fillMaxSize().background(Brush.linearGradient(listOf(Color(0xFF071018), Color(0xFF173548))))) },
  ) {
    LazyColumn(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
      item { Text("cooL UI / COMPOSE", color = Color(0xFF64D2FF)); Text("Native component catalog", color = Color.White) }
      item { CoolGlassSurface { Column { Text("GlassSurface"); CoolDivider() } } }
      item { CoolGlassGroup { CoolButton("Button", {}); CoolIconButton("Add", {}, icon = { Text("+") }); CoolFloatingActionButton({}, content = { Text("+") }); CoolChip("Chip", enabled, { enabled = it }) } }
      item { CoolTextField(text, { text = it }, "Text field"); CoolTextArea(text, { text = it }, "Text area"); CoolSearchField(text, { text = it }); CoolToggle(enabled, { enabled = it }, "Toggle"); CoolCheckbox(enabled, { enabled = it }, "Checkbox") }
      item { CoolRadioGroup(navigation.map { CoolOption(it.value, it.label) }, selected, { selected = it }); CoolSlider(slider, { slider = it }); CoolStepper(step, { step = it }); CoolSelect(navigation.map { CoolOption(it.value, it.label) }, selected, { selected = it }); CoolDatePicker(date, { date = it }); CoolTimePicker(time, { time = it }) }
      item { CoolTopBar("Top bar"); CoolBottomNavigation(navigation, selected, { selected = it }); CoolTabBar(navigation, selected, { selected = it }); CoolSegmentedControl(navigation.map { CoolOption(it.value, it.label) }, selected, { selected = it }); CoolNavigationRail(navigation, selected, { selected = it }) }
      item { CoolCard { Text("Card") }; CoolList { CoolListItem("List item", subtitle = "Native semantics") }; CoolBadge("New"); CoolAvatar("CU"); CoolProgress(slider); CoolCircularProgress(slider); CoolSkeleton(Modifier.fillMaxWidth().height(28.dp)); CoolStatTile("Score", "98"); CoolEmptyState("Nothing here", message = "Try another filter") }
      item { CoolToast("Saved"); CoolBanner("Update available", actionLabel = "Install", onAction = {}); CoolButton("Show alert", { dialog = true }); CoolPopover(false, {}); CoolTooltip("Helpful context") { Text("Tooltip target") }; CoolLoadingOverlay(false) { Text("Loading overlay target") } }
    }
  }
  CoolAlertDialog(dialog, { dialog = false }, "Confirm", "Native Material dialog", "OK", { dialog = false })
  CoolBottomSheet(false, {}) { Text("Bottom sheet") }
}
