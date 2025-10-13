package com.example.puyo

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.BeforeAndAfterEach

class プレイヤーSpec extends AnyFlatSpec with Matchers with BeforeAndAfterEach {
  var 設定情報: 設定情報 = _
  var ぷよ画像: ぷよ画像 = _
  var ステージ: ステージ = _
  var プレイヤー: プレイヤー = _

  override def beforeEach(): Unit = {
    設定情報 = new 設定情報()
    ぷよ画像 = new ぷよ画像(設定情報)
    ステージ = new ステージ(設定情報, ぷよ画像)
    プレイヤー = new プレイヤー(設定情報, ステージ, ぷよ画像)
  }

  // イテレーション2: キー入力のテスト
  "プレイヤー" should "set left flag when left key is pressed" in {
    プレイヤー.setKeyState("ArrowLeft", pressed = true)

    プレイヤー.inputKeyLeft shouldBe true
  }

  it should "set right flag when right key is pressed" in {
    プレイヤー.setKeyState("ArrowRight", pressed = true)

    プレイヤー.inputKeyRight shouldBe true
  }

  it should "clear flag when key is released" in {
    プレイヤー.setKeyState("ArrowLeft", pressed = true)
    プレイヤー.inputKeyLeft shouldBe true

    プレイヤー.setKeyState("ArrowLeft", pressed = false)
    プレイヤー.inputKeyLeft shouldBe false
  }

  // イテレーション2: 移動のテスト
  "プレイヤー movement" should "move left when possible" in {
    プレイヤー.新しいぷよを作成()
    val initialX = プレイヤー.ぷよのX座標

    プレイヤー.左に移動()

    プレイヤー.ぷよのX座標 shouldBe initialX - 1
  }

  it should "move right when possible" in {
    プレイヤー.新しいぷよを作成()
    val initialX = プレイヤー.ぷよのX座標

    プレイヤー.右に移動()

    プレイヤー.ぷよのX座標 shouldBe initialX + 1
  }

  it should "not move left at left edge" in {
    プレイヤー.新しいぷよを作成()
    プレイヤー.ぷよのX座標を設定(0) // 左端に設定

    プレイヤー.左に移動()

    プレイヤー.ぷよのX座標 shouldBe 0
  }

  it should "not move right at right edge" in {
    プレイヤー.新しいぷよを作成()
    プレイヤー.ぷよのX座標を設定(設定情報.stageCols - 1) // 右端に設定

    プレイヤー.右に移動()

    プレイヤー.ぷよのX座標 shouldBe 設定情報.stageCols - 1
  }

  // イテレーション3: 回転のテスト
  "プレイヤー rotation" should "rotate clockwise and increment rotation state" in {
    プレイヤー.新しいぷよを作成()
    val initialRotation = プレイヤー.回転状態

    プレイヤー.右に回転()

    プレイヤー.回転状態 shouldBe ((initialRotation + 1) % 4)
  }

  it should "rotate counter-clockwise and decrement rotation state" in {
    プレイヤー.新しいぷよを作成()
    val initialRotation = プレイヤー.回転状態

    プレイヤー.左に回転()

    プレイヤー.回転状態 shouldBe ((initialRotation + 3) % 4)
  }

  it should "wrap rotation state from 3 to 0 when rotating right" in {
    プレイヤー.新しいぷよを作成()
    プレイヤー.回転状態を設定(3)

    プレイヤー.右に回転()

    プレイヤー.回転状態 shouldBe 0
  }

  // イテレーション3: 壁キックのテスト
  "Wall kick" should "move left when rotating right at right edge" in {
    プレイヤー.新しいぷよを作成()
    プレイヤー.ぷよのX座標を設定(設定情報.stageCols - 1)  // 右端に配置
    プレイヤー.回転状態を設定(0)  // 上向き

    // 右回転（2つ目のぷよが右にくる）
    プレイヤー.右に回転()

    // 壁キックにより左に移動していることを確認
    プレイヤー.ぷよのX座標 shouldBe (設定情報.stageCols - 2)
    プレイヤー.回転状態 shouldBe 1
  }

  it should "move right when rotating left at left edge" in {
    プレイヤー.新しいぷよを作成()
    プレイヤー.ぷよのX座標を設定(0)  // 左端に配置
    プレイヤー.回転状態を設定(0)  // 上向き

    // 左回転（2つ目のぷよが左にくる）
    プレイヤー.左に回転()

    // 壁キックにより右に移動していることを確認
    プレイヤー.ぷよのX座標 shouldBe 1
    プレイヤー.回転状態 shouldBe 3
  }
}
