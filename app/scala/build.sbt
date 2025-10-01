name := "puyo-scala"

scalaVersion := "2.13.12"

enablePlugins(ScalaJSPlugin)

// Scala.js settings
scalaJSUseMainModuleInitializer := true

// Dependencies
libraryDependencies ++= Seq(
  "org.scala-js" %%% "scalajs-dom" % "2.8.0",
  "org.scalatest" %%% "scalatest" % "3.2.17" % Test
)

// Output settings
Compile / fastLinkJS / scalaJSLinkerOutputDirectory := baseDirectory.value / "public" / "js"
Compile / fullLinkJS / scalaJSLinkerOutputDirectory := baseDirectory.value / "public" / "js"
