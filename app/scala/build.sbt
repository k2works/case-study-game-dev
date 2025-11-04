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
      "com.typesafe.akka" %% "akka-http-testkit" % "10.5.3" % Test,
      "io.circe" %% "circe-core" % "0.14.6",
      "io.circe" %% "circe-generic" % "0.14.6",
      "io.circe" %% "circe-parser" % "0.14.6",
      "de.heikoseeberger" %% "akka-http-circe" % "1.39.2",

      // Swagger UI (API ドキュメント)
      "com.github.swagger-akka-http" %% "swagger-akka-http" % "2.11.0",
      "com.github.swagger-akka-http" %% "swagger-scala-module" % "2.11.0",
      "io.swagger.core.v3" % "swagger-core" % "2.2.20",
      "io.swagger.core.v3" % "swagger-annotations" % "2.2.20",
      "io.swagger.core.v3" % "swagger-models" % "2.2.20",

      // Jackson バージョンを Spark 互換の 2.15.x に固定
      "com.fasterxml.jackson.core" % "jackson-databind" % "2.15.3",
      "com.fasterxml.jackson.core" % "jackson-core" % "2.15.3",
      "com.fasterxml.jackson.core" % "jackson-annotations" % "2.15.3",
      "com.fasterxml.jackson.module" %% "jackson-module-scala" % "2.15.3"
    ),

    // Jackson バージョンを強制的に 2.15.3 にオーバーライド
    dependencyOverrides ++= Seq(
      "com.fasterxml.jackson.core" % "jackson-databind" % "2.15.3",
      "com.fasterxml.jackson.core" % "jackson-core" % "2.15.3",
      "com.fasterxml.jackson.core" % "jackson-annotations" % "2.15.3",
      "com.fasterxml.jackson.module" %% "jackson-module-scala" % "2.15.3",
      "com.fasterxml.jackson.dataformat" % "jackson-dataformat-yaml" % "2.15.3",
      "com.fasterxml.jackson.datatype" % "jackson-datatype-jsr310" % "2.15.3"
    ),

    // Java 17+ でのモジュール制限を回避（runとtestの両方で必要）
    fork := true,
    javaOptions ++= Seq(
      // Java 17, 21 用: モジュールアクセス許可
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
      "--add-opens=java.base/javax.security.auth=ALL-UNNAMED",

      // 注意: Java 25 は現在非対応
      // 理由: Hadoop 3.3.4 が Java 25 で削除された Subject.getSubject() に依存
      // 対応予定: Apache Spark 4.0 リリース待ち
      "-DHADOOP_USER_NAME=hadoop",
      "-Duser.name=hadoop"
    ),

    // Spark のログレベルを抑制
    Test / javaOptions ++= Seq(
      "-Dspark.master=local[2]",
      "-Dspark.ui.enabled=false",
      "-Dspark.driver.bindAddress=127.0.0.1",
      "-DHADOOP_USER_NAME=hadoop",
      "-Duser.name=hadoop"
    )
  )
