package puyo

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class BoardSpec extends AnyFlatSpec with Matchers {

  "Board.createEmpty" should "8x12の空のボードを作成する" in {
    val board = Board.createEmpty

    board.width shouldBe 8
    board.height shouldBe 12

    // 全てのセルが0（空）であることを確認
    for {
      y <- 0 until board.height
      x <- 0 until board.width
    } {
      board.getPuyoAt(x, y) shouldBe Some(0)
    }
  }

  "Board.isValidPosition" should "有効な位置に対してtrueを返す" in {
    val board = Board.createEmpty

    board.isValidPosition(0, 0) shouldBe true
    board.isValidPosition(7, 11) shouldBe true
    board.isValidPosition(4, 6) shouldBe true
  }

  it should "無効な位置に対してfalseを返す" in {
    val board = Board.createEmpty

    board.isValidPosition(-1, 0) shouldBe false
    board.isValidPosition(0, -1) shouldBe false
    board.isValidPosition(8, 0) shouldBe false
    board.isValidPosition(0, 12) shouldBe false
    board.isValidPosition(10, 15) shouldBe false
  }

  "Board.setPuyo" should "指定位置にぷよを配置する" in {
    val board = Board.createEmpty
    val updated = board.setPuyo(3, 5, PuyoColor.Red.value)

    updated.getPuyoAt(3, 5) shouldBe Some(PuyoColor.Red.value)
    // 元のボードは変更されない（不変性）
    board.getPuyoAt(3, 5) shouldBe Some(0)
  }

  it should "無効な位置の場合はボードを変更しない" in {
    val board = Board.createEmpty
    val updated = board.setPuyo(-1, 0, PuyoColor.Red.value)

    updated shouldBe board
  }

  "Board.getPuyoAt" should "指定位置のぷよの色を取得する" in {
    val board = Board.createEmpty
      .setPuyo(2, 4, PuyoColor.Blue.value)
      .setPuyo(5, 8, PuyoColor.Green.value)

    board.getPuyoAt(2, 4) shouldBe Some(PuyoColor.Blue.value)
    board.getPuyoAt(5, 8) shouldBe Some(PuyoColor.Green.value)
    board.getPuyoAt(0, 0) shouldBe Some(0)
  }

  it should "無効な位置の場合はNoneを返す" in {
    val board = Board.createEmpty

    board.getPuyoAt(-1, 0) shouldBe None
    board.getPuyoAt(8, 0) shouldBe None
    board.getPuyoAt(0, 12) shouldBe None
  }

  "Board" should "複数のぷよを配置できる" in {
    val board = Board.createEmpty
      .setPuyo(0, 11, PuyoColor.Red.value)
      .setPuyo(1, 11, PuyoColor.Blue.value)
      .setPuyo(2, 11, PuyoColor.Green.value)
      .setPuyo(0, 10, PuyoColor.Yellow.value)

    board.getPuyoAt(0, 11) shouldBe Some(PuyoColor.Red.value)
    board.getPuyoAt(1, 11) shouldBe Some(PuyoColor.Blue.value)
    board.getPuyoAt(2, 11) shouldBe Some(PuyoColor.Green.value)
    board.getPuyoAt(0, 10) shouldBe Some(PuyoColor.Yellow.value)
  }

  it should "不変性を保つ" in {
    val original = Board.createEmpty
    val step1 = original.setPuyo(0, 0, PuyoColor.Red.value)
    val step2 = step1.setPuyo(1, 0, PuyoColor.Blue.value)

    // 元のボードは変更されていない
    original.getPuyoAt(0, 0) shouldBe Some(0)
    original.getPuyoAt(1, 0) shouldBe Some(0)

    // step1は1つ目の変更のみ
    step1.getPuyoAt(0, 0) shouldBe Some(PuyoColor.Red.value)
    step1.getPuyoAt(1, 0) shouldBe Some(0)

    // step2は両方の変更が反映
    step2.getPuyoAt(0, 0) shouldBe Some(PuyoColor.Red.value)
    step2.getPuyoAt(1, 0) shouldBe Some(PuyoColor.Blue.value)
  }
}
