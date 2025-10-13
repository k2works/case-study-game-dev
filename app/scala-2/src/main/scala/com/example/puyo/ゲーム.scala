package com.example.puyo

import org.scalajs.dom

enum ゲームモード:
  case Start, CheckFall, Fall, CheckErase, Erasing, NewPuyo, Playing, GameOver

class ゲーム {
  private var _mode: ゲームモード = ゲームモード.Start
  private var フレーム: Int = 0
  private var 連鎖数: Int = 0

  var 設定情報: 設定情報 = _
  var ぷよ画像: ぷよ画像 = _
  var ステージ: ステージ = _
  var プレイヤー: プレイヤー = _
  var スコア: スコア = _

  def モード: ゲームモード = _mode

  def 初期化(): Unit = {
    // 各コンポーネントの初期化
    設定情報 = new 設定情報()
    ぷよ画像 = new ぷよ画像(設定情報)
    ステージ = new ステージ(設定情報, ぷよ画像)
    プレイヤー = new プレイヤー(設定情報, ステージ, ぷよ画像)
    スコア = new スコア()

    // ゲームモードを設定
    _mode = ゲームモード.NewPuyo
  }

  def loop(): Unit = {
    更新()
    描画()
    dom.window.requestAnimationFrame(_ => loop())
  }

  private def 更新(): Unit = {
    フレーム += 1

    _mode match {
      case ゲームモード.NewPuyo =>
        プレイヤー.新しいぷよを作成()
        _mode = ゲームモード.Playing

      case ゲームモード.Playing =>
        プレイヤー.更新()

      case _ => // その他の状態は今後実装
    }
  }

  private def 描画(): Unit = {
    ステージ.描画()

    if (_mode == ゲームモード.Playing) {
      プレイヤー.描画()
    }
  }
}
