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

  // イテレーション4: 落下タイマーのテスト
  "プレイヤー auto drop" should "drop one row after drop interval" in {
    プレイヤー.新しいぷよを作成()
    val initialY = プレイヤー.ぷよのY座標
    val dropInterval = 1000.0  // 1000ミリ秒 = 1秒

    // 落下間隔分の時間を経過させる
    プレイヤー.デルタ時間で更新(dropInterval)

    // 1マス下に落ちていることを確認
    プレイヤー.ぷよのY座標 shouldBe initialY + 1
  }

  it should "not drop before drop interval" in {
    プレイヤー.新しいぷよを作成()
    val initialY = プレイヤー.ぷよのY座標
    val dropInterval = 1000.0

    // 落下間隔の半分だけ経過させる
    プレイヤー.デルタ時間で更新(dropInterval / 2)

    // 位置が変わっていないことを確認
    プレイヤー.ぷよのY座標 shouldBe initialY
  }

  it should "not drop beyond bottom edge" in {
    プレイヤー.新しいぷよを作成()
    プレイヤー.ぷよのY座標を設定(設定情報.stageRows - 1)  // 下端に配置

    // 落下処理を実行
    プレイヤー.デルタ時間で更新(1000.0)

    // 位置が変わっていないことを確認（下端を超えない）
    プレイヤー.ぷよのY座標 shouldBe 設定情報.stageRows - 1
  }

  // イテレーション4: 着地判定のテスト
  "プレイヤー landing" should "fix puyo to ステージ when landed" in {
    プレイヤー.新しいぷよを作成()
    プレイヤー.ぷよのY座標を設定(設定情報.stageRows - 2)  // 下端の1つ上に配置
    プレイヤー.回転状態を設定(2)  // 2つ目のぷよが下にある状態

    // 落下処理を実行（着地する）
    プレイヤー.デルタ時間で更新(1000.0)

    // ステージにぷよが固定されていることを確認
    ステージ.getPuyo(プレイヤー.ぷよのX座標, 設定情報.stageRows - 2) should be > 0
    ステージ.getPuyo(プレイヤー.ぷよのX座標, 設定情報.stageRows - 1) should be > 0
  }

  it should "set landed flag when puyo lands" in {
    プレイヤー.新しいぷよを作成()
    プレイヤー.ぷよのY座標を設定(設定情報.stageRows - 2)
    プレイヤー.回転状態を設定(2)

    // 落下処理を実行（着地する）
    プレイヤー.デルタ時間で更新(1000.0)

    // 着地フラグが立っていることを確認
    プレイヤー.着地した() shouldBe true
  }

  it should "land on top of existing puyo" in {
    // ステージの底に既存のぷよを配置
    ステージ.setPuyo(2, 設定情報.stageRows - 1, 1)

    プレイヤー.新しいぷよを作成()
    プレイヤー.ぷよのY座標を設定(設定情報.stageRows - 3)
    プレイヤー.回転状態を設定(2)  // 2つ目のぷよが下

    // 2回落下（着地するまで）
    プレイヤー.デルタ時間で更新(1000.0)
    プレイヤー.デルタ時間で更新(1000.0)

    // 既存のぷよの上に着地していることを確認
    ステージ.getPuyo(2, 設定情報.stageRows - 3) should be > 0
    ステージ.getPuyo(2, 設定情報.stageRows - 2) should be > 0
  }
}
