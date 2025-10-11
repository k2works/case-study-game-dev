plugins {
    kotlin("multiplatform") version "2.1.0"
    id("org.jetbrains.compose") version "1.7.1"
    id("org.jetbrains.kotlin.plugin.compose") version "2.1.0"
}

group = "com.example"
version = "1.0.0"

kotlin {
    jvm {
        withJava()
        compilations.all {
            kotlinOptions.jvmTarget = "21"
        }
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(compose.desktop.currentOs)
                implementation(compose.foundation)
                implementation(compose.material)
                implementation(compose.ui)
                implementation(compose.runtime)
            }
        }

        val commonTest by getting {
            dependencies {
                implementation(kotlin("test"))
            }
        }

        val jvmMain by getting {
            dependencies {
                implementation(compose.desktop.currentOs)
            }
        }
    }
}

compose.desktop {
    application {
        mainClass = "MainKt"
    }
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}
