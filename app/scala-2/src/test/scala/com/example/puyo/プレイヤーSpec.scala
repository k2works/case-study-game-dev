package com.example.puyo

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.BeforeAndAfterEach

class プレイヤーSpec extends AnyFlatSpec with Matchers with BeforeAndAfterEach:
  var 設定情報: 設定情報 = _
  var ぷよ画像: ぷよ画像 = _
  var ステージ: ステージ = _
  var プレイヤー: プレイヤー = _

  override def beforeEach(): Unit =
    設定情報 = new 設定情報()
    ぷよ画像 = new ぷよ画像(設定情報)
    ステージ = new ステージ(設定情報, ぷよ画像)
    プレイヤー = new プレイヤー(設定情報, ステージ, ぷよ画像)

  "プレイヤー" should "左キーが押されたときに左フラグを設定する" in {
    // キー入力をシミュレート（テスト用のメソッドを呼び出す）
    プレイヤー.キー状態を設定("ArrowLeft", pressed = true)

    プレイヤー.入力キー左 shouldBe true
  }

  it should "右キーが押されたときに右フラグを設定する" in {
    プレイヤー.キー状態を設定("ArrowRight", pressed = true)

    プレイヤー.入力キー右 shouldBe true
  }

  it should "キーが離されたときにフラグをクリアする" in {
    プレイヤー.キー状態を設定("ArrowLeft", pressed = true)
    プレイヤー.入力キー左 shouldBe true

    プレイヤー.キー状態を設定("ArrowLeft", pressed = false)
    プレイヤー.入力キー左 shouldBe false
  }

  "プレイヤー movement" should "可能な場合に左に移動する" in {
    プレイヤー.新しいぷよを作成()
    val initialX = プレイヤー.ぷよのX座標

    プレイヤー.左に移動()

    プレイヤー.ぷよのX座標 shouldBe initialX - 1
  }

  it should "可能な場合に右に移動する" in {
    プレイヤー.新しいぷよを作成()
    val initialX = プレイヤー.ぷよのX座標

    プレイヤー.右に移動()

    プレイヤー.ぷよのX座標 shouldBe initialX + 1
  }

  it should "左端では左に移動しない" in {
    プレイヤー.新しいぷよを作成()
    プレイヤー.ぷよのX座標を設定(0) // 左端に設定

    プレイヤー.左に移動()

    プレイヤー.ぷよのX座標 shouldBe 0
  }

  it should "右端では右に移動しない" in {
    プレイヤー.新しいぷよを作成()
    プレイヤー.ぷよのX座標を設定(設定情報.ステージ列数 - 1) // 右端に設定

    プレイヤー.右に移動()

    プレイヤー.ぷよのX座標 shouldBe 設定情報.ステージ列数 - 1
  }
