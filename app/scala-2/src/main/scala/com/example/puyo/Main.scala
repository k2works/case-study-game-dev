package com.example.puyo

import scala.scalajs.js.annotation.JSExportTopLevel
import org.scalajs.dom

@JSExportTopLevel("PuyoPuyoGame")
object Main {
  def main(args: Array[String]): Unit = {
    val ゲーム = new ゲーム()
    ゲーム.初期化()
    ゲーム.loop()

    dom.console.log("Puyo Puyo ゲーム Started!")
  }
}
