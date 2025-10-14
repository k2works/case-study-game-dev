ThisBuild / scalaVersion := "3.3.3"
ThisBuild / version := "0.1.0-SNAPSHOT"
ThisBuild / organization := "com.example"
ThisBuild / organizationName := "puyo-puyo"

// 依存関係の競合を解決
ThisBuild / libraryDependencySchemes ++= Seq(
  "org.scala-lang.modules" %% "scala-xml" % "always"
)

lazy val root = (project in file("."))
  .enablePlugins(ScalaJSPlugin)
  .settings(
    name := "puyo-puyo-game",
    scalaJSUseMainModuleInitializer := false,

    // テストフレームワーク
    libraryDependencies ++= Seq(
      "org.scalatest" %%% "scalatest" % "3.2.18" % Test
    ),

    // Scala.js DOM ライブラリ
    libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "2.8.0",

    // WartRemover 設定
    wartremoverWarnings ++= Warts.unsafe,

    // カバレッジ設定（デフォルトでは無効化）
    coverageEnabled := false,
    coverageMinimumStmtTotal := 80,
    coverageFailOnMinimum := false,
    coverageHighlighting := true
  )

// カスタムタスクの定義
lazy val format = taskKey[Unit]("Format source code")
format := {
  (Compile / scalafmt).value
  (Test / scalafmt).value
}

lazy val formatCheck = taskKey[Unit]("Check source code formatting")
formatCheck := {
  (Compile / scalafmtCheck).value
  (Test / scalafmtCheck).value
}

lazy val lint = taskKey[Unit]("Run static analysis")
lint := {
  (Compile / compile).value
  // Scalastyle は Scala 3 の新しい構文を完全にサポートしていないため無効化
  // WartRemover はコンパイル時に自動実行される
}

lazy val coverage = taskKey[Unit]("Run tests with coverage")
coverage := {
  // カバレッジは別途 sbt "set coverageEnabled := true" coverage test coverageReport で実行
  println("Coverage report is skipped in check task. Run: sbt \"set coverageEnabled := true\" coverage test coverageReport")
}

lazy val check = taskKey[Unit]("Run all quality checks")
check := {
  formatCheck.value
  lint.value
  (Test / test).value
  coverage.value
}
