package dev.coolui.compose

import org.junit.Assert.assertEquals
import org.junit.Test

class CoolContractTest {
  @Test fun semanticEnumsRemainStable() {
    assertEquals(listOf("system", "light", "dark"), ThemeMode.entries.map { it.name })
    assertEquals(listOf("clear", "regular", "prominent", "solidFallback"), GlassMaterial.entries.map { it.name })
  }
}
