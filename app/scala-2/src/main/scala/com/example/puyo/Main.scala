package com.example.puyo

import org.scalajs.dom
import org.scalajs.dom.{document, window, html, CanvasRenderingContext2D}
import scala.scalajs.js.timers._
import scala.util.Random

object Main {
  def main(args: Array[String]): Unit = {
    window.addEventListener("load", { (_: dom.Event) =>
      setupGame()
    })
  }

  def setupGame(): Unit = {
    val canvas = document.getElementById("stage").asInstanceOf[html.Canvas]
    val game = new ゲーム(canvas)
    game.初期化()
    game.開始()
  }
}

class ゲーム(canvas: html.Canvas) {
  private val 設定情報 = new 設定情報()
  private val ぷよ画像 = new ぷよ画像(設定情報)
  private val ステージ = new ステージ(設定情報, ぷよ画像, canvas)
  private val プレイヤー = new プレイヤー(設定情報, ステージ, ぷよ画像)
  private var dropTimer: Option[SetIntervalHandle] = None

  def 初期化(): Unit = {
    canvas.width = 設定情報.stageCols * 設定情報.cellSize
    canvas.height = 設定情報.stageRows * 設定情報.cellSize

    window.addEventListener("keydown", { (e: dom.KeyboardEvent) =>
      プレイヤー.setKeyState(e.key, pressed = true)
      更新()
      描画()
      e.preventDefault()
    })

    プレイヤー.新しいぷよを作成()
  }

  def 開始(): Unit = {
    dropTimer = Some(setInterval(1000) {
      プレイヤー.自動落下()
      描画()
    })
    描画()
  }

  private def 更新(): Unit = {
    プレイヤー.更新()
  }

  private def 描画(): Unit = {
    ステージ.描画()
    プレイヤー.描画()
  }
}

class 設定情報 {
  val stageCols: Int = 6
  val stageRows: Int = 12
  val cellSize: Int = 32
}

class ぷよ画像(設定情報: 設定情報) {
  def drawPuyo(ctx: CanvasRenderingContext2D, x: Int, y: Int, puyoType: Int): Unit = {
    val centerX = x * 設定情報.cellSize + 設定情報.cellSize / 2.0
    val centerY = y * 設定情報.cellSize + 設定情報.cellSize / 2.0
    val radius = 設定情報.cellSize / 2.5

    val color = puyoType match {
      case 1 => "#ff0000" // 赤
      case 2 => "#0000ff" // 青
      case 3 => "#00ff00" // 緑
      case 4 => "#ffff00" // 黄
      case _ => "#ffffff" // 空
    }

    if (puyoType > 0) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * math.Pi)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = "#333333"
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
}

class ステージ(設定情報: 設定情報, ぷよ画像: ぷよ画像, canvas: html.Canvas) {
  private val ctx: CanvasRenderingContext2D =
    canvas.getContext("2d").asInstanceOf[CanvasRenderingContext2D]
  private val data: Array[Array[Int]] =
    Array.fill(設定情報.stageRows, 設定情報.stageCols)(0)

  def getPuyo(x: Int, y: Int): Int = {
    if (x >= 0 && x < 設定情報.stageCols && y >= 0 && y < 設定情報.stageRows) {
      data(y)(x)
    } else {
      -1
    }
  }

  def setPuyo(x: Int, y: Int, puyoType: Int): Unit = {
    if (x >= 0 && x < 設定情報.stageCols && y >= 0 && y < 設定情報.stageRows) {
      data(y)(x) = puyoType
    }
  }

  def 描画(): Unit = {
    // 背景クリア
    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // グリッド描画
    for {
      y <- 0 until 設定情報.stageRows
      x <- 0 until 設定情報.stageCols
    } {
      ctx.strokeStyle = "#dddddd"
      ctx.strokeRect(
        x * 設定情報.cellSize,
        y * 設定情報.cellSize,
        設定情報.cellSize,
        設定情報.cellSize
      )

      val puyoType = getPuyo(x, y)
      if (puyoType > 0) {
        ぷよ画像.drawPuyo(ctx, x, y, puyoType)
      }
    }
  }

  def drawPuyo(x: Int, y: Int, puyoType: Int): Unit = {
    ぷよ画像.drawPuyo(ctx, x, y, puyoType)
  }
}

