package dev.coolui.compose

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
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

@Immutable
data class CoolThemeConfiguration(
  val themeMode: ThemeMode = ThemeMode.system,
  val contrastMode: ContrastMode = ContrastMode.standard,
  val motionMode: MotionMode = MotionMode.full,
  val transparencyMode: TransparencyMode = TransparencyMode.full,
)

val LocalCoolTheme = staticCompositionLocalOf { CoolThemeConfiguration() }

@Composable
fun CoolThemeProvider(
  configuration: CoolThemeConfiguration = CoolThemeConfiguration(),
  content: @Composable () -> Unit,
) = CompositionLocalProvider(LocalCoolTheme provides configuration) { MaterialTheme(content = content) }

@Deprecated("Use CoolThemeProvider", ReplaceWith("CoolThemeProvider(configuration, content)"))
@Composable
fun CoolTheme(
  configuration: CoolThemeConfiguration = CoolThemeConfiguration(),
  content: @Composable () -> Unit,
) = CoolThemeProvider(configuration, content)

internal fun String.tokenDp(): Dp = removeSuffix("px").toFloatOrNull()?.dp ?: 0.dp

internal fun String.tokenColor(): Color {
  val normalized = removePrefix("#")
  val rgba = normalized.toULongOrNull(16) ?: return Color.Transparent
  val argb = ((rgba and 0xffu) shl 24) or (rgba shr 8)
  return Color(argb.toLong())
}

internal fun Tone.tokenColor(): Color = when (this) {
  Tone.neutral -> CoolTokens.colorLightSurfaceTint.tokenColor()
  Tone.accent -> CoolTokens.colorLightAccent.tokenColor()
  Tone.success -> CoolTokens.colorLightSuccess.tokenColor()
  Tone.warning -> CoolTokens.colorLightWarning.tokenColor()
  Tone.danger -> CoolTokens.colorLightDanger.tokenColor()
}

internal fun Size.radius(): Dp = when (this) {
  Size.small -> CoolTokens.radiusSmall.tokenDp()
  Size.medium -> CoolTokens.radiusMedium.tokenDp()
  Size.large -> CoolTokens.radiusLarge.tokenDp()
}

@Composable
fun CoolGlassSurface(
  modifier: Modifier = Modifier,
  material: GlassMaterial = GlassMaterial.regular,
  tone: Tone = Tone.neutral,
  size: Size = Size.medium,
  content: @Composable BoxScope.() -> Unit,
) {
  val resolved = if (LocalCoolTheme.current.transparencyMode == TransparencyMode.reduced) GlassMaterial.solidFallback else material
  val alpha = when (resolved) {
    GlassMaterial.clear -> 0.12f
    GlassMaterial.regular -> 0.20f
    GlassMaterial.prominent -> 0.32f
    GlassMaterial.solidFallback -> 1f
  }
  val color = if (resolved == GlassMaterial.solidFallback) CoolTokens.colorLightSurface.tokenColor() else tone.tokenColor().copy(alpha = alpha)
  Box(modifier.background(color, RoundedCornerShape(size.radius())).padding(CoolTokens.spaceMd.tokenDp()), content = content)
}

@Composable
fun CoolGlassGroup(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
  Column(modifier = modifier, content = content)
}

@Composable
fun CoolDivider(modifier: Modifier = Modifier) {
  androidx.compose.material3.HorizontalDivider(modifier = modifier)
}
