ThisBuild / scalaVersion := "3.3.3"
ThisBuild / version := "0.1.0-SNAPSHOT"
ThisBuild / organization := "com.example"

lazy val root = (project in file("."))
  .enablePlugins(ScalaJSPlugin)
  .settings(
    name := "puyo-puyo-game",
    scalaJSUseMainModuleInitializer := true,

    libraryDependencies ++= Seq(
      "org.scala-js" %%% "scalajs-dom" % "2.8.0",
      "org.scalatest" %%% "scalatest" % "3.2.18" % Test
    )
  )
