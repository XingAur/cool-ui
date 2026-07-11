package dev.coolui.compose

import android.graphics.RenderEffect
import android.graphics.Shader
import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Checkbox
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asComposeRenderEffect
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.disabled
import androidx.compose.ui.semantics.error
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import dev.coolui.tokens.CoolTokens

enum class ThemeMode { system, light, dark }
enum class GlassMaterial { clear, regular, prominent, solidFallback }
enum class Tone { neutral, accent, success, warning, danger }
enum class Size { small, medium, large }
enum class ContrastMode { standard, high }
enum class MotionMode { full, reduced }
enum class TransparencyMode { full, reduced }
enum class ComponentState { default, pressed, focused, selected, disabled, loading, error }

sealed interface CoolComponentEvent {
  data object Activate : CoolComponentEvent
  data class ValueChanged(val value: String) : CoolComponentEvent
  data object Dismiss : CoolComponentEvent
}

@Immutable
data class CoolComponentProps(
  val label: String,
  val value: String = "",
  val placeholder: String = "",
  val material: GlassMaterial = GlassMaterial.regular,
  val tone: Tone = Tone.neutral,
  val size: Size = Size.medium,
  val state: ComponentState = ComponentState.default,
  val selected: Boolean = false,
  val disabled: Boolean = false,
  val loading: Boolean = false,
  val errorMessage: String? = null,
  val accessibilityLabel: String = label,
  val semanticIcon: String? = null,
  val options: List<String> = emptyList(),
  val minimumValue: Float = 0f,
  val maximumValue: Float = 100f,
)

@Immutable
data class CoolThemeConfiguration(
  val themeMode: ThemeMode = ThemeMode.system,
  val contrastMode: ContrastMode = ContrastMode.standard,
  val motionMode: MotionMode = MotionMode.full,
  val transparencyMode: TransparencyMode = TransparencyMode.full,
)

val LocalCoolTheme = staticCompositionLocalOf { CoolThemeConfiguration() }

@Composable
fun CoolTheme(
  configuration: CoolThemeConfiguration = CoolThemeConfiguration(),
  content: @Composable () -> Unit,
) {
  CompositionLocalProvider(LocalCoolTheme provides configuration) {
    MaterialTheme(content = content)
  }
}

private fun String.tokenDp(): Dp = removeSuffix("px").toFloatOrNull()?.dp ?: 0.dp

private fun String.tokenColor(): Color {
  val normalized = removePrefix("#")
  val rgba = normalized.toULongOrNull(16) ?: return Color.Transparent
  val argb = ((rgba and 0xffu) shl 24) or (rgba shr 8)
  return Color(argb.toLong())
}

private fun Tone.tokenColor(): Color = when (this) {
  Tone.neutral -> CoolTokens.colorLightSurfaceTint.tokenColor()
  Tone.accent -> CoolTokens.colorLightAccent.tokenColor()
  Tone.success -> CoolTokens.colorLightSuccess.tokenColor()
  Tone.warning -> CoolTokens.colorLightWarning.tokenColor()
  Tone.danger -> CoolTokens.colorLightDanger.tokenColor()
}

private fun Size.radius(): Dp = when (this) {
  Size.small -> CoolTokens.radiusSmall.tokenDp()
  Size.medium -> CoolTokens.radiusMedium.tokenDp()
  Size.large -> CoolTokens.radiusLarge.tokenDp()
}

private fun GlassMaterial.blurRadius(): Dp = when (this) {
  GlassMaterial.clear -> CoolTokens.blurClear.tokenDp()
  GlassMaterial.regular -> CoolTokens.blurRegular.tokenDp()
  GlassMaterial.prominent -> CoolTokens.blurProminent.tokenDp()
  GlassMaterial.solidFallback -> 0.dp
}

private fun Modifier.fluidGlass(material: GlassMaterial): Modifier {
  if (material == GlassMaterial.solidFallback) return this
  val radius = material.blurRadius()
  return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    graphicsLayer {
      renderEffect = RenderEffect.createBlurEffect(radius.toPx(), radius.toPx(), Shader.TileMode.CLAMP).asComposeRenderEffect()
    }
  } else {
    blur(radius)
  }
}

