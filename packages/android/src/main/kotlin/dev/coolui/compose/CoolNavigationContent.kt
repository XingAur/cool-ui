@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package dev.coolui.compose

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Badge
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp

data class CoolNavigationItem<T>(val value: T, val label: String, val icon: @Composable () -> Unit = {})

@Composable
fun CoolTopBar(title: String, modifier: Modifier = Modifier, navigationIcon: @Composable () -> Unit = {}, actions: @Composable RowScope.() -> Unit = {}) {
  TopAppBar(title = { Text(title) }, modifier = modifier, navigationIcon = navigationIcon, actions = actions)
}

@Composable
fun <T> CoolBottomNavigation(items: List<CoolNavigationItem<T>>, selected: T, onSelectedChange: (T) -> Unit, modifier: Modifier = Modifier) {
  NavigationBar(modifier) { items.forEach { item -> NavigationBarItem(selected == item.value, { onSelectedChange(item.value) }, item.icon, label = { Text(item.label) }) } }
}

@Composable
fun <T> CoolTabBar(items: List<CoolNavigationItem<T>>, selected: T, onSelectedChange: (T) -> Unit, modifier: Modifier = Modifier) {
  TabRow(items.indexOfFirst { it.value == selected }.coerceAtLeast(0), modifier) { items.forEach { item -> Tab(selected == item.value, { onSelectedChange(item.value) }, text = { Text(item.label) }, icon = item.icon) } }
}

@Composable
fun <T> CoolSegmentedControl(options: List<CoolOption<T>>, selected: T, onSelectedChange: (T) -> Unit, modifier: Modifier = Modifier) {
  CoolTabBar(options.map { CoolNavigationItem(it.value, it.label) }, selected, onSelectedChange, modifier)
}

@Composable
fun <T> CoolNavigationRail(items: List<CoolNavigationItem<T>>, selected: T, onSelectedChange: (T) -> Unit, modifier: Modifier = Modifier) {
  NavigationRail(modifier) { items.forEach { item -> NavigationRailItem(selected == item.value, { onSelectedChange(item.value) }, item.icon, label = { Text(item.label) }) } }
}

@Composable
fun CoolCard(modifier: Modifier = Modifier, onClick: (() -> Unit)? = null, content: @Composable ColumnScope.() -> Unit) {
  if (onClick == null) Card(modifier) { Column(Modifier.padding(16.dp), content = content) } else Card(onClick, modifier) { Column(Modifier.padding(16.dp), content = content) }
}

@Composable
fun CoolList(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) = Column(modifier, content = content)

@Composable
fun CoolListItem(title: String, modifier: Modifier = Modifier, subtitle: String? = null, onClick: (() -> Unit)? = null, leading: @Composable () -> Unit = {}, trailing: @Composable () -> Unit = {}) {
  val body: @Composable () -> Unit = { Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) { leading(); Column(Modifier.weight(1f)) { Text(title); subtitle?.let { Text(it) } }; trailing() } }
  if (onClick == null) Box(modifier) { body() } else Card(onClick, modifier) { body() }
}

@Composable fun CoolBadge(label: String, modifier: Modifier = Modifier) { Badge(modifier) { Text(label) } }
@Composable fun CoolAvatar(initials: String, modifier: Modifier = Modifier) { Box(modifier.clip(CircleShape).background(Tone.accent.tokenColor()).padding(12.dp)) { Text(initials) } }
@Composable fun CoolProgress(value: Float, modifier: Modifier = Modifier) { LinearProgressIndicator({ value.coerceIn(0f, 1f) }, modifier) }
@Composable fun CoolCircularProgress(value: Float, modifier: Modifier = Modifier) { CircularProgressIndicator({ value.coerceIn(0f, 1f) }, modifier) }
@Composable fun CoolSkeleton(modifier: Modifier = Modifier) { Box(modifier.background(Tone.neutral.tokenColor().copy(alpha = .24f))) }
@Composable fun CoolStatTile(label: String, value: String, modifier: Modifier = Modifier) { CoolCard(modifier) { Text(value); Text(label) } }
@Composable fun CoolEmptyState(title: String, modifier: Modifier = Modifier, message: String? = null, action: @Composable () -> Unit = {}) { Column(modifier) { Text(title); message?.let { Text(it) }; action() } }
