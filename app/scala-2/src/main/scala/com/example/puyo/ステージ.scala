package com.example.puyo

import org.scalajs.dom
import org.scalajs.dom.{CanvasRenderingContext2D, HTMLCanvasElement, document}

class ステージ(設定情報: 設定情報, ぷよ画像: ぷよ画像):
  private var キャンバス: HTMLCanvasElement = _
  private var コンテキスト: Option[CanvasRenderingContext2D] = None
  private var フィールド: Array[Array[Int]] = _

  initializeCanvas()
  initializeField()

  private def initializeCanvas(): Unit =
    // ブラウザ環境でのみCanvasを初期化
    if scala.scalajs.LinkingInfo.developmentMode || scala.scalajs.LinkingInfo.productionMode then
      try
        キャンバス = document.createElement("canvas").asInstanceOf[HTMLCanvasElement]
        キャンバス.width = 設定情報.ステージ列数 * 設定情報.ぷよサイズ
        キャンバス.height = 設定情報.ステージ行数 * 設定情報.ぷよサイズ
        キャンバス.style.border = s"2px solid ${設定情報.ステージ枠線色}"
        キャンバス.style.backgroundColor = 設定情報.ステージ背景色

        val stageElement = document.getElementById("ステージ")
        if stageElement != null then stageElement.appendChild(キャンバス)

        // 描画コンテキストを取得
        val context = キャンバス.getContext("2d")
        if context != null then コンテキスト = Some(context.asInstanceOf[CanvasRenderingContext2D])
      catch case _: Throwable => () // テスト環境ではdocumentが存在しない場合がある

  private def initializeField(): Unit =
    フィールド = Array.fill(設定情報.ステージ行数, 設定情報.ステージ列数)(0)

  def 描画(): Unit =
    コンテキスト.foreach { context =>
      // キャンバスをクリア
      context.clearRect(0, 0, キャンバス.width, キャンバス.height)

      // フィールドのぷよを描画
      for
        y <- 0 until 設定情報.ステージ行数
        x <- 0 until 設定情報.ステージ列数
        puyoType = フィールド(y)(x)
        if puyoType > 0
      do ぷよ画像.描画(context, puyoType, x, y)
    }

  def ぷよを描画(x: Int, y: Int, puyoType: Int): Unit =
    コンテキスト.foreach { context =>
      ぷよ画像.描画(context, puyoType, x, y)
    }

  def ぷよを設定(x: Int, y: Int, puyoType: Int): Unit =
    if y >= 0 && y < 設定情報.ステージ行数 && x >= 0 && x < 設定情報.ステージ列数 then フィールド(y)(x) = puyoType

  def ぷよを取得(x: Int, y: Int): Int =
    if y < 0 || y >= 設定情報.ステージ行数 || x < 0 || x >= 設定情報.ステージ列数 then -1 // 範囲外
    else フィールド(y)(x)
