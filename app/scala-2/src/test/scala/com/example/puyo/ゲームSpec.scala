package com.example.puyo

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.BeforeAndAfterEach

class ゲームSpec extends AnyFlatSpec with Matchers with BeforeAndAfterEach:
  var ゲーム: ゲーム = _

  override def beforeEach(): Unit =
    ゲーム = new ゲーム()

  "ゲーム" should "初期化時に必要なコンポーネントを作成する" in {
    ゲーム.初期化()

    ゲーム.設定情報 should not be null
    ゲーム.ぷよ画像 should not be null
    ゲーム.ステージ should not be null
    ゲーム.プレイヤー should not be null
    ゲーム.スコア should not be null
  }

  it should "初期化時にゲームモードを新ぷよに設定する" in {
    ゲーム.初期化()

    ゲーム.モード shouldBe ゲームモード.新ぷよ
  }

  "連鎖反応" should "ぷよの消去と落下後、新たな消去パターンがあれば連鎖が発生する" in {
    ゲーム.初期化()

    val ステージ = ゲーム.ステージ

    // 赤ぷよを2×2の正方形に配置（消去対象）
    ステージ.ぷよを設定(1, 10, 1)
    ステージ.ぷよを設定(2, 10, 1)
    ステージ.ぷよを設定(1, 11, 1)
    ステージ.ぷよを設定(2, 11, 1)

    // 青ぷよを配置（赤ぷよ消去後に落下して連鎖を起こす）
    ステージ.ぷよを設定(3, 10, 2) // 横に1つ
    ステージ.ぷよを設定(2, 7, 2)  // 上から縦に3つ
    ステージ.ぷよを設定(2, 8, 2)
    ステージ.ぷよを設定(2, 9, 2)

    // 最初の消去チェック（赤ぷよが4つ揃っている）
    val 初回消去情報 = ステージ.消去チェック()
    初回消去情報.erasePuyoCount shouldBe 4

    // 消去確認モードから開始
    ゲーム.モードを設定(ゲームモード.消去確認)

    // 1回目の更新：消去確認 → 落下確認（赤ぷよが消去される）
    ゲーム.更新を実行(0.0)
    ゲーム.モード shouldBe ゲームモード.落下確認

    // 落下と連鎖をループで実行
    var loopCount = 0
    var 連鎖が発生した = false
    while (ゲーム.モード != ゲームモード.新ぷよ) && loopCount < 20 do
      // 消去確認モードで2回目の消去をチェック
      if ゲーム.モード == ゲームモード.消去確認 then
        val 消去情報 = ステージ.消去チェック()
        if 消去情報.erasePuyoCount > 0 && loopCount > 0 then
          // 2回目以降の消去が発生したら連鎖成功
          連鎖が発生した = true
          消去情報.erasePuyoCount shouldBe 4

      ゲーム.更新を実行(0.0)
      loopCount += 1

    // 連鎖が発生したことを確認
    連鎖が発生した shouldBe true
  }
