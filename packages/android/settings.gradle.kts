pluginManagement {
  plugins {
    id("com.android.library") version "9.2.0"
    id("org.jetbrains.kotlin.plugin.compose") version "2.3.21"
  }
  repositories {
    google()
    mavenCentral()
    gradlePluginPortal()
  }
}

dependencyResolutionManagement {
  repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
  repositories {
    google()
    mavenCentral()
  }
}

rootProject.name = "coolui-compose"
