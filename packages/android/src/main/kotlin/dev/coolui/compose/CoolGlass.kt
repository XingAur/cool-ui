package dev.coolui.compose

import android.graphics.RenderEffect
import android.graphics.Shader
import android.os.Build
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asComposeRenderEffect
import androidx.compose.ui.graphics.graphicsLayer
import dev.coolui.tokens.CoolTokens

@Composable
fun CoolBackdrop(
  modifier: Modifier = Modifier,
  material: GlassMaterial = GlassMaterial.regular,
  background: @Composable BoxScope.() -> Unit,
  content: @Composable BoxScope.() -> Unit,
) {
  val transparencyMode = LocalCoolTheme.current.transparencyMode
  val blur = when (material) {
    GlassMaterial.clear -> CoolTokens.blurClear.tokenDp()
    GlassMaterial.regular -> CoolTokens.blurRegular.tokenDp()
    GlassMaterial.prominent -> CoolTokens.blurProminent.tokenDp()
    GlassMaterial.solidFallback -> CoolTokens.blurClear.tokenDp()
  }
  Box(modifier) {
    Box(Modifier.matchParentSize().graphicsLayer {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && material != GlassMaterial.solidFallback && transparencyMode == TransparencyMode.full) {
        renderEffect = RenderEffect.createBlurEffect(blur.toPx(), blur.toPx(), Shader.TileMode.CLAMP).asComposeRenderEffect()
      }
    }, content = background)
    content()
  }
}
