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
  private var _回転状態: Int = 0

  // 2つ目のぷよのオフセット（回転状態に応じた相対位置）
  private val オフセットX: Array[Int] = Array(0, 1, 0, -1) // 上、右、下、左のX方向オフセット
  private val オフセットY: Array[Int] = Array(-1, 0, 1, 0) // 上、右、下、左のY方向オフセット

  // テスト用のアクセサ
  def 入力キー左: Boolean = _入力キー左
  def 入力キー右: Boolean = _入力キー右
  def 入力キー上: Boolean = _入力キー上
  def 入力キー下: Boolean = _入力キー下

  def ぷよのX座標: Int = _ぷよのX座標
  def ぷよのY座標: Int = _ぷよのY座標
  def ぷよの種類: Int = _ぷよの種類
  def 回転状態: Int = _回転状態

  // テスト用のセッター
  def ぷよのX座標を設定(x: Int): Unit = _ぷよのX座標 = x
  def 回転状態を設定(r: Int): Unit = _回転状態 = r

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
    _回転状態 = 0

  private def getRandomPuyoType(): Int =
    MinPuyoType + scala.util.Random.nextInt(MaxPuyoType - MinPuyoType + 1)

  def 左に移動(): Unit =
    val nextX = _ぷよのX座標 - 1
    val secondPuyoNextX = nextX + オフセットX(_回転状態)

    // 軸ぷよと2つ目のぷよが範囲内かチェック
    if nextX >= 0 && secondPuyoNextX >= 0 && secondPuyoNextX < 設定情報.ステージ列数 then _ぷよのX座標 = nextX

  def 右に移動(): Unit =
    val nextX = _ぷよのX座標 + 1
    val secondPuyoNextX = nextX + オフセットX(_回転状態)

    // 軸ぷよと2つ目のぷよが範囲内かチェック
    if nextX < 設定情報.ステージ列数 && secondPuyoNextX >= 0 && secondPuyoNextX < 設定情報.ステージ列数 then
      _ぷよのX座標 = nextX

  def 右に回転(): Unit =
    // 時計回りに回転（0→1→2→3→0）
    _回転状態 = (_回転状態 + 1) % 4

    // 壁キック処理
    壁キック処理()

  def 左に回転(): Unit =
    // 反時計回りに回転（0→3→2→1→0）
    _回転状態 = (_回転状態 + 3) % 4

    // 壁キック処理
    壁キック処理()

  private def 壁キック処理(): Unit =
    // 2つ目のぷよの位置を計算
    val nextX = _ぷよのX座標 + オフセットX(_回転状態)

    // 右端で右回転した場合（2つ目のぷよが右にくる場合）
    if nextX >= 設定情報.ステージ列数 then _ぷよのX座標 -= 1 // 左に移動（壁キック）

    // 左端で左回転した場合（2つ目のぷよが左にくる場合）
    if nextX < 0 then _ぷよのX座標 += 1 // 右に移動（壁キック）

  def 描画(): Unit =
    // 軸ぷよを描画
    ステージ.ぷよを描画(_ぷよのX座標, _ぷよのY座標, _ぷよの種類)

    // 2つ目のぷよを描画
    val secondPuyoX = _ぷよのX座標 + オフセットX(_回転状態)
    val secondPuyoY = _ぷよのY座標 + オフセットY(_回転状態)
    ステージ.ぷよを描画(secondPuyoX, secondPuyoY, _nextPuyoType)

  def 更新(): Unit =
    // キー入力に応じて移動
    if _入力キー左 then
      左に移動()
      _入力キー左 = false
    if _入力キー右 then
      右に移動()
      _入力キー右 = false
    // キー入力に応じて回転
    if _入力キー上 then
      右に回転()
      _入力キー上 = false
