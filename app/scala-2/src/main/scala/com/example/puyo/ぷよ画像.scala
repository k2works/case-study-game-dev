package com.example.puyo

import org.scalajs.dom.CanvasRenderingContext2D
import scala.scalajs.js

class ぷよ画像(設定情報: 設定情報):
  private val 色配列: js.Array[String] = js.Array(
    "#888", // 0: 空
    "#ff0000", // 1: 赤
    "#00ff00", // 2: 緑
    "#0000ff", // 3: 青
    "#ffff00" // 4: 黄色
  )

  def 描画(ctx: CanvasRenderingContext2D, puyoType: Int, x: Int, y: Int): Unit =
    val size = 設定情報.ぷよサイズ
    val color =
      if puyoType >= 0 && puyoType < 色配列.length then 色配列(puyoType)
      else 色配列(0)

    // 円の中心座標と半径を計算
    val centerX = x * size + size / 2.0
    val centerY = y * size + size / 2.0
    val radius = size / 2.0 - 2.0

    // ぷよを円形で描画
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()

    // 枠線を描画
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()
