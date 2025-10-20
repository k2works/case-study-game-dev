package com.example.puyo

import org.scalajs.dom
import org.scalajs.dom.{CanvasRenderingContext2D, HTMLCanvasElement, document}
import scala.collection.mutable.ArrayBuffer

case class 消去情報(
  erasePuyoCount: Int,
  eraseInfo: Array[ぷよの位置]
)

case class ぷよの位置(x: Int, y: Int, puyoType: Int)

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

  def 消去チェック(): 消去情報 =
    // 消去情報
    val erasePositions = ArrayBuffer[ぷよの位置]()

    // 一時的なチェック用ボード
    val checked = Array.fill(設定情報.ステージ行数, 設定情報.ステージ列数)(false)

    // 全マスをチェック
    for
      y <- 0 until 設定情報.ステージ行数
      x <- 0 until 設定情報.ステージ列数
    do
      // ぷよがあり、まだチェックしていない場合
      if フィールド(y)(x) != 0 && !checked(y)(x) then
        // 接続しているぷよを探索
        val puyoType = フィールド(y)(x)
        val connected = ArrayBuffer[ぷよの位置]()
        searchConnectedPuyo(x, y, puyoType, checked, connected)

        // 4つ以上つながっている場合は消去対象
        if connected.length >= 4 then
          connected.foreach { puyo =>
            erasePositions += ぷよの位置(puyo.x, puyo.y, puyoType)
          }

    消去情報(erasePositions.length, erasePositions.toArray)

  private def searchConnectedPuyo(
    startX: Int,
    startY: Int,
    puyoType: Int,
    checked: Array[Array[Boolean]],
    connected: ArrayBuffer[ぷよの位置]
  ): Unit =
    // 探索済みにする
    checked(startY)(startX) = true
    connected += ぷよの位置(startX, startY, puyoType)

    // 4方向を探索
    val directions = Array(
      (1, 0), // 右
      (-1, 0), // 左
      (0, 1), // 下
      (0, -1) // 上
    )

    directions.foreach { case (dx, dy) =>
      val nextX = startX + dx
      val nextY = startY + dy

      // ボード内かつ同じ色のぷよがあり、まだチェックしていない場合
      if nextX >= 0 && nextX < 設定情報.ステージ列数 &&
        nextY >= 0 && nextY < 設定情報.ステージ行数 &&
        フィールド(nextY)(nextX) == puyoType &&
        !checked(nextY)(nextX)
      then
        // 再帰的に探索
        searchConnectedPuyo(nextX, nextY, puyoType, checked, connected)
    }

  def ボードを消去(eraseInfo: Array[ぷよの位置]): Unit =
    // 消去対象のぷよを消去
    eraseInfo.foreach { info =>
      フィールド(info.y)(info.x) = 0
    }

  def 落下(): Unit =
    // 下から上に向かって処理
    for y <- 設定情報.ステージ行数 - 2 to 0 by -1 do
      for x <- 0 until 設定情報.ステージ列数 do
        if フィールド(y)(x) != 0 then
          // 現在のぷよの下が空いている場合、落下させる
          var fallY = y
          while fallY + 1 < 設定情報.ステージ行数 && フィールド(fallY + 1)(x) == 0 do
            フィールド(fallY + 1)(x) = フィールド(fallY)(x)
            フィールド(fallY)(x) = 0
            fallY += 1

  def 重力を適用(): Boolean =
    // フィールドのコピーを作成（移動前の状態を保存）
    val originalField = フィールド.map(_.clone())

    var hasFallen = false

    // 下から上に向かって各列をスキャン（列ごとに処理）
    for x <- 0 until 設定情報.ステージ列数 do
      for y <- 設定情報.ステージ行数 - 2 to 0 by -1 do
        val puyoType = originalField(y)(x)
        if puyoType > 0 then
          // 元のフィールドで下に空きがあるかチェック
          if originalField(y + 1)(x) == 0 then
            // 1マス下に移動
            フィールド(y + 1)(x) = puyoType
            フィールド(y)(x) = 0
            hasFallen = true

    hasFallen
