package com.example.puyo

import org.scalajs.dom
import org.scalajs.dom.{CanvasRenderingContext2D, HTMLCanvasElement, document}
import scala.scalajs.js

class ステージ(設定情報: 設定情報, ぷよ画像: ぷよ画像) {
  private var canvas: HTMLCanvasElement = _
  private var ctx: Option[CanvasRenderingContext2D] = None
  private var field: Array[Array[Int]] = _

  // テスト環境ではdocumentが存在しないため、条件付き初期化
  if (isDocumentAvailable) {
    initializeCanvas()
  }
  initializeField()

  private def isDocumentAvailable: Boolean = {
    !js.isUndefined(js.Dynamic.global.selectDynamic("document"))
  }

  private def initializeCanvas(): Unit = {
    canvas = document.createElement("canvas").asInstanceOf[HTMLCanvasElement]
    canvas.width = 設定情報.stageCols * 設定情報.puyoSize
    canvas.height = 設定情報.stageRows * 設定情報.puyoSize
    canvas.style.border = s"2px solid ${設定情報.stageBorderColor}"
    canvas.style.backgroundColor = 設定情報.stageBackgroundColor

    val stageElement = document.getElementById("ステージ")
    if (stageElement != null) {
      stageElement.appendChild(canvas)
    }

    // 描画コンテキストを取得
    val context = canvas.getContext("2d")
    if (context != null) {
      ctx = Some(context.asInstanceOf[CanvasRenderingContext2D])
    }
  }

  private def initializeField(): Unit = {
    field = Array.fill(設定情報.stageRows, 設定情報.stageCols)(0)
  }

  def 描画(): Unit = {
    ctx.foreach { context =>
      // キャンバスをクリア
      context.clearRect(0, 0, canvas.width, canvas.height)

      // フィールドのぷよを描画
      for {
        y <- 0 until 設定情報.stageRows
        x <- 0 until 設定情報.stageCols
        puyoType = field(y)(x)
        if puyoType > 0
      } {
        ぷよ画像.描画(context, puyoType, x, y)
      }
    }
  }

  def drawPuyo(x: Int, y: Int, puyoType: Int): Unit = {
    ctx.foreach { context =>
      ぷよ画像.描画(context, puyoType, x, y)
    }
  }

  def setPuyo(x: Int, y: Int, puyoType: Int): Unit = {
    if (y >= 0 && y < 設定情報.stageRows && x >= 0 && x < 設定情報.stageCols) {
      field(y)(x) = puyoType
    }
  }

  def getPuyo(x: Int, y: Int): Int = {
    if (y < 0 || y >= 設定情報.stageRows || x < 0 || x >= 設定情報.stageCols) {
      -1 // 範囲外
    } else {
      field(y)(x)
    }
  }
}
