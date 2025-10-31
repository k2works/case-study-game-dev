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

    // データ処理
    implementation("com.github.holgerbrandl:krangl:0.18.4")

    // Web API
    implementation("io.ktor:ktor-server-core:2.3.7")
    implementation("io.ktor:ktor-server-netty:2.3.7")
    implementation("io.ktor:ktor-server-content-negotiation:2.3.7")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.7")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")

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
