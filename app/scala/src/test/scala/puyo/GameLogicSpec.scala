package puyo

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class GameLogicSpec extends AnyFlatSpec with Matchers {

  // ========== 移動判定テスト ==========
  "GameLogic.canMovePuyoPair" should "左に移動可能な場合はtrueを返す" in {
    val board = Board.createEmpty
    val pair = PuyoPair(
      PuyoColor.Red,
      PuyoColor.Blue,
      Position(3, 5),
      Rotation.Deg0
    )

    GameLogic.canMovePuyoPair(pair, board, Direction.Left) shouldBe true
  }

  it should "左端にいる場合はfalseを返す" in {
    val board = Board.createEmpty
    val pair = PuyoPair(
      PuyoColor.Red,
      PuyoColor.Blue,
      Position(0, 5),
      Rotation.Deg0
    )

    GameLogic.canMovePuyoPair(pair, board, Direction.Left) shouldBe false
  }

  it should "左にぷよがある場合はfalseを返す" in {
    val board = Board.createEmpty
      .setPuyo(2, 5, PuyoColor.Green.value)
    val pair = PuyoPair(
      PuyoColor.Red,
      PuyoColor.Blue,
      Position(3, 5),
      Rotation.Deg0
    )

    GameLogic.canMovePuyoPair(pair, board, Direction.Left) shouldBe false
  }

  it should "右に移動可能な場合はtrueを返す" in {
    val board = Board.createEmpty
    val pair = PuyoPair(
      PuyoColor.Red,
      PuyoColor.Blue,
      Position(3, 5),
      Rotation.Deg0
    )

    GameLogic.canMovePuyoPair(pair, board, Direction.Right) shouldBe true
  }

  it should "下に移動可能な場合はtrueを返す" in {
    val board = Board.createEmpty
    val pair = PuyoPair(
      PuyoColor.Red,
      PuyoColor.Blue,
      Position(3, 5),
      Rotation.Deg0
    )

    GameLogic.canMovePuyoPair(pair, board, Direction.Down) shouldBe true
  }

  it should "最下段にいる場合はfalseを返す" in {
    val board = Board.createEmpty
    val pair = PuyoPair(
      PuyoColor.Red,
      PuyoColor.Blue,
      Position(3, 10),
      Rotation.Deg0
    )

    GameLogic.canMovePuyoPair(pair, board, Direction.Down) shouldBe false
  }

  // ========== 移動テスト ==========
  "GameLogic.movePuyoPair" should "移動可能な場合は移動後のペアを返す" in {
    val board = Board.createEmpty
    val pair = PuyoPair(
      PuyoColor.Red,
      PuyoColor.Blue,
      Position(3, 5),
      Rotation.Deg0
    )

    val moved = GameLogic.movePuyoPair(pair, board, Direction.Left)
    moved shouldBe defined
    moved.get.basePosition shouldBe Position(2, 5)
  }

  it should "移動不可能な場合はNoneを返す" in {
    val board = Board.createEmpty
    val pair = PuyoPair(
      PuyoColor.Red,
      PuyoColor.Blue,
      Position(0, 5),
      Rotation.Deg0
    )

    val moved = GameLogic.movePuyoPair(pair, board, Direction.Left)
    moved shouldBe None
  }

  // ========== ハードドロップテスト ==========
  "GameLogic.hardDrop" should "最下段まで落下する" in {
    val board = Board.createEmpty
    val pair = PuyoPair(
      PuyoColor.Red,
      PuyoColor.Blue,
      Position(3, 0),
      Rotation.Deg0
    )

    val dropped = GameLogic.hardDrop(pair, board)
    dropped.basePosition.y shouldBe 10
  }

  it should "障害物がある場合はその直前で停止する" in {
    val board = Board.createEmpty
      .setPuyo(3, 8, PuyoColor.Green.value)
    val pair = PuyoPair(
      PuyoColor.Red,
      PuyoColor.Blue,
      Position(3, 0),
      Rotation.Deg0
    )

    val dropped = GameLogic.hardDrop(pair, board)
    dropped.basePosition.y shouldBe 6
  }

  // ========== ぷよ固定テスト ==========
  "GameLogic.fixPuyoPairToBoard" should "ペアをボードに固定する" in {
    val board = Board.createEmpty
    val pair = PuyoPair(
      PuyoColor.Red,
      PuyoColor.Blue,
      Position(3, 10),
      Rotation.Deg0
    )

    val fixed = GameLogic.fixPuyoPairToBoard(pair, board)
    fixed.getPuyoAt(3, 10) shouldBe Some(PuyoColor.Red.value)
    fixed.getPuyoAt(3, 11) shouldBe Some(PuyoColor.Blue.value)
  }

  // ========== 浮遊ぷよ落下テスト ==========
  "GameLogic.dropFloatingPuyos" should "浮遊しているぷよを落下させる" in {
    val board = Board.createEmpty
      .setPuyo(3, 5, PuyoColor.Red.value)
      .setPuyo(3, 11, PuyoColor.Blue.value)

    val dropped = GameLogic.dropFloatingPuyos(board)

    dropped.getPuyoAt(3, 5) shouldBe Some(0)
    dropped.getPuyoAt(3, 10) shouldBe Some(PuyoColor.Red.value)
    dropped.getPuyoAt(3, 11) shouldBe Some(PuyoColor.Blue.value)
  }

  it should "すでに積み重なっている場合は何もしない" in {
    val board = Board.createEmpty
      .setPuyo(3, 10, PuyoColor.Red.value)
      .setPuyo(3, 11, PuyoColor.Blue.value)

    val dropped = GameLogic.dropFloatingPuyos(board)
    dropped shouldBe board
  }

  // ========== 隣接ぷよ検索テスト ==========
  "GameLogic.findAdjacentPuyos" should "同色の隣接ぷよを見つける" in {
    val board = Board.createEmpty
      .setPuyo(3, 11, PuyoColor.Red.value)
      .setPuyo(4, 11, PuyoColor.Red.value)
      .setPuyo(5, 11, PuyoColor.Red.value)

    val adjacent = GameLogic.findAdjacentPuyos(board, 3, 11)
    adjacent.size shouldBe 3
    adjacent should contain(Position(3, 11))
    adjacent should contain(Position(4, 11))
    adjacent should contain(Position(5, 11))
  }

  it should "異なる色のぷよは含まない" in {
    val board = Board.createEmpty
      .setPuyo(3, 11, PuyoColor.Red.value)
      .setPuyo(4, 11, PuyoColor.Blue.value)

    val adjacent = GameLogic.findAdjacentPuyos(board, 3, 11)
    adjacent.size shouldBe 1
    adjacent should contain(Position(3, 11))
  }

  it should "L字型の接続も正しく検出する" in {
    val board = Board.createEmpty
      .setPuyo(3, 11, PuyoColor.Red.value)
      .setPuyo(4, 11, PuyoColor.Red.value)
      .setPuyo(4, 10, PuyoColor.Red.value)
      .setPuyo(4, 9, PuyoColor.Red.value)

    val adjacent = GameLogic.findAdjacentPuyos(board, 3, 11)
    adjacent.size shouldBe 4
  }

  // ========== 消去対象グループ検索テスト ==========
  "GameLogic.findGroupsToClear" should "4つ以上の同色グループを検出する" in {
    val board = Board.createEmpty
      .setPuyo(0, 11, PuyoColor.Red.value)
      .setPuyo(1, 11, PuyoColor.Red.value)
      .setPuyo(2, 11, PuyoColor.Red.value)
      .setPuyo(3, 11, PuyoColor.Red.value)

    val groups = GameLogic.findGroupsToClear(board)
    groups.size shouldBe 1
    groups.head.size shouldBe 4
  }

  it should "3つ以下のグループは検出しない" in {
    val board = Board.createEmpty
      .setPuyo(0, 11, PuyoColor.Red.value)
      .setPuyo(1, 11, PuyoColor.Red.value)
      .setPuyo(2, 11, PuyoColor.Red.value)

    val groups = GameLogic.findGroupsToClear(board)
    groups shouldBe empty
  }

  it should "複数の消去可能グループを検出する" in {
    val board = Board.createEmpty
      // 赤グループ
      .setPuyo(0, 11, PuyoColor.Red.value)
      .setPuyo(1, 11, PuyoColor.Red.value)
      .setPuyo(2, 11, PuyoColor.Red.value)
      .setPuyo(3, 11, PuyoColor.Red.value)
      // 青グループ
      .setPuyo(5, 11, PuyoColor.Blue.value)
      .setPuyo(6, 11, PuyoColor.Blue.value)
      .setPuyo(7, 11, PuyoColor.Blue.value)
      .setPuyo(5, 10, PuyoColor.Blue.value)

    val groups = GameLogic.findGroupsToClear(board)
    groups.size shouldBe 2
  }

  // ========== ぷよ消去テスト ==========
  "GameLogic.clearPuyoGroups" should "指定されたグループを消去する" in {
    val board = Board.createEmpty
      .setPuyo(0, 11, PuyoColor.Red.value)
      .setPuyo(1, 11, PuyoColor.Red.value)
      .setPuyo(2, 11, PuyoColor.Red.value)
      .setPuyo(3, 11, PuyoColor.Red.value)

    val groups = Seq(Seq(
      Position(0, 11),
      Position(1, 11),
      Position(2, 11),
      Position(3, 11)
    ))

    val cleared = GameLogic.clearPuyoGroups(board, groups)
    cleared.getPuyoAt(0, 11) shouldBe Some(0)
    cleared.getPuyoAt(1, 11) shouldBe Some(0)
    cleared.getPuyoAt(2, 11) shouldBe Some(0)
    cleared.getPuyoAt(3, 11) shouldBe Some(0)
  }

  // ========== スコア計算テスト ==========
  "GameLogic.calculateChainBonus" should "連鎖数に応じたボーナスを返す" in {
    GameLogic.calculateChainBonus(1) shouldBe 0
    GameLogic.calculateChainBonus(2) shouldBe 8
    GameLogic.calculateChainBonus(3) shouldBe 16
    GameLogic.calculateChainBonus(4) shouldBe 32
    GameLogic.calculateChainBonus(5) shouldBe 64
  }

  "GameLogic.calculateClearScore" should "消去数とボーナスからスコアを計算する" in {
    GameLogic.calculateClearScore(4, 0) shouldBe 40
    GameLogic.calculateClearScore(4, 8) shouldBe 48
    GameLogic.calculateClearScore(8, 16) shouldBe 96
  }

  // ========== ゲームオーバー判定テスト ==========
  "GameLogic.isGameOver" should "上部2行にぷよがある場合はtrueを返す" in {
    val board = Board.createEmpty
      .setPuyo(3, 0, PuyoColor.Red.value)

    GameLogic.isGameOver(board) shouldBe true
  }

  it should "上部2行が空の場合はfalseを返す" in {
    val board = Board.createEmpty
      .setPuyo(3, 2, PuyoColor.Red.value)

    GameLogic.isGameOver(board) shouldBe false
  }

  // ========== 連鎖実行テスト ==========
  "GameLogic.executeChain" should "単純な4個消去を実行する" in {
    val board = Board.createEmpty
      .setPuyo(0, 11, PuyoColor.Red.value)
      .setPuyo(1, 11, PuyoColor.Red.value)
      .setPuyo(2, 11, PuyoColor.Red.value)
      .setPuyo(3, 11, PuyoColor.Red.value)

    val result = GameLogic.executeChain(board)

    result.chainCount shouldBe 1
    result.totalScore shouldBe 40 // 4個 * 10
    result.board.getPuyoAt(0, 11) shouldBe Some(0)
    result.board.getPuyoAt(1, 11) shouldBe Some(0)
    result.board.getPuyoAt(2, 11) shouldBe Some(0)
    result.board.getPuyoAt(3, 11) shouldBe Some(0)
  }

  it should "消去可能なぷよがない場合は何もしない" in {
    val board = Board.createEmpty
      .setPuyo(0, 11, PuyoColor.Red.value)
      .setPuyo(1, 11, PuyoColor.Red.value)
      .setPuyo(2, 11, PuyoColor.Red.value)

    val result = GameLogic.executeChain(board)

    result.chainCount shouldBe 0
    result.totalScore shouldBe 0
    result.board shouldBe board
  }
}
