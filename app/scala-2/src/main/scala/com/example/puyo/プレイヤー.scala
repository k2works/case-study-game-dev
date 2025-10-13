package com.example.puyo

import org.scalajs.dom
import org.scalajs.dom.{KeyboardEvent, document}
import scala.scalajs.js

class プレイヤー(
    設定情報: 設定情報,
    ステージ: ステージ,
    ぷよ画像: ぷよ画像
) {
  private val InitialPuyoX = 2
  private val InitialPuyoY = 0
  private val MinPuyoType = 1
  private val MaxPuyoType = 4

  // 回転状態に応じた2つ目のぷよの相対位置
  private val offsetX: Array[Int] = Array(0, 1, 0, -1)
  private val offsetY: Array[Int] = Array(-1, 0, 1, 0)

  private var _inputKeyLeft: Boolean = false
  private var _inputKeyRight: Boolean = false
  private var _inputKeyUp: Boolean = false
  private var _inputKeyDown: Boolean = false

  private var _ぷよのX座標: Int = InitialPuyoX
  private var _ぷよのY座標: Int = InitialPuyoY
  private var _ぷよの種類: Int = 0
  private var _nextPuyoType: Int = 0
  private var _回転状態: Int = 0
  private var dropTimer: Double = 0.0
  private val dropInterval: Double = 1000.0  // 1秒ごとに落下
  private var _着地済み: Boolean = false

  // テスト用のアクセサ
  def inputKeyLeft: Boolean = _inputKeyLeft
  def inputKeyRight: Boolean = _inputKeyRight
  def inputKeyUp: Boolean = _inputKeyUp
  def inputKeyDown: Boolean = _inputKeyDown

  def ぷよのX座標: Int = _ぷよのX座標
  def ぷよのY座標: Int = _ぷよのY座標
  def ぷよの種類: Int = _ぷよの種類
  def 回転状態: Int = _回転状態
  def 着地した(): Boolean = _着地済み

  // テスト用のセッター
  def ぷよのX座標を設定(x: Int): Unit = _ぷよのX座標 = x
  def ぷよのY座標を設定(y: Int): Unit = _ぷよのY座標 = y
  def 回転状態を設定(r: Int): Unit = _回転状態 = r

  // キーボードイベントの登録（テスト環境ではdocumentが存在しない場合がある）
  if (isDocumentAvailable) {
    document.addEventListener("keydown", onKeyDown _)
    document.addEventListener("keyup", onKeyUp _)
  }

  private def isDocumentAvailable: Boolean = {
    !js.isUndefined(js.Dynamic.global.selectDynamic("document"))
  }

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
    _回転状態 = 0
    _着地済み = false  // 着地フラグをリセット
    dropTimer = 0.0  // タイマーもリセット
  }

  private def getRandomPuyoType(): Int = {
    MinPuyoType + scala.util.Random.nextInt(MaxPuyoType - MinPuyoType + 1)
  }

  // 2つ目のぷよのX座標を計算
  private def get2つ目のぷよのX座標(): Int = {
    _ぷよのX座標 + offsetX(_回転状態)
  }

  // 2つ目のぷよのY座標を計算
  private def get2つ目のぷよのY座標(): Int = {
    _ぷよのY座標 + offsetY(_回転状態)
  }

  // 2つ目のぷよが壁の外に出ないかチェック
  private def is2つ目のぷよが範囲内(): Boolean = {
    val x2 = get2つ目のぷよのX座標()
    val y2 = get2つ目のぷよのY座標()
    x2 >= 0 && x2 < 設定情報.stageCols && y2 >= 0 && y2 < 設定情報.stageRows
  }

  // 壁キック処理
  private def performWallKick(): Unit = {
    if (!is2つ目のぷよが範囲内()) {
      // 左右の壁キック
      val x2 = get2つ目のぷよのX座標()
      if (x2 < 0) {
        _ぷよのX座標 += 1
      } else if (x2 >= 設定情報.stageCols) {
        _ぷよのX座標 -= 1
      }
    }
  }

  def 右に回転(): Unit = {
    _回転状態 = (_回転状態 + 1) % 4
    performWallKick()
  }

  def 左に回転(): Unit = {
    _回転状態 = (_回転状態 + 3) % 4 // +3は-1と同じ（mod 4）
    performWallKick()
  }

  def 左に移動(): Unit = {
    if (_ぷよのX座標 > 0) {
      _ぷよのX座標 -= 1
      // 2つ目のぷよが範囲外なら移動を取り消す
      if (!is2つ目のぷよが範囲内()) {
        _ぷよのX座標 += 1
      }
    }
  }

  def 右に移動(): Unit = {
    if (_ぷよのX座標 < 設定情報.stageCols - 1) {
      _ぷよのX座標 += 1
      // 2つ目のぷよが範囲外なら移動を取り消す
      if (!is2つ目のぷよが範囲内()) {
        _ぷよのX座標 -= 1
      }
    }
  }

  def 描画(): Unit = {
    // 1つ目のぷよを描画
    ステージ.drawPuyo(_ぷよのX座標, _ぷよのY座標, _ぷよの種類)
    // 2つ目のぷよを描画
    ステージ.drawPuyo(get2つ目のぷよのX座標(), get2つ目のぷよのY座標(), _nextPuyoType)
  }

  def 更新(): Unit = {
    // キー入力に応じて移動と回転
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

  // イテレーション4: デルタ時間で更新
  def デルタ時間で更新(デルタ時間: Double): Unit = {
    // タイマーを進める
    dropTimer += デルタ時間

    // 落下間隔を超えたら落下処理を実行
    if (dropTimer >= dropInterval) {
      重力を適用()
      dropTimer = 0.0  // タイマーをリセット
    }

    // 既存の update 処理も実行（キー入力処理）
    更新()
  }

  private def 重力を適用(): Unit = {
    // 下に移動できるかチェック
    if (下に移動できる()) {
      _ぷよのY座標 += 1
    } else {
      // 着地した場合の処理
      着地処理()
    }
  }

  private def 下に移動できる(): Boolean = {
    // 下端チェック
    if (_ぷよのY座標 >= 設定情報.stageRows - 1) {
      return false
    }

    // 2つ目のぷよの位置を計算
    val secondPuyoX = _ぷよのX座標 + offsetX(_回転状態)
    val secondPuyoY = _ぷよのY座標 + offsetY(_回転状態)

    // 軸ぷよの下にぷよがあるかチェック
    if (ステージ.getPuyo(_ぷよのX座標, _ぷよのY座標 + 1) > 0) {
      return false
    }

    // 2つ目のぷよの下にぷよがあるかチェック
    // ただし、2つ目のぷよが下向き（rotation == 2）の場合はスキップ
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
    // 軸ぷよをステージに固定
    ステージ.setPuyo(_ぷよのX座標, _ぷよのY座標, _ぷよの種類)

    // 2つ目のぷよをステージに固定
    val secondPuyoX = _ぷよのX座標 + offsetX(_回転状態)
    val secondPuyoY = _ぷよのY座標 + offsetY(_回転状態)
    ステージ.setPuyo(secondPuyoX, secondPuyoY, _nextPuyoType)

    // 着地フラグを立てる
    _着地済み = true

    dom.console.log("ぷよが着地しました")
  }
}
