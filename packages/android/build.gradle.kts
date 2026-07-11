import org.gradle.api.publish.maven.MavenPublication

plugins {
  id("com.android.library") version "9.2.0"
  id("org.jetbrains.kotlin.plugin.compose") version "2.3.21"
  `maven-publish`
}

group = "dev.coolui"
val releaseVersion = Regex("\"version\"\\s*:\\s*\"([^\"]+)\"")
  .find(file("../../contracts/release.json").readText())
  ?.groupValues?.get(1)
  ?: error("contracts/release.json must declare version")
version = releaseVersion

android {
  namespace = "dev.coolui.compose"
  compileSdk = 36

  defaultConfig {
    minSdk = 31
    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    consumerProguardFiles("consumer-rules.pro")
  }

  buildFeatures { compose = true }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  testOptions { unitTests.isIncludeAndroidResources = true }

  publishing {
    singleVariant("release") {
      withSourcesJar()
    }
  }
}

dependencies {
  val composeBom = platform("androidx.compose:compose-bom:2026.05.00")
  implementation(composeBom)
  androidTestImplementation(composeBom)
  implementation("androidx.compose.foundation:foundation")
  implementation("androidx.compose.material3:material3")
  implementation("androidx.compose.ui:ui-tooling-preview")
  debugImplementation("androidx.compose.ui:ui-tooling")
  testImplementation("junit:junit:4.13.2")
  androidTestImplementation("androidx.compose.ui:ui-test-junit4")
  androidTestImplementation("androidx.test.ext:junit:1.3.0")
  androidTestImplementation("androidx.test:runner:1.7.0")
  debugImplementation("androidx.compose.ui:ui-test-manifest")
}

publishing {
  publications {
    register<MavenPublication>("release") {
      groupId = "dev.coolui"
      artifactId = "coolui-compose"
      version = project.version.toString()
      afterEvaluate { from(components["release"]) }
      pom {
        name.set("cooL UI Compose")
        description.set("Perceptually consistent native glass UI components for Jetpack Compose.")
        licenses { license { name.set("Apache-2.0"); url.set("https://www.apache.org/licenses/LICENSE-2.0.txt") } }
      }
    }
  }
  repositories { maven { name = "localArtifacts"; url = uri(layout.buildDirectory.dir("repo")) } }
}
