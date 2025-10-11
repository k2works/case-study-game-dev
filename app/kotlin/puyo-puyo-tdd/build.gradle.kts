plugins {
    kotlin("multiplatform") version "2.1.0"
    id("org.jetbrains.compose") version "1.7.1"
    id("org.jetbrains.kotlin.plugin.compose") version "2.1.0"
    id("com.android.application") version "8.2.0"
    id("io.gitlab.arturbosch.detekt") version "1.23.7"
    id("org.jlleitschuh.gradle.ktlint") version "12.1.2"
    jacoco
}

group = "com.example"
version = "1.0.1"

kotlin {
    jvm()

    androidTarget {
        compilations.all {
            kotlinOptions {
                jvmTarget = "11"
            }
        }
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(compose.runtime)
                implementation(compose.foundation)
                implementation(compose.material)
                implementation(compose.ui)
            }
        }

        val commonTest by getting {
            dependencies {
                implementation(kotlin("test"))
                @OptIn(org.jetbrains.compose.ExperimentalComposeLibrary::class)
                implementation(compose.uiTest)
            }
        }

        val androidMain by getting {
            dependencies {
                implementation("androidx.activity:activity-compose:1.8.2")
                implementation("androidx.compose.ui:ui-tooling-preview:1.6.0")
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

        // ProGuard を無効化（Java 21 は ProGuard 7.2.2 でサポートされていないため）
        buildTypes.release.proguard {
            isEnabled.set(false)
        }

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

android {
    namespace = "com.example.puyopuyo"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.puyopuyo"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.1"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
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

// Release tasks
tasks.register("prepareRelease") {
    description = "リリース用ドキュメントと起動スクリプトを準備"
    group = "release"

    doLast {
        val releaseDir = file("release")
        releaseDir.mkdirs()

        // 起動スクリプトをコピー
        copy {
            from("release")
            include("*.bat", "*.sh", "README.txt")
            into(releaseDir)
        }

        // ドキュメントをコピー
        copy {
            from(".")
            include("README.md", "RELEASE.md")
            into(releaseDir)
        }

        println("✅ リリース用ファイルを release/ ディレクトリに準備しました")
    }
}

tasks.register<Copy>("copyReleaseScripts") {
    description = "起動スクリプトを JAR 出力先にコピー"
    group = "release"
    dependsOn("packageUberJarForCurrentOS")

    from("release") {
        include("*.bat", "*.sh", "README.txt")
    }
    into("build/compose/jars")

    doLast {
        // シェルスクリプトに実行権限を付与
        val shellScript = file("build/compose/jars/puyo-puyo-tdd.sh")
        if (shellScript.exists()) {
            shellScript.setExecutable(true)
        }
        println("✅ 起動スクリプトを build/compose/jars/ にコピーしました")
    }
}

tasks.register<Zip>("createReleasePackage") {
    description = "リリースパッケージ（ZIP）を作成"
    group = "release"
    dependsOn("copyReleaseScripts")

    archiveFileName.set("puyo-puyo-tdd-v${project.version}.zip")
    destinationDirectory.set(file("build/release"))

    from("build/compose/jars") {
        include("*.jar", "*.bat", "*.sh", "README.txt")
    }

    from(".") {
        include("README.md", "RELEASE.md")
    }

    doLast {
        val zipFile = file("build/release/puyo-puyo-tdd-v${project.version}.zip")
        println("✅ リリースパッケージを作成しました: ${zipFile.absolutePath}")
        println("   サイズ: ${zipFile.length() / 1024 / 1024} MB")
    }
}

tasks.register("release") {
    description = "完全なリリースパッケージをビルド"
    group = "release"
    dependsOn("checkAll", "createReleasePackage")

    doLast {
        println("")
        println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        println("  🎉 リリース v${project.version} の準備が完了しました！")
        println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        println("")
        println("📦 リリースパッケージ:")
        println("   build/release/puyo-puyo-tdd-v${project.version}.zip")
        println("")
        println("📝 パッケージ内容:")
        println("   - puyo-puyo-tdd-windows-x64-${project.version}.jar")
        println("   - puyo-puyo-tdd.bat (Windows 起動スクリプト)")
        println("   - puyo-puyo-tdd.sh (Linux/macOS 起動スクリプト)")
        println("   - README.txt (クイックスタートガイド)")
        println("   - README.md (プロジェクトドキュメント)")
        println("   - RELEASE.md (リリースノート)")
        println("")
        println("✅ 品質チェック: 合格")
        println("✅ テスト: 全て合格")
        println("✅ ビルド: 成功")
        println("")
    }
}
