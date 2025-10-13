package com.example.puyo

import scala.scalajs.js.annotation.JSExportTopLevel
import org.scalajs.dom

@JSExportTopLevel("PuyoPuyoGame")
object Main {
  def main(args: Array[String]): Unit = {
    // ゲームのインスタンスを作成
    val ゲーム = new ゲーム()

    // ゲームを初期化
    ゲーム.初期化()

    // ゲームループを開始（次のタスクで実装）
    // ゲーム.loop()

    dom.console.log("Puyo Puyo ゲーム Started!")
  }
}
