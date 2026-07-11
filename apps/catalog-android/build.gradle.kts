plugins {
  id("com.android.application") version "9.2.0"
  id("org.jetbrains.kotlin.plugin.compose") version "2.3.21"
}

android {
  namespace = "dev.coolui.catalog"
  compileSdk = 36
  defaultConfig { applicationId = "dev.coolui.catalog"; minSdk = 31; targetSdk = 36; versionCode = 1; versionName = "0.1.0" }
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