@Composable
private fun CoolNativeSurface(
  props: CoolComponentProps,
  modifier: Modifier = Modifier,
  content: @Composable () -> Unit,
) {
  val reducedTransparency = LocalCoolTheme.current.transparencyMode == TransparencyMode.reduced
  val material = if (reducedTransparency) GlassMaterial.solidFallback else props.material
  val background = if (material == GlassMaterial.solidFallback) {
    CoolTokens.colorLightSurface.tokenColor()
  } else {
    props.tone.tokenColor().copy(alpha = CoolTokens.lightingBackdropGlowOpacity.toFloat())
  }
  Surface(
    modifier = modifier
      .fluidGlass(material)
      .background(background, RoundedCornerShape(props.size.radius())),
    shape = RoundedCornerShape(props.size.radius()),
    color = Color.Transparent,
    content = content,
  )
}

@Composable
fun CoolGeneratedComponent(
  name: String,
  interactive: Boolean,
  props: CoolComponentProps,
  modifier: Modifier = Modifier,
  onEvent: (CoolComponentEvent) -> Unit,
) {
  val interactionSource = MutableInteractionSource()
  val nativeControls = setOf("TextField", "TextArea", "SearchField", "Toggle", "Checkbox", "Slider", "Stepper", "Progress", "CircularProgress", "Divider")
  val semantics = Modifier.semantics {
    contentDescription = props.accessibilityLabel
    if (props.disabled) disabled()
    props.errorMessage?.let { error(it) }
  }
  val interaction = if (interactive && name !in nativeControls && !props.disabled && !props.loading) {
    Modifier.clickable(interactionSource = interactionSource, indication = null) { onEvent(CoolComponentEvent.Activate) }
  } else Modifier

  CoolNativeSurface(props, modifier.then(semantics).then(interaction)) {
    Row(
      modifier = Modifier.defaultMinSize(minHeight = CoolTokens.sizeTouchTarget.tokenDp())
        .padding(horizontal = CoolTokens.spaceLg.tokenDp()),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.spacedBy(CoolTokens.spaceSm.tokenDp()),
    ) {
      if (props.loading) CircularProgressIndicator()
      when (name) {
        "TextField", "SearchField" -> TextField(
          value = props.value,
          onValueChange = { onEvent(CoolComponentEvent.ValueChanged(it)) },
          enabled = !props.disabled,
          placeholder = { Text(props.placeholder) },
          singleLine = true,
        )
        "TextArea" -> TextField(
          value = props.value,
          onValueChange = { onEvent(CoolComponentEvent.ValueChanged(it)) },
          enabled = !props.disabled,
          placeholder = { Text(props.placeholder) },
          minLines = 3,
        )
        "Toggle" -> Switch(checked = props.selected, onCheckedChange = { onEvent(CoolComponentEvent.ValueChanged(it.toString())) }, enabled = !props.disabled)
        "Checkbox" -> Checkbox(checked = props.selected, onCheckedChange = { onEvent(CoolComponentEvent.ValueChanged(it.toString())) }, enabled = !props.disabled)
        "Slider" -> Slider(
          value = props.value.toFloatOrNull() ?: props.minimumValue,
          onValueChange = { onEvent(CoolComponentEvent.ValueChanged(it.toString())) },
          valueRange = props.minimumValue..props.maximumValue,
          enabled = !props.disabled,
        )
        "Stepper" -> {
          androidx.compose.material3.TextButton(onClick = { onEvent(CoolComponentEvent.ValueChanged(((props.value.toIntOrNull() ?: 0) - 1).toString())) }) { Text("−") }
          Text(props.value)
          androidx.compose.material3.TextButton(onClick = { onEvent(CoolComponentEvent.ValueChanged(((props.value.toIntOrNull() ?: 0) + 1).toString())) }) { Text("+") }
        }
        "Progress" -> LinearProgressIndicator(progress = { ((props.value.toFloatOrNull() ?: props.minimumValue) / props.maximumValue).coerceIn(0f, 1f) })
        "CircularProgress" -> CircularProgressIndicator(progress = { ((props.value.toFloatOrNull() ?: props.minimumValue) / props.maximumValue).coerceIn(0f, 1f) })
        "Divider" -> HorizontalDivider()
        else -> Text(props.label)
      }
      props.errorMessage?.let { Text(it, color = CoolTokens.colorLightDanger.tokenColor()) }
    }
  }
}

@Composable
fun CoolGlassContainer(content: @Composable () -> Unit) {
  Box(contentAlignment = Alignment.Center) { content() }
}
