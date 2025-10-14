package com.example.puyo

import org.scalajs.dom

enum ゲームモード:
  case 開始, 落下確認, 落下中, 消去確認, 消去中, 新ぷよ, プレイ中, ゲームオーバー

class ゲーム:
  private var _mode: ゲームモード = ゲームモード.開始
  private var フレーム: Int = 0
  private var 連鎖数: Int = 0
  private var 前回の時刻: Double = 0.0
  private var _入力キーEnter: Boolean = false

  var 設定情報: 設定情報 = _
  var ぷよ画像: ぷよ画像 = _
  var ステージ: ステージ = _
  var プレイヤー: プレイヤー = _
  var スコア: スコア = _

  def モード: ゲームモード = _mode

  // テスト用アクセサメソッド
  def モードを設定(newMode: ゲームモード): Unit = _mode = newMode
  def 更新を実行(デルタ時間: Double): Unit = 更新(デルタ時間)

  def 初期化(): Unit =
    // 各コンポーネントの初期化
    設定情報 = new 設定情報()
    ぷよ画像 = new ぷよ画像(設定情報)
    ステージ = new ステージ(設定情報, ぷよ画像)
    プレイヤー = new プレイヤー(設定情報, ステージ, ぷよ画像)
    スコア = new スコア()

    // ゲームモードを設定
    _mode = ゲームモード.新ぷよ

    // 初回時刻を設定（ブラウザ環境のみ）
    try 前回の時刻 = dom.window.performance.now()
    catch
      case _: Throwable => 前回の時刻 = 0.0

      // キーボードイベントの登録
    キーボードイベントを登録()

  private def キーボードイベントを登録(): Unit =
    if scala.scalajs.LinkingInfo.developmentMode || scala.scalajs.LinkingInfo.productionMode then
      try
        dom.document.addEventListener(
          "keydown",
          (e: dom.KeyboardEvent) => if e.key == "Enter" then _入力キーEnter = true
        )
      catch case _: Throwable => ()

  def リスタート(): Unit =
    // ゲーム状態をリセット
    連鎖数 = 0
    フレーム = 0
    _入力キーEnter = false

    // コンポーネントを再初期化
    ステージ = new ステージ(設定情報, ぷよ画像)
    プレイヤー = new プレイヤー(設定情報, ステージ, ぷよ画像)
    スコア.リセット()

    // ゲームオーバー画面を非表示
    ゲームオーバー画面を非表示()

    // ゲームモードを新ぷよに設定
    _mode = ゲームモード.新ぷよ

  private def ゲームオーバー画面を表示(): Unit =
    if scala.scalajs.LinkingInfo.developmentMode || scala.scalajs.LinkingInfo.productionMode then
      try
        val gameOverElement = dom.document.getElementById("game-over")
        val finalScoreElement = dom.document.getElementById("final-score")

        if gameOverElement != null then
          gameOverElement.asInstanceOf[dom.html.Div].style.display = "block"

        if finalScoreElement != null then finalScoreElement.textContent = スコア.現在スコア.toString
      catch case _: Throwable => ()

  private def ゲームオーバー画面を非表示(): Unit =
    if scala.scalajs.LinkingInfo.developmentMode || scala.scalajs.LinkingInfo.productionMode then
      try
        val gameOverElement = dom.document.getElementById("game-over")
        if gameOverElement != null then
          gameOverElement.asInstanceOf[dom.html.Div].style.display = "none"
      catch case _: Throwable => ()

  def ループ(): Unit =
    val 現在時刻 = dom.window.performance.now()
    val デルタ時間 = 現在時刻 - 前回の時刻
    前回の時刻 = 現在時刻

    更新(デルタ時間)
    描画()
    dom.window.requestAnimationFrame(_ => ループ())

  private def 更新(デルタ時間: Double): Unit =
    フレーム += 1

    _mode match
      case ゲームモード.新ぷよ =>
        // 新しいぷよを生成できるかチェック
        if プレイヤー.新しいぷよを生成できるか() then
          プレイヤー.新しいぷよを作成()
          _mode = ゲームモード.プレイ中
        else
          // ゲームオーバー
          dom.console.log("ゲームオーバー")
          _mode = ゲームモード.ゲームオーバー

      case ゲームモード.プレイ中 =>
        プレイヤー.デルタ時間で更新(デルタ時間)

        // 着地したら消去確認に移行
        if プレイヤー.着地した() then _mode = ゲームモード.消去確認

      case ゲームモード.消去確認 =>
        // 消去チェック
        val 消去情報 = ステージ.消去チェック()
        if 消去情報.erasePuyoCount > 0 then
          // 消去対象がある場合
          ステージ.ボードを消去(消去情報.eraseInfo)
          連鎖数 += 1
          dom.console.log(s"連鎖数: $連鎖数, 消去数: ${消去情報.erasePuyoCount}")

          // スコアを記録
          スコア.消去を記録(消去情報.erasePuyoCount, 連鎖数)

          _mode = ゲームモード.落下確認
        else
        // 消去対象がない場合
        if 連鎖数 == 0 then
          // 着地直後で消去なし→落下確認（浮いているぷよを落とす）
          _mode = ゲームモード.落下確認
        else
          // 連鎖後で消去なし→連鎖終了
          dom.console.log(s"連鎖終了: 連鎖数=$連鎖数")
          スコア.連鎖終了()
          連鎖数 = 0
          _mode = ゲームモード.新ぷよ

      case ゲームモード.落下確認 =>
        // 重力を適用
        val hasFallen = ステージ.重力を適用()
        if hasFallen then
          // ぷよが落下した場合、落下中モードへ
          _mode = ゲームモード.落下中
        else
        // 落下するぷよがない場合
        if 連鎖数 == 0 then
          // 着地後の初回落下で落下なし→新ぷよへ
          _mode = ゲームモード.新ぷよ
        else
          // 連鎖中の落下で落下なし→消去確認で最後のチェック
          _mode = ゲームモード.消去確認

      case ゲームモード.落下中 =>
        // 落下アニメーション用（一定フレーム待機）
        // 簡略化のため、すぐに落下確認に戻る（すべてのぷよが落ち切るまで繰り返す）
        _mode = ゲームモード.落下確認

      case ゲームモード.ゲームオーバー =>
        // ゲームオーバー画面を表示
        ゲームオーバー画面を表示()

        // Enterキーが押されたらリスタート
        if _入力キーEnter then
          _入力キーEnter = false
          リスタート()

      case _ => // その他の状態は今後実装
  private def 描画(): Unit =
    ステージ.描画()

    if _mode == ゲームモード.プレイ中 then プレイヤー.描画()