class プレイヤー(
    設定情報: 設定情報,
    ステージ: ステージ,
    ぷよ画像: ぷよ画像
) {
  private val InitialPuyoX = 2
  private val InitialPuyoY = 0
  private val MinPuyoType = 1
  private val MaxPuyoType = 4

  private val offsetX: Array[Int] = Array(0, 1, 0, -1)
  private val offsetY: Array[Int] = Array(-1, 0, 1, 0)

  private var _inputKeyLeft: Boolean = false
  private var _inputKeyRight: Boolean = false
  private var _inputKeyUp: Boolean = false

  private var _ぷよのX座標: Int = InitialPuyoX
  private var _ぷよのY座標: Int = InitialPuyoY
  private var _ぷよの種類: Int = 0
  private var _nextPuyoType: Int = 0
  private var _回転状態: Int = 0

  def setKeyState(key: String, pressed: Boolean): Unit = {
    key match {
      case "ArrowLeft"  => _inputKeyLeft = pressed
      case "ArrowRight" => _inputKeyRight = pressed
      case "ArrowUp"    => _inputKeyUp = pressed
      case _            =>
    }
  }

  def 新しいぷよを作成(): Unit = {
    _ぷよのX座標 = InitialPuyoX
    _ぷよのY座標 = InitialPuyoY
    _ぷよの種類 = getRandomPuyoType()
    _nextPuyoType = getRandomPuyoType()
    _回転状態 = 0
  }

  private def getRandomPuyoType(): Int = {
    MinPuyoType + Random.nextInt(MaxPuyoType - MinPuyoType + 1)
  }

  private def get2つ目のぷよのX座標(): Int = {
    _ぷよのX座標 + offsetX(_回転状態)
  }

  private def get2つ目のぷよのY座標(): Int = {
    _ぷよのY座標 + offsetY(_回転状態)
  }

  def 右に回転(): Unit = {
    _回転状態 = (_回転状態 + 1) % 4
    performWallKick()
  }

  private def performWallKick(): Unit = {
    val x2 = get2つ目のぷよのX座標()
    if (x2 < 0) {
      _ぷよのX座標 += 1
    } else if (x2 >= 設定情報.stageCols) {
      _ぷよのX座標 -= 1
    }
  }

  def 左に移動(): Unit = {
    if (_ぷよのX座標 > 0) {
      _ぷよのX座標 -= 1
      if (!is2つ目のぷよが範囲内()) {
        _ぷよのX座標 += 1
      }
    }
  }

  def 右に移動(): Unit = {
    if (_ぷよのX座標 < 設定情報.stageCols - 1) {
      _ぷよのX座標 += 1
      if (!is2つ目のぷよが範囲内()) {
        _ぷよのX座標 -= 1
      }
    }
  }

  private def is2つ目のぷよが範囲内(): Boolean = {
    val x2 = get2つ目のぷよのX座標()
    val y2 = get2つ目のぷよのY座標()
    x2 >= 0 && x2 < 設定情報.stageCols && y2 >= 0 && y2 < 設定情報.stageRows
  }

  def 自動落下(): Unit = {
    if (下に移動できる()) {
      _ぷよのY座標 += 1
    } else {
      着地処理()
    }
  }

  private def 下に移動できる(): Boolean = {
    if (_ぷよのY座標 >= 設定情報.stageRows - 1) {
      return false
    }

    val secondPuyoX = _ぷよのX座標 + offsetX(_回転状態)
    val secondPuyoY = _ぷよのY座標 + offsetY(_回転状態)

    if (ステージ.getPuyo(_ぷよのX座標, _ぷよのY座標 + 1) > 0) {
      return false
    }

    if (offsetY(_回転状態) != 1) {
      if (secondPuyoY >= 設定情報.stageRows - 1) {
        return false
      }
      if (ステージ.getPuyo(secondPuyoX, secondPuyoY + 1) > 0) {
        return false
      }
    }

    true
  }

  private def 着地処理(): Unit = {
    ステージ.setPuyo(_ぷよのX座標, _ぷよのY座標, _ぷよの種類)
    val secondPuyoX = _ぷよのX座標 + offsetX(_回転状態)
    val secondPuyoY = _ぷよのY座標 + offsetY(_回転状態)
    ステージ.setPuyo(secondPuyoX, secondPuyoY, _nextPuyoType)

    dom.console.log("ぷよが着地しました")
    新しいぷよを作成()
  }

  def 描画(): Unit = {
    ステージ.drawPuyo(_ぷよのX座標, _ぷよのY座標, _ぷよの種類)
    ステージ.drawPuyo(get2つ目のぷよのX座標(), get2つ目のぷよのY座標(), _nextPuyoType)
  }

  def 更新(): Unit = {
    if (_inputKeyLeft) {
      左に移動()
      _inputKeyLeft = false
    }
    if (_inputKeyRight) {
      右に移動()
      _inputKeyRight = false
    }
    if (_inputKeyUp) {
      右に回転()
      _inputKeyUp = false
    }
  }
}
