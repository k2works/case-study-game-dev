package com.example.puyo

import org.scalajs.dom

enum ゲームモード:
  case 開始, 落下確認, 落下中, 消去確認, 消去中, 新ぷよ, プレイ中, ゲームオーバー

class ゲーム:
  private var _mode: ゲームモード = ゲームモード.開始
  private var フレーム: Int = 0
  private var 連鎖数: Int = 0
  private var 前回の時刻: Double = 0.0

  var 設定情報: 設定情報 = _
  var ぷよ画像: ぷよ画像 = _
  var ステージ: ステージ = _
  var プレイヤー: プレイヤー = _
  var スコア: スコア = _

  def モード: ゲームモード = _mode

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
    catch case _: Throwable => 前回の時刻 = 0.0

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
        プレイヤー.新しいぷよを作成()
        _mode = ゲームモード.プレイ中

      case ゲームモード.プレイ中 =>
        プレイヤー.デルタ時間で更新(デルタ時間)

        // 着地したら落下確認に移行
        if プレイヤー.着地した() then _mode = ゲームモード.落下確認

      case ゲームモード.落下確認 =>
        // 重力を適用（現時点ではスタブ）
        val hasFallen = false // TODO: ステージ.重力を適用()
        if hasFallen then
          // ぷよが落下した場合、落下中モードへ
          _mode = ゲームモード.落下中
        else
          // 落下するぷよがない場合、次のぷよを出す
          _mode = ゲームモード.新ぷよ

      case ゲームモード.落下中 =>
        // 落下アニメーション用（一定フレーム待機）
        // 簡略化のため、すぐに落下確認に戻る
        _mode = ゲームモード.落下確認

      case _ => // その他の状態は今後実装
  private def 描画(): Unit =
    ステージ.描画()

    if _mode == ゲームモード.プレイ中 then プレイヤー.描画()
