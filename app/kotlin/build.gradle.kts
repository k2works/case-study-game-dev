plugins {
    kotlin("jvm") version "1.9.21"
    kotlin("plugin.serialization") version "1.9.21"
    id("io.gitlab.arturbosch.detekt") version "1.23.4"
    id("org.jetbrains.kotlinx.kover") version "0.7.5"
    application
}

group = "ml"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    // 機械学習ライブラリ
    implementation("com.github.haifengl:smile-core:3.0.2")
    implementation("com.github.haifengl:smile-kotlin:3.0.2")

    // BLAS implementation for linear algebra (required for OLS regression)
    implementation("org.bytedeco:openblas-platform:0.3.21-1.5.8")

    // データ処理
    implementation("com.github.holgerbrandl:krangl:0.18.4")

    // Web API
    implementation("io.ktor:ktor-server-core:2.3.7")
    implementation("io.ktor:ktor-server-netty:2.3.7")
    implementation("io.ktor:ktor-server-content-negotiation:2.3.7")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.7")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")

    // Kotlin Scripting
    implementation(kotlin("script-runtime"))
    implementation(kotlin("scripting-common"))
    implementation(kotlin("scripting-jvm"))
    implementation(kotlin("scripting-jvm-host"))
    implementation(kotlin("scripting-dependencies"))
    implementation(kotlin("scripting-dependencies-maven"))

    // Kotlin Compiler for script execution (added to implementation for simplicity)
    implementation("org.jetbrains.kotlin:kotlin-compiler-embeddable:1.9.21")
    implementation("org.jetbrains.kotlin:kotlin-scripting-compiler-embeddable:1.9.21")

    // テスト
    testImplementation(kotlin("test"))
    testImplementation("io.kotest:kotest-runner-junit5:5.8.0")
    testImplementation("io.kotest:kotest-assertions-core:5.8.0")
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("io.ktor:ktor-server-test-host:2.3.7")
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(17)
}

detekt {
    buildUponDefaultConfig = true
    allRules = false
    config.setFrom(files("$projectDir/detekt.yml"))
}

koverReport {
    filters {
        excludes {
            classes("*Test*")
        }
    }
    verify {
        rule {
            minBound(80)  // 最低カバレッジ80%
        }
    }
}

application {
    mainClass.set("ml.MainKt")
}

// Kotlin スクリプト実行タスク
// Note: Kotlin コンパイラを使用してスクリプトを実行します

tasks.register<JavaExec>("trainIris") {
    group = "ml"
    description = "Train Iris classification model"
    dependsOn("classes")

    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("org.jetbrains.kotlin.cli.jvm.K2JVMCompiler")
    args = listOf(
        "-script",
        file("script/train_iris.kts").absolutePath,
        "-classpath",
        sourceSets["main"].runtimeClasspath.asPath
    )
}

tasks.register<JavaExec>("evaluateIris") {
    group = "ml"
    description = "Evaluate Iris classification model"
    dependsOn("classes")

    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("org.jetbrains.kotlin.cli.jvm.K2JVMCompiler")
    args = listOf(
        "-script",
        file("script/evaluate_iris.kts").absolutePath,
        "-classpath",
        sourceSets["main"].runtimeClasspath.asPath
    )
}

tasks.register<JavaExec>("trainCinema") {
    group = "ml"
    description = "Train Cinema box office prediction model"
    dependsOn("classes")

    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("org.jetbrains.kotlin.cli.jvm.K2JVMCompiler")
    args = listOf(
        "-script",
        file("script/train_cinema.kts").absolutePath,
        "-classpath",
        sourceSets["main"].runtimeClasspath.asPath
    )
}

tasks.register<JavaExec>("evaluateCinema") {
    group = "ml"
    description = "Evaluate Cinema box office prediction model"
    dependsOn("classes")

    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("org.jetbrains.kotlin.cli.jvm.K2JVMCompiler")
    args = listOf(
        "-script",
        file("script/evaluate_cinema.kts").absolutePath,
        "-classpath",
        sourceSets["main"].runtimeClasspath.asPath
    )
}

// 汎用スクリプト実行タスク
tasks.register<JavaExec>("runScript") {
    group = "ml"
    description = "Run a Kotlin script (use -Pscript=path/to/script.kts)"
    dependsOn("classes")

    val scriptPath = project.findProperty("script") as String? ?: "script/train_iris.kts"

    classpath = sourceSets["main"].runtimeClasspath
    mainClass.set("org.jetbrains.kotlin.cli.jvm.K2JVMCompiler")
    args = listOf(
        "-script",
        file(scriptPath).absolutePath,
        "-classpath",
        sourceSets["main"].runtimeClasspath.asPath
    )
}
