package com.example.puyo

import org.scalajs.dom
import org.scalajs.dom.{KeyboardEvent, document}

class プレイヤー(
    設定情報: 設定情報,
    ステージ: ステージ,
    ぷよ画像: ぷよ画像
) {
  private val InitialPuyoX = 2
  private val InitialPuyoY = 0
  private val MinPuyoType = 1
  private val MaxPuyoType = 4

  private var _inputKeyLeft: Boolean = false
  private var _inputKeyRight: Boolean = false
  private var _inputKeyUp: Boolean = false
  private var _inputKeyDown: Boolean = false

  private var _ぷよのX座標: Int = InitialPuyoX
  private var _ぷよのY座標: Int = InitialPuyoY
  private var _ぷよの種類: Int = 0
  private var _nextPuyoType: Int = 0
  private var rotation: Int = 0

  // テスト用のアクセサ
  def inputKeyLeft: Boolean = _inputKeyLeft
  def inputKeyRight: Boolean = _inputKeyRight
  def inputKeyUp: Boolean = _inputKeyUp
  def inputKeyDown: Boolean = _inputKeyDown

  def ぷよのX座標: Int = _ぷよのX座標
  def ぷよのY座標: Int = _ぷよのY座標
  def ぷよの種類: Int = _ぷよの種類

  // テスト用のセッター
  def ぷよのX座標を設定(x: Int): Unit = _ぷよのX座標 = x

  // キーボードイベントの登録
  document.addEventListener("keydown", onKeyDown _)
  document.addEventListener("keyup", onKeyUp _)

  private def onKeyDown(e: KeyboardEvent): Unit = {
    setKeyState(e.key, pressed = true)
  }

  private def onKeyUp(e: KeyboardEvent): Unit = {
    setKeyState(e.key, pressed = false)
  }

  // テスト用のメソッド（実装からも呼び出す）
  def setKeyState(key: String, pressed: Boolean): Unit = {
    key match {
      case "ArrowLeft"  => _inputKeyLeft = pressed
      case "ArrowRight" => _inputKeyRight = pressed
      case "ArrowUp"    => _inputKeyUp = pressed
      case "ArrowDown"  => _inputKeyDown = pressed
      case _            => // 何もしない
    }
  }

  def 新しいぷよを作成(): Unit = {
    _ぷよのX座標 = InitialPuyoX
    _ぷよのY座標 = InitialPuyoY
    _ぷよの種類 = getRandomPuyoType()
    _nextPuyoType = getRandomPuyoType()
    rotation = 0
  }

  private def getRandomPuyoType(): Int = {
    MinPuyoType + scala.util.Random.nextInt(MaxPuyoType - MinPuyoType + 1)
  }

  def 左に移動(): Unit = {
    if (_ぷよのX座標 > 0) {
      _ぷよのX座標 -= 1
    }
  }

  def 右に移動(): Unit = {
    if (_ぷよのX座標 < 設定情報.stageCols - 1) {
      _ぷよのX座標 += 1
    }
  }

  def 描画(): Unit = {
    ステージ.drawPuyo(_ぷよのX座標, _ぷよのY座標, _ぷよの種類)
  }

  def 更新(): Unit = {
    // キー入力に応じて移動
    if (_inputKeyLeft) {
      左に移動()
      _inputKeyLeft = false
    }
    if (_inputKeyRight) {
      右に移動()
      _inputKeyRight = false
    }
  }
}
