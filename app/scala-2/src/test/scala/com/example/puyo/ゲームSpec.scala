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
