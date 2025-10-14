package com.example.puyo

import org.scalajs.dom
import org.scalajs.dom.{KeyboardEvent, document}

class プレイヤー(
  設定情報: 設定情報,
  ステージ: ステージ,
  ぷよ画像: ぷよ画像
):
  private val InitialPuyoX = 2
  private val InitialPuyoY = 0
  private val MinPuyoType = 1
  private val MaxPuyoType = 4

  private var _入力キー左: Boolean = false
  private var _入力キー右: Boolean = false
  private var _入力キー上: Boolean = false
  private var _入力キー下: Boolean = false

  private var _ぷよのX座標: Int = InitialPuyoX
  private var _ぷよのY座標: Int = InitialPuyoY
  private var _ぷよの種類: Int = 0
  private var _nextPuyoType: Int = 0
  private var 回転: Int = 0

  // テスト用のアクセサ
  def 入力キー左: Boolean = _入力キー左
  def 入力キー右: Boolean = _入力キー右
  def 入力キー上: Boolean = _入力キー上
  def 入力キー下: Boolean = _入力キー下

  def ぷよのX座標: Int = _ぷよのX座標
  def ぷよのY座標: Int = _ぷよのY座標
  def ぷよの種類: Int = _ぷよの種類

  // テスト用のセッター
  def ぷよのX座標を設定(x: Int): Unit = _ぷよのX座標 = x

  // キーボードイベントの登録（ブラウザ環境でのみ実行）
  if scala.scalajs.LinkingInfo.developmentMode || scala.scalajs.LinkingInfo.productionMode then
    try
      document.addEventListener("keydown", onKeyDown _)
      document.addEventListener("keyup", onKeyUp _)
    catch case _: Throwable => () // テスト環境ではdocumentが存在しない場合がある

  private def onKeyDown(e: KeyboardEvent): Unit =
    キー状態を設定(e.key, pressed = true)

  private def onKeyUp(e: KeyboardEvent): Unit =
    キー状態を設定(e.key, pressed = false)

  // テスト用のメソッド（実装からも呼び出す）
  def キー状態を設定(key: String, pressed: Boolean): Unit =
    key match
      case "ArrowLeft"  => _入力キー左 = pressed
      case "ArrowRight" => _入力キー右 = pressed
      case "ArrowUp"    => _入力キー上 = pressed
      case "ArrowDown"  => _入力キー下 = pressed
      case _            => // 何もしない
  def 新しいぷよを作成(): Unit =
    _ぷよのX座標 = InitialPuyoX
    _ぷよのY座標 = InitialPuyoY
    _ぷよの種類 = getRandomPuyoType()
    _nextPuyoType = getRandomPuyoType()
    回転 = 0

  private def getRandomPuyoType(): Int =
    MinPuyoType + scala.util.Random.nextInt(MaxPuyoType - MinPuyoType + 1)

  def 左に移動(): Unit =
    if _ぷよのX座標 > 0 then _ぷよのX座標 -= 1

  def 右に移動(): Unit =
    if _ぷよのX座標 < 設定情報.ステージ列数 - 1 then _ぷよのX座標 += 1
