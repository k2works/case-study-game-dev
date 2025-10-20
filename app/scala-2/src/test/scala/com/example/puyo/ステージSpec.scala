package com.example.puyo

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.BeforeAndAfterEach

class ステージSpec extends AnyFlatSpec with Matchers with BeforeAndAfterEach:
  var 設定情報: 設定情報 = _
  var ぷよ画像: ぷよ画像 = _
  var ステージ: ステージ = _

  override def beforeEach(): Unit =
    設定情報 = new 設定情報()
    ぷよ画像 = new ぷよ画像(設定情報)
    ステージ = new ステージ(設定情報, ぷよ画像)

  "ぷよの接続判定" should "同じ色のぷよが4つつながっていると、消去対象になる" in {
    // ステージにぷよを配置（1は赤ぷよ）
    // 2x2の正方形に赤ぷよを配置
    ステージ.ぷよを設定(1, 10, 1)
    ステージ.ぷよを設定(2, 10, 1)
    ステージ.ぷよを設定(1, 11, 1)
    ステージ.ぷよを設定(2, 11, 1)

    // 消去判定
    val 消去情報 = ステージ.消去チェック()

    // 4つのぷよが消去対象になっていることを確認
    消去情報.erasePuyoCount shouldBe 4
    消去情報.eraseInfo.length should be > 0
  }

  it should "異なる色のぷよは消去対象にならない" in {
    // ステージにぷよを配置（1は赤ぷよ、2は緑ぷよ）
    // 市松模様に配置
    ステージ.ぷよを設定(1, 10, 1)
    ステージ.ぷよを設定(2, 10, 2)
    ステージ.ぷよを設定(1, 11, 2)
    ステージ.ぷよを設定(2, 11, 1)

    // 消去判定
    val 消去情報 = ステージ.消去チェック()

    // 消去対象がないことを確認
    消去情報.erasePuyoCount shouldBe 0
    消去情報.eraseInfo.length shouldBe 0
  }

  it should "3つ以下のつながりは消去対象にならない" in {
    // ステージにぷよを配置（1は赤ぷよ）
    // L字型に3つだけ配置
    ステージ.ぷよを設定(1, 10, 1)
    ステージ.ぷよを設定(2, 10, 1)
    ステージ.ぷよを設定(1, 11, 1)

    // 消去判定
    val 消去情報 = ステージ.消去チェック()

    // 消去対象がないことを確認
    消去情報.erasePuyoCount shouldBe 0
    消去情報.eraseInfo.length shouldBe 0
  }

  "ぷよの消去と落下" should "消去対象のぷよを消去する" in {
    // ステージにぷよを配置
    ステージ.ぷよを設定(1, 10, 1)
    ステージ.ぷよを設定(2, 10, 1)
    ステージ.ぷよを設定(1, 11, 1)
    ステージ.ぷよを設定(2, 11, 1)

    // 消去判定
    val 消去情報 = ステージ.消去チェック()

    // 消去実行
    ステージ.ボードを消去(消去情報.eraseInfo)

    // ぷよが消去されていることを確認
    ステージ.ぷよを取得(1, 10) shouldBe 0
    ステージ.ぷよを取得(2, 10) shouldBe 0
    ステージ.ぷよを取得(1, 11) shouldBe 0
    ステージ.ぷよを取得(2, 11) shouldBe 0
  }

  it should "消去後、上にあるぷよが落下する" in {
    // ステージにぷよを配置
    // 下に赤ぷよ4つ、その上に緑ぷよ2つ
    ステージ.ぷよを設定(1, 10, 1)
    ステージ.ぷよを設定(2, 10, 1)
    ステージ.ぷよを設定(1, 11, 1)
    ステージ.ぷよを設定(2, 11, 1)
    ステージ.ぷよを設定(2, 8, 2)
    ステージ.ぷよを設定(2, 9, 2)

    // 消去判定と実行
    val 消去情報 = ステージ.消去チェック()
    ステージ.ボードを消去(消去情報.eraseInfo)

    // 落下処理
    ステージ.落下()

    // 上にあったぷよが落下していることを確認
    ステージ.ぷよを取得(2, 10) shouldBe 2
    ステージ.ぷよを取得(2, 11) shouldBe 2
  }

  "ステージ gravity" should "make floating puyo fall one row" in {
    // 浮いている青ぷよを配置（下に空きがある）
    ステージ.ぷよを設定(4, 2, 2)
    // 下端に黄色ぷよの積み重ね
    ステージ.ぷよを設定(3, 設定情報.ステージ行数 - 3, 1)
    ステージ.ぷよを設定(3, 設定情報.ステージ行数 - 2, 1)
    ステージ.ぷよを設定(3, 設定情報.ステージ行数 - 1, 1)

    // 重力を適用
    val hasFallen = ステージ.重力を適用()

    // 青ぷよが1マス落ちていることを確認
    ステージ.ぷよを取得(4, 2) shouldBe 0
    ステージ.ぷよを取得(4, 3) shouldBe 2
    hasFallen shouldBe true

    // 黄色ぷよは変わらない（下端に積み重なっているので動かない）
    ステージ.ぷよを取得(3, 設定情報.ステージ行数 - 3) shouldBe 1
    ステージ.ぷよを取得(3, 設定情報.ステージ行数 - 2) shouldBe 1
    ステージ.ぷよを取得(3, 設定情報.ステージ行数 - 1) shouldBe 1
  }

  it should "return false when no puyo falls" in {
    // 全てのぷよが支えられている状態
    ステージ.ぷよを設定(2, 設定情報.ステージ行数 - 1, 1)
    ステージ.ぷよを設定(3, 設定情報.ステージ行数 - 1, 2)

    // 重力を適用
    val hasFallen = ステージ.重力を適用()

    // 何も落ちていないことを確認
    hasFallen shouldBe false
  }

  it should "make multiple floating puyos fall" in {
    // 複数の浮いているぷよを配置
    ステージ.ぷよを設定(1, 1, 1)
    ステージ.ぷよを設定(2, 2, 2)
    ステージ.ぷよを設定(3, 3, 3)

    // 重力を適用
    val hasFallen = ステージ.重力を適用()

    // 全てのぷよが1マス落ちていることを確認
    ステージ.ぷよを取得(1, 1) shouldBe 0
    ステージ.ぷよを取得(1, 2) shouldBe 1
    ステージ.ぷよを取得(2, 2) shouldBe 0
    ステージ.ぷよを取得(2, 3) shouldBe 2
    ステージ.ぷよを取得(3, 3) shouldBe 0
    ステージ.ぷよを取得(3, 4) shouldBe 3
    hasFallen shouldBe true
  }
