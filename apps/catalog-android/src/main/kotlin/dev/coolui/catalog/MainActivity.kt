package dev.coolui.catalog

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import dev.coolui.compose.CoolComponentProps
import dev.coolui.compose.CoolGeneratedComponent
import dev.coolui.compose.CoolTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent { CoolTheme { Catalog() } }
  }
}

@Composable
private fun Catalog() {
  val names = "ThemeProvider Backdrop GlassSurface GlassGroup Divider Button IconButton FloatingActionButton Chip TextField TextArea SearchField Toggle Checkbox RadioGroup Slider Stepper Select DatePicker TimePicker TopBar BottomNavigation TabBar SegmentedControl NavigationRail Card List ListItem Badge Avatar Progress CircularProgress Skeleton StatTile EmptyState Toast Banner AlertDialog BottomSheet Popover Tooltip LoadingOverlay".split(' ')
  LazyColumn(
    modifier = Modifier.fillMaxSize().background(Brush.linearGradient(listOf(Color(0xFF071018), Color(0xFF173548)))).padding(24.dp),
    verticalArrangement = Arrangement.spacedBy(12.dp),
  ) {
    item { Column { Text("cooL UI / COMPOSE", color = Color(0xFF64D2FF)); Text("Native glass catalog", color = Color.White, style = MaterialTheme.typography.headlineLarge) } }
    items(names) { name -> CoolGeneratedComponent(name, true, CoolComponentProps(label = name, accessibilityLabel = "$name example"), onEvent = {}) }
  }
}
