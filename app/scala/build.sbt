val scala3Version = "3.3.1"
val sparkVersion = "3.5.0"

lazy val root = project
  .in(file("."))
  .settings(
    name := "ml-tdd-scala",
    version := "0.1.0-SNAPSHOT",

    scalaVersion := scala3Version,

    // Scala 3 の設定
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
    ).map(_.cross(CrossVersion.for3Use2_13)),

    // Spark のログレベルを抑制
    Test / fork := true,
    Test / javaOptions += "-Dspark.master=local[2]",
    Test / javaOptions += "-Dspark.ui.enabled=false",
    Test / javaOptions += "-Dspark.driver.bindAddress=127.0.0.1"
  )
