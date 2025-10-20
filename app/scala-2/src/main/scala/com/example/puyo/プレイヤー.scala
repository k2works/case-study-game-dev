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
  private var _着地済み: Boolean = false
  private var 落下タイマー: Double = 0.0
  private val 落下間隔: Double = 1000.0 // 1秒ごとに落下

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
  def 着地した(): Boolean = _着地済み

  def 落下速度を取得(): Double =
    // 下キーが押されていれば高速落下（10倍速）
    if _入力キー下 then 10.0 else 1.0

  // テスト用のセッター
  def ぷよのX座標を設定(x: Int): Unit = _ぷよのX座標 = x
  def ぷよのY座標を設定(y: Int): Unit = _ぷよのY座標 = y
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
  def 新しいぷよを生成できるか(): Boolean =
    // 初期位置にぷよが存在しないかチェック
    ステージ.ぷよを取得(InitialPuyoX, InitialPuyoY) == 0

  def 新しいぷよを作成(): Unit =
    _ぷよのX座標 = InitialPuyoX
    _ぷよのY座標 = InitialPuyoY
    _ぷよの種類 = getRandomPuyoType()
    _nextPuyoType = getRandomPuyoType()
    _回転状態 = 0
    _着地済み = false // 着地フラグをリセット
    落下タイマー = 0.0 // タイマーもリセット

  private def getRandomPuyoType(): Int =
    MinPuyoType + scala.util.Random.nextInt(MaxPuyoType - MinPuyoType + 1)

  def 左に移動(): Unit =
    val nextX = _ぷよのX座標 - 1
    val secondPuyoNextX = nextX + オフセットX(_回転状態)
    val secondPuyoNextY = _ぷよのY座標 + オフセットY(_回転状態)

    // X座標の範囲チェック
    if nextX >= 0 && secondPuyoNextX >= 0 && secondPuyoNextX < 設定情報.ステージ列数 then
      // 既存のぷよとの衝突チェック（範囲内のぷよのみ）
      val 軸ぷよ衝突なし =
        if _ぷよのY座標 >= 0 && _ぷよのY座標 < 設定情報.ステージ行数 then ステージ.ぷよを取得(nextX, _ぷよのY座標) == 0
        else true // 範囲外なら衝突なし

      val 次ぷよ衝突なし =
        if secondPuyoNextY >= 0 && secondPuyoNextY < 設定情報.ステージ行数 then
          ステージ.ぷよを取得(secondPuyoNextX, secondPuyoNextY) == 0
        else true // 範囲外なら衝突なし

      if 軸ぷよ衝突なし && 次ぷよ衝突なし then _ぷよのX座標 = nextX

  def 右に移動(): Unit =
    val nextX = _ぷよのX座標 + 1
    val secondPuyoNextX = nextX + オフセットX(_回転状態)
    val secondPuyoNextY = _ぷよのY座標 + オフセットY(_回転状態)

    // X座標の範囲チェック
    if nextX < 設定情報.ステージ列数 && secondPuyoNextX >= 0 && secondPuyoNextX < 設定情報.ステージ列数 then
      // 既存のぷよとの衝突チェック（範囲内のぷよのみ）
      val 軸ぷよ衝突なし =
        if _ぷよのY座標 >= 0 && _ぷよのY座標 < 設定情報.ステージ行数 then ステージ.ぷよを取得(nextX, _ぷよのY座標) == 0
        else true // 範囲外なら衝突なし

      val 次ぷよ衝突なし =
        if secondPuyoNextY >= 0 && secondPuyoNextY < 設定情報.ステージ行数 then
          ステージ.ぷよを取得(secondPuyoNextX, secondPuyoNextY) == 0
        else true // 範囲外なら衝突なし

      if 軸ぷよ衝突なし && 次ぷよ衝突なし then _ぷよのX座標 = nextX

  def 右に回転(): Unit =
    // 回転前の状態を保存
    val 元の回転状態 = _回転状態

    // 時計回りに回転（0→1→2→3→0）
    _回転状態 = (_回転状態 + 1) % 4

    // 壁キック処理と衝突チェック
    if !回転可能かチェック() then
      // 回転できない場合は元に戻す
      _回転状態 = 元の回転状態

  def 左に回転(): Unit =
    // 回転前の状態を保存
    val 元の回転状態 = _回転状態

    // 反時計回りに回転（0→3→2→1→0）
    _回転状態 = (_回転状態 + 3) % 4

    // 壁キック処理と衝突チェック
    if !回転可能かチェック() then
      // 回転できない場合は元に戻す
      _回転状態 = 元の回転状態

  private def 回転可能かチェック(): Boolean =
    // 2つ目のぷよの位置を計算
    var 軸X = _ぷよのX座標
    val 次X = 軸X + オフセットX(_回転状態)
    val 次Y = _ぷよのY座標 + オフセットY(_回転状態)

    // 壁キック処理
    // 右端で右回転した場合（2つ目のぷよが右にくる場合）
    if 次X >= 設定情報.ステージ列数 then 軸X -= 1 // 左に移動（壁キック）

    // 左端で左回転した場合（2つ目のぷよが左にくる場合）
    if 次X < 0 then 軸X += 1 // 右に移動（壁キック）

    // 壁キック後の位置を再計算
    val キック後の次X = 軸X + オフセットX(_回転状態)

    // X座標の範囲チェック
    if 軸X < 0 || 軸X >= 設定情報.ステージ列数 then return false
    if キック後の次X < 0 || キック後の次X >= 設定情報.ステージ列数 then return false

    // 既存のぷよとの衝突チェック（範囲内のぷよのみ）
    val 軸ぷよ衝突なし =
      if _ぷよのY座標 >= 0 && _ぷよのY座標 < 設定情報.ステージ行数 then ステージ.ぷよを取得(軸X, _ぷよのY座標) == 0
      else true // 範囲外なら衝突なし

    val 次ぷよ衝突なし =
      if 次Y >= 0 && 次Y < 設定情報.ステージ行数 then ステージ.ぷよを取得(キック後の次X, 次Y) == 0
      else true // 範囲外なら衝突なし

    // 回転可能な場合は、壁キック後の位置を適用
    if 軸ぷよ衝突なし && 次ぷよ衝突なし then
      _ぷよのX座標 = 軸X
      true
    else false

  def 描画(): Unit =
    // 軸ぷよを描画
    ステージ.ぷよを描画(_ぷよのX座標, _ぷよのY座標, _ぷよの種類)

    // 2つ目のぷよを描画
    val secondPuyoX = _ぷよのX座標 + オフセットX(_回転状態)
    val secondPuyoY = _ぷよのY座標 + オフセットY(_回転状態)
    ステージ.ぷよを描画(secondPuyoX, secondPuyoY, _nextPuyoType)

  def デルタ時間で更新(デルタ時間: Double): Unit =
    // タイマーを進める（高速落下の速度を反映）
    落下タイマー += デルタ時間 * 落下速度を取得()

    // 落下間隔を超えたら落下処理を実行
    if 落下タイマー >= 落下間隔 then
      重力を適用()
      落下タイマー = 0.0 // タイマーをリセット

    // 既存の update 処理も実行（キー入力処理）
    更新()

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

  private def 重力を適用(): Unit =
    // 下に移動できるかチェック
    if 下に移動できる() then _ぷよのY座標 += 1
    else
      // 着地した場合の処理（後で実装）
      着地時()

  private def 下に移動できる(): Boolean =
    // 2つ目のぷよの位置を計算
    val secondPuyoX = _ぷよのX座標 + オフセットX(_回転状態)
    val secondPuyoY = _ぷよのY座標 + オフセットY(_回転状態)

    // 2つ目のぷよが下向き（offsetY == 1）の場合
    if オフセットY(_回転状態) == 1 then
      // 2つ目のぷよの下端チェック
      if secondPuyoY >= 設定情報.ステージ行数 - 1 then return false
      // 2つ目のぷよの下にぷよがあるかチェック
      if ステージ.ぷよを取得(secondPuyoX, secondPuyoY + 1) > 0 then return false
    else
      // 軸ぷよの下端チェック
      if _ぷよのY座標 >= 設定情報.ステージ行数 - 1 then return false
      // 軸ぷよの下にぷよがあるかチェック
      if ステージ.ぷよを取得(_ぷよのX座標, _ぷよのY座標 + 1) > 0 then return false
      // 2つ目のぷよの下端と衝突チェック
      if secondPuyoY >= 設定情報.ステージ行数 - 1 then return false
      if ステージ.ぷよを取得(secondPuyoX, secondPuyoY + 1) > 0 then return false

    true

  private def 着地時(): Unit =
    // 軸ぷよをステージに固定
    ステージ.ぷよを設定(_ぷよのX座標, _ぷよのY座標, _ぷよの種類)

    // 2つ目のぷよをステージに固定
    val secondPuyoX = _ぷよのX座標 + オフセットX(_回転状態)
    val secondPuyoY = _ぷよのY座標 + オフセットY(_回転状態)
    ステージ.ぷよを設定(secondPuyoX, secondPuyoY, _nextPuyoType)

    // 着地フラグを立てる
    _着地済み = true

    dom.console.log("ぷよが着地しました")
