@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package dev.coolui.compose

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.PlainTooltip
import androidx.compose.material3.Snackbar
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TooltipBox
import androidx.compose.material3.TooltipDefaults
import androidx.compose.material3.rememberTooltipState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

@Composable fun CoolToast(message: String, modifier: Modifier = Modifier, action: (@Composable () -> Unit)? = null) { Snackbar(modifier = modifier, action = action) { Text(message) } }
@Composable fun CoolBanner(message: String, modifier: Modifier = Modifier, actionLabel: String? = null, onAction: (() -> Unit)? = null) { Row(modifier) { Text(message, Modifier.weight(1f)); if (actionLabel != null && onAction != null) TextButton(onAction) { Text(actionLabel) } } }

@Composable
fun CoolAlertDialog(visible: Boolean, onDismissRequest: () -> Unit, title: String, message: String, confirmLabel: String, onConfirm: () -> Unit, dismissLabel: String? = null) {
  if (visible) AlertDialog(onDismissRequest, confirmButton = { TextButton(onConfirm) { Text(confirmLabel) } }, dismissButton = dismissLabel?.let { { TextButton(onDismissRequest) { Text(it) } } }, title = { Text(title) }, text = { Text(message) })
}

@Composable
fun CoolBottomSheet(visible: Boolean, onDismissRequest: () -> Unit, content: @Composable ColumnScope.() -> Unit) {
  if (visible) ModalBottomSheet(onDismissRequest = onDismissRequest, content = content)
}

@Composable
fun CoolPopover(expanded: Boolean, onDismissRequest: () -> Unit, modifier: Modifier = Modifier, content: @Composable () -> Unit) { DropdownMenu(expanded, onDismissRequest, modifier) { content() } }

@Composable
fun CoolTooltip(text: String, modifier: Modifier = Modifier, content: @Composable () -> Unit) {
  TooltipBox(positionProvider = TooltipDefaults.rememberPlainTooltipPositionProvider(), tooltip = { PlainTooltip { Text(text) } }, state = rememberTooltipState(), modifier = modifier, content = content)
}

@Composable
fun CoolLoadingOverlay(loading: Boolean, modifier: Modifier = Modifier, content: @Composable BoxScope.() -> Unit) {
  Box(modifier) { content(); if (loading) Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() } }
}
