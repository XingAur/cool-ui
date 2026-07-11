package dev.coolui.compose

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Slider
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import java.time.LocalDate
import java.time.LocalTime

@Composable
fun CoolButton(label: String, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true, loading: Boolean = false) {
  Button(onClick = onClick, modifier = modifier, enabled = enabled && !loading) { Text(if (loading) "…" else label) }
}

@Composable
fun CoolIconButton(accessibilityLabel: String, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true, icon: @Composable () -> Unit) {
  IconButton(onClick = onClick, modifier = modifier.semantics { contentDescription = accessibilityLabel }, enabled = enabled) { icon() }
}

@Composable
fun CoolFloatingActionButton(onClick: () -> Unit, modifier: Modifier = Modifier, content: @Composable () -> Unit) {
  FloatingActionButton(onClick = onClick, modifier = modifier, content = content)
}

@Composable
fun CoolChip(label: String, selected: Boolean, onSelectedChange: (Boolean) -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true) {
  FilterChip(selected = selected, onClick = { onSelectedChange(!selected) }, label = { Text(label) }, modifier = modifier, enabled = enabled)
}

@Composable
fun CoolTextField(value: String, onValueChange: (String) -> Unit, label: String, modifier: Modifier = Modifier, placeholder: String = "", enabled: Boolean = true, errorMessage: String? = null) {
  OutlinedTextField(value = value, onValueChange = onValueChange, modifier = modifier, enabled = enabled, singleLine = true, label = { Text(label) }, placeholder = { Text(placeholder) }, isError = errorMessage != null, supportingText = errorMessage?.let { { Text(it) } })
}

@Composable
fun CoolTextArea(value: String, onValueChange: (String) -> Unit, label: String, modifier: Modifier = Modifier, placeholder: String = "", enabled: Boolean = true, errorMessage: String? = null) {
  OutlinedTextField(value = value, onValueChange = onValueChange, modifier = modifier, enabled = enabled, minLines = 3, label = { Text(label) }, placeholder = { Text(placeholder) }, isError = errorMessage != null, supportingText = errorMessage?.let { { Text(it) } })
}

@Composable
fun CoolSearchField(value: String, onValueChange: (String) -> Unit, modifier: Modifier = Modifier, placeholder: String = "Search", enabled: Boolean = true) {
  OutlinedTextField(value = value, onValueChange = onValueChange, modifier = modifier, enabled = enabled, singleLine = true, placeholder = { Text(placeholder) })
}

@Composable
fun CoolToggle(checked: Boolean, onCheckedChange: (Boolean) -> Unit, label: String, modifier: Modifier = Modifier, enabled: Boolean = true) {
  Row(modifier, horizontalArrangement = Arrangement.spacedBy(8.dp)) { Switch(checked, onCheckedChange, enabled = enabled); Text(label) }
}

@Composable
fun CoolCheckbox(checked: Boolean, onCheckedChange: (Boolean) -> Unit, label: String, modifier: Modifier = Modifier, enabled: Boolean = true) {
  Row(modifier, horizontalArrangement = Arrangement.spacedBy(8.dp)) { Checkbox(checked, onCheckedChange, enabled = enabled); Text(label) }
}

@Composable
fun <T> CoolRadioGroup(options: List<CoolOption<T>>, selected: T, onSelectedChange: (T) -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true) {
  Column(modifier) { options.forEach { option -> Row { RadioButton(selected == option.value, { onSelectedChange(option.value) }, enabled = enabled); Text(option.label) } } }
}

data class CoolOption<T>(val value: T, val label: String)

@Composable
fun CoolSlider(value: Float, onValueChange: (Float) -> Unit, modifier: Modifier = Modifier, valueRange: ClosedFloatingPointRange<Float> = 0f..1f, enabled: Boolean = true) {
  Slider(value, onValueChange, modifier = modifier, enabled = enabled, valueRange = valueRange)
}

@Composable
fun CoolStepper(value: Int, onValueChange: (Int) -> Unit, modifier: Modifier = Modifier, range: IntRange = Int.MIN_VALUE..Int.MAX_VALUE, enabled: Boolean = true) {
  Row(modifier) { TextButton({ onValueChange((value - 1).coerceAtLeast(range.first)) }, enabled = enabled && value > range.first) { Text("−") }; Text("$value"); TextButton({ onValueChange((value + 1).coerceAtMost(range.last)) }, enabled = enabled && value < range.last) { Text("+") } }
}

@Composable
fun <T> CoolSelect(options: List<CoolOption<T>>, selected: T, onSelectedChange: (T) -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true) {
  var expanded by remember { mutableStateOf(false) }
  val label = options.firstOrNull { it.value == selected }?.label.orEmpty()
  Column(modifier) { TextButton({ expanded = true }, enabled = enabled) { Text(label) }; DropdownMenu(expanded, { expanded = false }) { options.forEach { option -> DropdownMenuItem({ Text(option.label) }, { expanded = false; onSelectedChange(option.value) }) } } }
}

@Composable
fun CoolDatePicker(value: LocalDate, onValueChange: (LocalDate) -> Unit, label: String = "Date", modifier: Modifier = Modifier, enabled: Boolean = true) {
  val context = LocalContext.current
  TextButton(onClick = { DatePickerDialog(context, { _, y, m, d -> onValueChange(LocalDate.of(y, m + 1, d)) }, value.year, value.monthValue - 1, value.dayOfMonth).show() }, modifier = modifier, enabled = enabled) { Text("$label: $value") }
}

@Composable
fun CoolTimePicker(value: LocalTime, onValueChange: (LocalTime) -> Unit, label: String = "Time", modifier: Modifier = Modifier, enabled: Boolean = true) {
  val context = LocalContext.current
  TextButton(onClick = { TimePickerDialog(context, { _, h, m -> onValueChange(LocalTime.of(h, m)) }, value.hour, value.minute, true).show() }, modifier = modifier, enabled = enabled) { Text("$label: $value") }
}
