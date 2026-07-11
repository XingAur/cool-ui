plugins {
  id("com.android.application") version "9.2.0"
  id("org.jetbrains.kotlin.plugin.compose") version "2.3.21"
}

val releaseVersion = Regex("\"version\"\\s*:\\s*\"([^\"]+)\"")
  .find(file("../../contracts/release.json").readText())
  ?.groupValues?.get(1)
  ?: error("contracts/release.json must declare version")

android {
  namespace = "dev.coolui.catalog"
  compileSdk = 36
  defaultConfig { applicationId = "dev.coolui.catalog"; minSdk = 31; targetSdk = 36; versionCode = 2; versionName = releaseVersion }
  buildFeatures { compose = true }
  compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}

dependencies {
  implementation(project(":coolui"))
  val composeBom = platform("androidx.compose:compose-bom:2026.05.00")
  implementation(composeBom)
  implementation("androidx.activity:activity-compose:1.13.0")
  implementation("androidx.compose.material3:material3")
  implementation("androidx.compose.foundation:foundation")
}
