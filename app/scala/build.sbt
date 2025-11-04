val scala213Version = "2.13.12"
val sparkVersion = "3.5.0"

lazy val root = project
  .in(file("."))
  .settings(
    name := "ml-tdd-scala",
    version := "0.1.0-SNAPSHOT",

    scalaVersion := scala213Version,

    // Scala の設定
    scalacOptions ++= Seq(
      "-encoding", "UTF-8",
      "-feature",
      "-unchecked",
      "-deprecation",
      "-Xfatal-warnings"
    ),

    // 依存ライブラリ
    libraryDependencies ++= Seq(
      // Spark Core と MLlib
      "org.apache.spark" %% "spark-core" % sparkVersion,
      "org.apache.spark" %% "spark-sql" % sparkVersion,
      "org.apache.spark" %% "spark-mllib" % sparkVersion,

      // テストライブラリ
      "org.scalatest" %% "scalatest" % "3.2.17" % Test,

      // Akka HTTP と Circe (第8章で使用)
      "com.typesafe.akka" %% "akka-http" % "10.5.3",
      "com.typesafe.akka" %% "akka-stream" % "2.8.5",
      "io.circe" %% "circe-core" % "0.14.6",
      "io.circe" %% "circe-generic" % "0.14.6",
      "io.circe" %% "circe-parser" % "0.14.6"
    ),

    // Java 17+ でのモジュール制限を回避（runとtestの両方で必要）
    fork := true,
    javaOptions ++= Seq(
      // モジュールアクセス許可
      "--add-exports=java.base/sun.nio.ch=ALL-UNNAMED",
      "--add-opens=java.base/sun.nio.ch=ALL-UNNAMED",
      "--add-opens=java.base/java.nio=ALL-UNNAMED",
      "--add-opens=java.base/java.lang=ALL-UNNAMED",
      "--add-opens=java.base/java.lang.invoke=ALL-UNNAMED",
      "--add-opens=java.base/java.util=ALL-UNNAMED",
      "--add-opens=java.base/java.lang.reflect=ALL-UNNAMED",
      "--add-opens=java.base/java.net=ALL-UNNAMED",
      "--add-opens=java.base/java.io=ALL-UNNAMED",
      "--add-opens=java.base/javax.security.auth.x500=ALL-UNNAMED",

      // Java 23+ セキュリティマネージャー対応
      "-Djava.security.manager=allow"
    ),

    // Spark のログレベルを抑制
    Test / javaOptions ++= Seq(
      "-Dspark.master=local[2]",
      "-Dspark.ui.enabled=false",
      "-Dspark.driver.bindAddress=127.0.0.1"
    )
  )
