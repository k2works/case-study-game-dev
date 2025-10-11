plugins {
    kotlin("multiplatform") version "2.1.0"
    id("org.jetbrains.compose") version "1.7.1"
    id("org.jetbrains.kotlin.plugin.compose") version "2.1.0"
    id("io.gitlab.arturbosch.detekt") version "1.23.7"
    id("org.jlleitschuh.gradle.ktlint") version "12.1.2"
    jacoco
}

group = "com.example"
version = "1.0.1"

kotlin {
    jvm {
        withJava()
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
                @OptIn(org.jetbrains.compose.ExperimentalComposeLibrary::class)
                implementation(compose.uiTest)
            }
        }

        val jvmTest by getting {
            dependencies {
                implementation(compose.desktop.uiTestJUnit4)
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

        nativeDistributions {
            targetFormats(
                org.jetbrains.compose.desktop.application.dsl.TargetFormat.Dmg,
                org.jetbrains.compose.desktop.application.dsl.TargetFormat.Msi,
                org.jetbrains.compose.desktop.application.dsl.TargetFormat.Deb,
            )
            packageName = "puyo-puyo-tdd"
            packageVersion = "1.0.1"
            description = "ぷよぷよ TDD - Test Driven Development で作るぷよぷよゲーム"
            vendor = "Example Inc."

            windows {
                iconFile.set(project.file("src/jvmMain/resources/icon.ico"))
                menuGroup = "Puyo Puyo TDD"
                upgradeUuid = "BF9CDA9A-F677-4E38-9E0A-92DAF1278788"
            }

            linux {
                iconFile.set(project.file("src/jvmMain/resources/icon.png"))
            }

            macOS {
                iconFile.set(project.file("src/jvmMain/resources/icon.icns"))
            }
        }
    }
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}

// Detekt configuration
dependencies {
    detektPlugins("io.gitlab.arturbosch.detekt:detekt-formatting:1.23.7")
}

detekt {
    buildUponDefaultConfig = true
    allRules = false
    config.setFrom("$projectDir/config/detekt/detekt.yml")
}

tasks.withType<io.gitlab.arturbosch.detekt.Detekt>().configureEach {
    jvmTarget = "21"
}

// Ktlint configuration
ktlint {
    verbose.set(true)
    outputToConsole.set(true)
    coloredOutput.set(true)
    reporters {
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.CHECKSTYLE)
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.JSON)
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.HTML)
    }
    filter {
        exclude("**/build/**")
    }
}

// JaCoCo configuration
tasks.withType<Test> {
    finalizedBy("jacocoTestReport")
}

tasks.register<JacocoReport>("jacocoTestReport") {
    dependsOn("jvmTest")
    reports {
        xml.required.set(true)
        html.required.set(true)
        csv.required.set(false)
    }
    classDirectories.setFrom(
        files(
            fileTree("build/classes/kotlin/jvm/main"),
        ),
    )
    sourceDirectories.setFrom(files("src/commonMain/kotlin"))
    executionData.setFrom(files("build/jacoco/jvmTest.exec"))
}

// Custom tasks
tasks.register("checkAll") {
    description = "全てのチェックを実行"
    group = "verification"
    dependsOn("ktlintCheck", "detekt", "jvmTest")
}

tasks.register("fixAll") {
    description = "自動修正可能な全ての問題を修正"
    group = "formatting"
    dependsOn("ktlintFormat")
}

tasks.register("qualityCheck") {
    description = "コード品質チェック"
    group = "verification"
    dependsOn("ktlintCheck", "detekt")
}
