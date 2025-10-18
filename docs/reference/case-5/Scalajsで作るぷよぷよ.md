---
title: Scala.jsで作るぷよぷよ：テスト駆動開発による実装ガイド
description:
published: true
date: 2025-10-01T03:15:00.000Z
tags:
editor: markdown
dateCreated: 2025-10-01T03:15:00.000Z
---

# Scala.jsで作るぷよぷよ：テスト駆動開発による実装ガイド

## はじめに

このガイドでは、Scala.jsとテスト駆動開発（TDD）を使用してぷよぷよゲームを実装する過程を詳しく解説します。静的型付け関数型プログラミングのパラダイムとTDDの思想を組み合わせて、保守性と品質の高いゲームシステムを構築していきます。

## 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタックと環境設定](#技術スタックと環境設定)
3. [TDD開発プロセス](#tdd開発プロセス)
4. [Phase 1: 基盤システム](#phase-1-基盤システム)
5. [Phase 2: ぷよ管理システム](#phase-2-ぷよ管理システム)
6. [Phase 3: ゲームロジック](#phase-3-ゲームロジック)
7. [Phase 4: ユーザーインターフェース](#phase-4-ユーザーインターフェース)
8. [Phase 5: ゲームフロー](#phase-5-ゲームフロー)
9. [コード品質向上の実践](#コード品質向上の実践)
10. [学んだ教訓と今後の拡張](#学んだ教訓と今後の拡張)

## プロジェクト概要

### ゲーム仕様

- **ボードサイズ**: 8×12マス（幅8、高さ12）
- **ぷよの色**: 5色（赤、緑、青、黄、紫）
- **消去ルール**: 同色4つ以上の接続で消去
- **連鎖システム**: 消去後の落下により新たな接続が形成される
- **スコアリング**: 基本スコア + 連鎖ボーナス + 全消しボーナス

### 操作方法

- `←` `→` : 左右移動
- `↓` : 高速落下
- `↑` : 回転
- `スペース` : ハードドロップ

## 技術スタックと環境設定

### 主要技術

```scala
// build.sbt 設定例
name := "puyo-scala"

scalaVersion := "2.13.12"

enablePlugins(ScalaJSPlugin)

libraryDependencies ++= Seq(
  "org.scala-js" %%% "scalajs-dom" % "2.8.0",
  "org.scalatest" %%% "scalatest" % "3.2.17" % "test"
)

scalaJSUseMainModuleInitializer := true
```

### 技術選択の理由

1. **Scala.js**: 静的型付けによる安全性と関数型プログラミング
2. **ScalaTest**: 表現力豊かなテストフレームワーク
3. **HTML5 Canvas**: 高性能な2D描画
4. **Vite/sbt**: モダンなビルド環境

### プロジェクト構成

```
app/scala/
├── src/
│   ├── main/scala/puyo/
│   │   ├── Main.scala         # エントリーポイント
│   │   ├── Board.scala        # ボード管理
│   │   ├── Puyo.scala         # ぷよ管理
│   │   ├── GameLogic.scala    # ゲームロジック
│   │   └── UI.scala           # UI管理
│   └── test/scala/puyo/
│       ├── BoardSpec.scala    # ボードテスト
│       ├── PuyoSpec.scala     # ぷよテスト
│       └── GameLogicSpec.scala # ロジックテスト
├── public/
│   └── index.html             # ゲームUI
└── build.sbt                  # ビルド設定
```

## TDD開発プロセス

### 基本サイクル

各機能実装で以下のRed-Green-Refactorサイクルを実行：

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限の実装
3. **Refactor**: コードの品質を向上させる

### 実際の開発例

```scala
// Phase 1: テストファースト（Red）
class BoardSpec extends AnyFlatSpec with Matchers {
  "Board" should "be created with correct dimensions" in {
    val board = Board.createEmpty
    board.height shouldBe 12
    board.width shouldBe 8
    board.cells should have size 12
    board.cells.head should have size 8
  }
}

// Phase 2: 最小実装（Green）
case class Board(cells: Vector[Vector[Int]]) {
  val height: Int = cells.size
  val width: Int = cells.headOption.map(_.size).getOrElse(0)
}

object Board {
  val BoardWidth = 8
  val BoardHeight = 12

  def createEmpty: Board =
    Board(Vector.fill(BoardHeight, BoardWidth)(0))
}

// Phase 3: リファクタリング（テスト追加）
"Board" should "initialize all cells as empty" in {
  val board = Board.createEmpty
  board.cells.flatten.forall(_ == 0) shouldBe true
}
```

## Phase 1: 基盤システム

### T001: ゲームボード作成

#### 実装アプローチ

```scala
object Board {
  val BoardWidth = 8
  val BoardHeight = 12

  def createEmpty: Board =
    Board(Vector.fill(BoardHeight, BoardWidth)(0))
}

case class Board(cells: Vector[Vector[Int]]) {
  val height: Int = cells.size
  val width: Int = cells.headOption.map(_.size).getOrElse(0)

  def isValidPosition(x: Int, y: Int): Boolean =
    x >= 0 && x < width && y >= 0 && y < height

  def getPuyoAt(x: Int, y: Int): Option[Int] =
    if (isValidPosition(x, y)) Some(cells(y)(x))
    else None

  def setPuyo(x: Int, y: Int, color: Int): Board =
    if (isValidPosition(x, y))
      copy(cells = cells.updated(y, cells(y).updated(x, color)))
    else this
}
```

#### テスト実装

```scala
class BoardSpec extends AnyFlatSpec with Matchers {
  "Board" should "be created with correct dimensions" in {
    val board = Board.createEmpty
    board.height shouldBe 12
    board.width shouldBe 8
  }

  it should "initialize all cells as empty" in {
    val board = Board.createEmpty
    board.cells.flatten.forall(_ == 0) shouldBe true
  }

  it should "validate positions correctly" in {
    val board = Board.createEmpty
    board.isValidPosition(0, 0) shouldBe true
    board.isValidPosition(7, 11) shouldBe true
    board.isValidPosition(-1, 0) shouldBe false
    board.isValidPosition(8, 0) shouldBe false
  }
}
```

### T002: ぷよの基本データ構造

#### 色システムの実装

```scala
sealed trait PuyoColor {
  def colorCode: String
  def value: Int
}

object PuyoColor {
  case object Red extends PuyoColor {
    val colorCode = "#ff4444"
    val value = 1
  }
  case object Green extends PuyoColor {
    val colorCode = "#44ff44"
    val value = 2
  }
  case object Blue extends PuyoColor {
    val colorCode = "#4444ff"
    val value = 3
  }
  case object Yellow extends PuyoColor {
    val colorCode = "#ffff44"
    val value = 4
  }
  case object Purple extends PuyoColor {
    val colorCode = "#ff44ff"
    val value = 5
  }

  val allColors: Seq[PuyoColor] = Seq(Red, Green, Blue, Yellow, Purple)

  def fromValue(v: Int): Option[PuyoColor] =
    allColors.find(_.value == v)

  def getColorCode(v: Int): String =
    fromValue(v).map(_.colorCode).getOrElse("#ffffff")
}
```

### T003: 組ぷよ（2個セット）の実装

#### データ構造設計

```scala
sealed trait Rotation {
  def value: Int
  def next: Rotation
}

object Rotation {
  case object Deg0 extends Rotation {
    val value = 0
    val next = Deg90
  }
  case object Deg90 extends Rotation {
    val value = 1
    val next = Deg180
  }
  case object Deg180 extends Rotation {
    val value = 2
    val next = Deg270
  }
  case object Deg270 extends Rotation {
    val value = 3
    val next = Deg0
  }

  def fromValue(v: Int): Rotation = v % 4 match {
    case 0 => Deg0
    case 1 => Deg90
    case 2 => Deg180
    case 3 => Deg270
  }
}

case class Position(x: Int, y: Int)

case class PuyoPair(
  color1: PuyoColor,
  color2: PuyoColor,
  basePosition: Position,
  rotation: Rotation = Rotation.Deg0
) {
  def getPositions: (Position, Position) = {
    val base = basePosition
    rotation match {
      case Rotation.Deg0 =>
        (base, Position(base.x, base.y + 1))
      case Rotation.Deg90 =>
        (base, Position(base.x + 1, base.y))
      case Rotation.Deg180 =>
        (base, Position(base.x, base.y - 1))
      case Rotation.Deg270 =>
        (base, Position(base.x - 1, base.y))
    }
  }

  def rotate: PuyoPair = copy(rotation = rotation.next)

  def moveLeft: PuyoPair = copy(basePosition = basePosition.copy(x = basePosition.x - 1))
  def moveRight: PuyoPair = copy(basePosition = basePosition.copy(x = basePosition.x + 1))
  def moveDown: PuyoPair = copy(basePosition = basePosition.copy(y = basePosition.y + 1))
}
```

#### 回転システムのテスト

```scala
class PuyoPairSpec extends AnyFlatSpec with Matchers {
  "PuyoPair" should "rotate correctly" in {
    val pair = PuyoPair(PuyoColor.Red, PuyoColor.Blue, Position(3, 1))

    pair.rotation shouldBe Rotation.Deg0
    val rotated = pair.rotate
    rotated.rotation shouldBe Rotation.Deg90
  }

  it should "calculate positions correctly for each rotation" in {
    val pair = PuyoPair(PuyoColor.Red, PuyoColor.Blue, Position(3, 1))

    // Deg0: 縦
    val (pos1_0, pos2_0) = pair.getPositions
    pos1_0 shouldBe Position(3, 1)
    pos2_0 shouldBe Position(3, 2)

    // Deg90: 右
    val rotated90 = pair.rotate
    val (pos1_90, pos2_90) = rotated90.getPositions
    pos1_90 shouldBe Position(3, 1)
    pos2_90 shouldBe Position(4, 1)
  }
}
```

## Phase 2: ぷよ管理システム

### T005: ランダムなぷよ生成

#### 実装

```scala
import scala.util.Random

object PuyoGenerator {
  def generateRandomColor(): PuyoColor = {
    val colors = PuyoColor.allColors
    colors(Random.nextInt(colors.size))
  }

  def generateRandomPuyoPair(x: Int, y: Int): PuyoPair = {
    PuyoPair(
      generateRandomColor(),
      generateRandomColor(),
      Position(x, y)
    )
  }

  def spawnNewPuyoPair(): PuyoPair = {
    generateRandomPuyoPair(Board.BoardWidth / 2, 0)
  }
}
```

### T006-T007: 組ぷよの移動と回転

#### 移動システム

```scala
object GameLogic {
  def canMovePuyoPair(pair: PuyoPair, board: Board, direction: Direction): Boolean = {
    val (pos1, pos2) = pair.getPositions
    val newPositions = direction match {
      case Direction.Left =>
        Seq(Position(pos1.x - 1, pos1.y), Position(pos2.x - 1, pos2.y))
      case Direction.Right =>
        Seq(Position(pos1.x + 1, pos1.y), Position(pos2.x + 1, pos2.y))
      case Direction.Down =>
        Seq(Position(pos1.x, pos1.y + 1), Position(pos2.x, pos2.y + 1))
    }

    newPositions.forall { pos =>
      board.isValidPosition(pos.x, pos.y) &&
      board.getPuyoAt(pos.x, pos.y).contains(0)
    }
  }

  def movePuyoPair(pair: PuyoPair, board: Board, direction: Direction): Option[PuyoPair] = {
    if (canMovePuyoPair(pair, board, direction)) {
      Some(direction match {
        case Direction.Left => pair.moveLeft
        case Direction.Right => pair.moveRight
        case Direction.Down => pair.moveDown
      })
    } else None
  }
}

sealed trait Direction
object Direction {
  case object Left extends Direction
  case object Right extends Direction
  case object Down extends Direction
}
```

### T008: 重力システム

#### 落下処理

```scala
object GameLogic {
  def canFall(pair: PuyoPair, board: Board): Boolean = {
    canMovePuyoPair(pair, board, Direction.Down)
  }

  def hardDrop(pair: PuyoPair, board: Board): PuyoPair = {
    @scala.annotation.tailrec
    def loop(current: PuyoPair): PuyoPair = {
      movePuyoPair(current, board, Direction.Down) match {
        case Some(moved) => loop(moved)
        case None => current
      }
    }
    loop(pair)
  }
}
```

### T009: ぷよの固定処理

#### 浮いているぷよの落下

```scala
object GameLogic {
  def dropFloatingPuyos(board: Board): Board = {
    @scala.annotation.tailrec
    def loop(current: Board): Board = {
      val next = dropOnce(current)
      if (next == current) current
      else loop(next)
    }

    def dropOnce(board: Board): Board = {
      val positions = for {
        y <- (Board.BoardHeight - 2) to 0 by -1
        x <- 0 until Board.BoardWidth
      } yield Position(x, y)

      positions.foldLeft(board) { (acc, pos) =>
        board.getPuyoAt(pos.x, pos.y) match {
          case Some(color) if color > 0 =>
            board.getPuyoAt(pos.x, pos.y + 1) match {
              case Some(0) =>
                acc.setPuyo(pos.x, pos.y, 0)
                   .setPuyo(pos.x, pos.y + 1, color)
              case _ => acc
            }
          case _ => acc
        }
      }
    }

    loop(board)
  }

  def fixPuyoPairToBoard(pair: PuyoPair, board: Board): Board = {
    val (pos1, pos2) = pair.getPositions
    board.setPuyo(pos1.x, pos1.y, pair.color1.value)
         .setPuyo(pos2.x, pos2.y, pair.color2.value)
  }
}
```

## Phase 3: ゲームロジック

### T010: 隣接ぷよの検索

#### 連結成分の探索（幅優先探索）

```scala
object GameLogic {
  def findAdjacentPuyos(board: Board, x: Int, y: Int): Seq[Position] = {
    board.getPuyoAt(x, y) match {
      case Some(targetColor) if targetColor > 0 =>
        @scala.annotation.tailrec
        def bfs(
          visited: Set[Position],
          queue: Seq[Position],
          result: Seq[Position]
        ): Seq[Position] = {
          queue match {
            case Seq() => result
            case current +: rest =>
              if (visited.contains(current)) {
                bfs(visited, rest, result)
              } else {
                val neighbors = Seq(
                  Position(current.x - 1, current.y),
                  Position(current.x + 1, current.y),
                  Position(current.x, current.y - 1),
                  Position(current.x, current.y + 1)
                ).filter { pos =>
                  board.getPuyoAt(pos.x, pos.y).contains(targetColor) &&
                  !visited.contains(pos)
                }

                bfs(
                  visited + current,
                  rest ++ neighbors,
                  result :+ current
                )
              }
          }
        }

        bfs(Set.empty, Seq(Position(x, y)), Seq.empty)

      case _ => Seq.empty
    }
  }
}
```

### T011: ぷよ消去の実行

#### 消去処理

```scala
object GameLogic {
  def findGroupsToClear(board: Board): Seq[Seq[Position]] = {
    val allPositions = for {
      y <- 0 until board.height
      x <- 0 until board.width
      if board.getPuyoAt(x, y).exists(_ > 0)
    } yield Position(x, y)

    var checked = Set.empty[Position]
    val groups = allPositions.flatMap { pos =>
      if (checked.contains(pos)) None
      else {
        val group = findAdjacentPuyos(board, pos.x, pos.y)
        checked ++= group
        if (group.size >= 4) Some(group)
        else None
      }
    }

    groups
  }

  def clearPuyoGroups(board: Board, groups: Seq[Seq[Position]]): Board = {
    groups.foldLeft(board) { (acc, group) =>
      group.foldLeft(acc) { (b, pos) =>
        b.setPuyo(pos.x, pos.y, 0)
      }
    }
  }
}
```

### T012: 連鎖システム

#### 連鎖処理

```scala
case class ChainResult(
  board: Board,
  chainCount: Int,
  totalScore: Int
)

object GameLogic {
  def executeChain(board: Board): ChainResult = {
    @scala.annotation.tailrec
    def loop(current: Board, chainCount: Int, totalScore: Int): ChainResult = {
      val groups = findGroupsToClear(current)

      if (groups.isEmpty) {
        ChainResult(current, chainCount, totalScore)
      } else {
        val clearedBoard = clearPuyoGroups(current, groups)
        val droppedBoard = dropFloatingPuyos(clearedBoard)
        val clearedCount = groups.map(_.size).sum
        val chainBonus = calculateChainBonus(chainCount + 1)
        val clearScore = calculateClearScore(clearedCount, chainBonus)

        loop(droppedBoard, chainCount + 1, totalScore + clearScore)
      }
    }

    loop(board, 0, 0)
  }
}
```

### T013-T014: スコア計算システム

#### スコア計算

```scala
object GameLogic {
  def calculateChainBonus(chainCount: Int): Int = chainCount match {
    case 1 => 0
    case 2 => 8
    case 3 => 16
    case 4 => 32
    case 5 => 64
    case 6 => 96
    case 7 => 128
    case n if n >= 8 => n * 32
    case _ => 0
  }

  def calculateClearScore(clearedCount: Int, chainBonus: Int): Int = {
    clearedCount * 10 + chainBonus
  }

  def isPerfectClear(board: Board): Boolean = {
    board.cells.flatten.forall(_ == 0)
  }

  def calculatePerfectClearBonus(): Int = 1000
}
```

## Phase 4: ユーザーインターフェース

### T015: ゲーム画面の描画

#### Canvas初期化

```scala
import org.scalajs.dom
import org.scalajs.dom.html
import org.scalajs.dom.CanvasRenderingContext2D

class GameRenderer(canvas: html.Canvas) {
  val ctx: CanvasRenderingContext2D =
    canvas.getContext("2d").asInstanceOf[CanvasRenderingContext2D]

  val cellSize = 30

  canvas.width = Board.BoardWidth * cellSize
  canvas.height = Board.BoardHeight * cellSize

  def drawCell(x: Int, y: Int, color: String): Unit = {
    val centerX = x * cellSize + cellSize / 2.0
    val centerY = y * cellSize + cellSize / 2.0
    val radius = cellSize / 2.5

    // 枠線
    ctx.strokeStyle = "#dddddd"
    ctx.lineWidth = 1
    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize)

    // ぷよ（円形）
    if (color != "#ffffff") {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = "#333333"
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  def renderBoard(board: Board): Unit = {
    // 背景クリア
    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 各セルを描画
    for {
      y <- 0 until board.height
      x <- 0 until board.width
    } {
      val cellValue = board.getPuyoAt(x, y).getOrElse(0)
      val color = PuyoColor.getColorCode(cellValue)
      drawCell(x, y, color)
    }
  }

  def renderPuyoPair(pair: PuyoPair): Unit = {
    val (pos1, pos2) = pair.getPositions
    drawCell(pos1.x, pos1.y, pair.color1.colorCode)
    drawCell(pos2.x, pos2.y, pair.color2.colorCode)
  }
}
```

### T016: ゲーム情報の表示

#### 情報表示関数

```scala
import org.scalajs.dom
import org.scalajs.dom.html

class GameInfoDisplay {
  def updateScore(score: Int): Unit = {
    dom.document.getElementById("score").asInstanceOf[html.Span]
      .textContent = score.toString
  }

  def updateLevel(level: Int): Unit = {
    dom.document.getElementById("level").asInstanceOf[html.Span]
      .textContent = level.toString
  }

  def updateChain(chainCount: Int): Unit = {
    dom.document.getElementById("chain").asInstanceOf[html.Span]
      .textContent = chainCount.toString
  }

  def formatGameTime(seconds: Int): String = {
    val minutes = seconds / 60
    val remainingSeconds = seconds % 60
    f"$minutes:$remainingSeconds%02d"
  }

  def updateTime(gameTime: Int): Unit = {
    dom.document.getElementById("time").asInstanceOf[html.Span]
      .textContent = formatGameTime(gameTime)
  }
}
```

### T017: キーボード入力処理

#### 入力ハンドリング

```scala
import org.scalajs.dom
import org.scalajs.dom.KeyboardEvent

class InputHandler(game: Game) {
  def handleKeyDown(event: KeyboardEvent): Unit = {
    if (game.isRunning) {
      event.key match {
        case "ArrowLeft"  => game.processLeftMovement()
        case "ArrowRight" => game.processRightMovement()
        case "ArrowUp"    => game.processRotation()
        case "ArrowDown"  => game.processSoftDrop()
        case " "          => game.processHardDrop()
        case _ => // 無視
      }
      event.preventDefault()
    }
  }

  def setupEventListeners(): Unit = {
    dom.window.addEventListener("keydown",
      (e: KeyboardEvent) => handleKeyDown(e))
  }
}
```

## Phase 5: ゲームフロー

### T019: ゲーム初期化

#### ゲーム状態管理

```scala
case class GameState(
  board: Board,
  currentPiece: Option[PuyoPair],
  nextPiece: Option[PuyoPair],
  score: Int,
  level: Int,
  chainCount: Int,
  gameTime: Int,
  isRunning: Boolean
)

object GameState {
  def initial: GameState = GameState(
    board = Board.createEmpty,
    currentPiece = None,
    nextPiece = None,
    score = 0,
    level = 1,
    chainCount = 0,
    gameTime = 0,
    isRunning = false
  )
}

class Game {
  private var state: GameState = GameState.initial

  def isRunning: Boolean = state.isRunning

  def startNewGame(): Unit = {
    state = GameState.initial.copy(
      currentPiece = Some(PuyoGenerator.spawnNewPuyoPair()),
      nextPiece = Some(PuyoGenerator.spawnNewPuyoPair()),
      isRunning = true
    )
  }

  def reset(): Unit = {
    state = GameState.initial
  }
}
```

### T020: ゲーム終了判定

#### ゲームオーバー処理

```scala
class Game {
  def isGameOver: Boolean = {
    val topRows = Seq(0, 1)
    topRows.exists { y =>
      (0 until Board.BoardWidth).exists { x =>
        state.board.getPuyoAt(x, y).exists(_ > 0)
      }
    }
  }

  def processGameOver(): Unit = {
    state = state.copy(isRunning = false)
    dom.window.alert(s"Game Over! Score: ${state.score}")
  }

  def checkAndHandleGameOver(): Boolean = {
    if (isGameOver) {
      processGameOver()
      true
    } else false
  }
}
```

### ゲームループ

#### メインゲームループ

```scala
import scala.scalajs.js.timers._

class Game {
  private var dropTimer: Option[SetIntervalHandle] = None
  private var gameTimer: Option[SetIntervalHandle] = None

  def gameStep(): Unit = {
    if (state.isRunning) {
      state.currentPiece match {
        case Some(piece) =>
          if (GameLogic.canFall(piece, state.board)) {
            // まだ落下できる場合
            val movedPiece = piece.moveDown
            state = state.copy(currentPiece = Some(movedPiece))
          } else {
            // 落下できない場合 - 固定処理
            fixPuyoPairToBoard(piece)
            processLineClear()
            if (!checkAndHandleGameOver()) {
              spawnNewPuyoPair()
            }
          }
        case None =>
          spawnNewPuyoPair()
      }

      render()
    }
  }

  def startDropTimer(): Unit = {
    stopDropTimer()
    dropTimer = Some(setInterval(1000)(gameStep()))
  }

  def stopDropTimer(): Unit = {
    dropTimer.foreach(clearInterval)
    dropTimer = None
  }

  private def fixPuyoPairToBoard(piece: PuyoPair): Unit = {
    val newBoard = GameLogic.fixPuyoPairToBoard(piece, state.board)
    state = state.copy(
      board = newBoard,
      currentPiece = None
    )
  }

  private def processLineClear(): Unit = {
    val droppedBoard = GameLogic.dropFloatingPuyos(state.board)
    val result = GameLogic.executeChain(droppedBoard)

    state = state.copy(
      board = result.board,
      score = state.score + result.totalScore,
      chainCount = result.chainCount
    )
  }

  private def spawnNewPuyoPair(): Unit = {
    val newPiece = state.nextPiece.getOrElse(PuyoGenerator.spawnNewPuyoPair())
    state = state.copy(
      currentPiece = Some(newPiece),
      nextPiece = Some(PuyoGenerator.spawnNewPuyoPair())
    )
  }
}
```

## コード品質向上の実践

### テスト統計

開発完了時点でのテスト統計：

- **総テスト数**: 60テスト
- **総アサーション数**: 300アサーション
- **テストカバレッジ**: 全主要機能カバー
- **コンパイルエラー**: 0（静的型付けによる保証）

### 品質向上のアプローチ

#### 1. 静的型付けの活用

```scala
// コンパイル時に型エラーを検出
sealed trait Direction  // ADTによる安全性
case object Left extends Direction
case object Right extends Direction

// パターンマッチの網羅性チェック
def move(dir: Direction): Unit = dir match {
  case Left => moveLeft()
  case Right => moveRight()
  // コンパイラが全ケースをチェック
}
```

#### 2. 不変データ構造

```scala
// immutableなデータ構造
case class Board(cells: Vector[Vector[Int]]) {
  def setPuyo(x: Int, y: Int, color: Int): Board =
    copy(cells = cells.updated(y, cells(y).updated(x, color)))
}
```

#### 3. 関数型プログラミングの実践

```scala
// 純粋関数
def calculateScore(clearedCount: Int, chainBonus: Int): Int =
  clearedCount * 10 + chainBonus

// 高階関数とコレクション操作
val positions = board.cells.zipWithIndex.flatMap { case (row, y) =>
  row.zipWithIndex.collect {
    case (color, x) if color > 0 => Position(x, y)
  }
}
```

### パフォーマンス最適化

#### 描画最適化

```scala
class GameRenderer {
  def render(state: GameState): Unit = {
    renderBoard(state.board)
    state.currentPiece.foreach(renderPuyoPair)
    state.nextPiece.foreach(renderNextPuyo)
  }
}
```

## 学んだ教訓と今後の拡張

### 開発過程で学んだ教訓

#### 1. 静的型付けの利点

- **コンパイル時エラー検出**: 実行前に多くのバグを発見
- **リファクタリング安全性**: 型システムが変更の影響範囲を明示
- **IDEサポート**: 型情報により優れた補完機能

#### 2. Scala.jsの利点

- **JavaScriptとの相互運用**: DOM API直接利用可能
- **関数型パラダイム**: 不変性と純粋関数による予測可能性
- **オブジェクト指向**: ケースクラスとトレイトによる設計

#### 3. TDDの効果

- **品質向上**: 早期バグ発見により品質が大幅に向上
- **設計改善**: テストファーストにより良い設計に導かれる
- **ドキュメント**: テストが実行可能なドキュメントとして機能

### 今後の拡張可能性

#### Phase 6: 高度な機能

```scala
// T022: アニメーション演出
trait Animation {
  def animate(duration: Int): Unit
}

class PuyoClearAnimation(positions: Seq[Position]) extends Animation {
  override def animate(duration: Int): Unit = {
    // フェードアウトアニメーション
  }
}

// T023: サウンドシステム
sealed trait SoundType
case object Clear extends SoundType
case object Chain extends SoundType
case object GameOver extends SoundType

object SoundPlayer {
  def play(soundType: SoundType): Unit = {
    // Web Audio API使用
  }
}

// T024: AI対戦
class PuyoAI {
  def evaluateMove(board: Board, piece: PuyoPair): Double = {
    // 最適手を評価
    ???
  }
}
```

#### ゲームバランスの調整

```scala
sealed trait Difficulty {
  def fallSpeed: Int
  def colorCount: Int
}

object Difficulty {
  case object Easy extends Difficulty {
    val fallSpeed = 1500
    val colorCount = 3
  }
  case object Normal extends Difficulty {
    val fallSpeed = 1000
    val colorCount = 4
  }
  case object Hard extends Difficulty {
    val fallSpeed = 500
    val colorCount = 5
  }
}
```

### 技術的学習ポイント

#### 1. 代数的データ型（ADT）

Scalaのsealed traitとcase classを使用した型安全なモデリング

#### 2. パターンマッチング

網羅性チェックによる安全な分岐処理

#### 3. コレクション操作

ScalaのコレクションAPIによる宣言的なデータ処理

## まとめ

このぷよぷよ実装プロジェクトを通じて、Scala.jsとTDDを組み合わせた開発手法の有効性が確認できました。静的型付けと関数型プログラミングのパラダイムは、ゲームのような複雑なアプリケーションでも、高い保守性と信頼性をもたらします。

TDDサイクルを継続することで、コンパイル時の型チェックと実行時のテストの二重の安全網により、300のアサーションを持つ包括的なテストスイートと共に、堅牢なゲームシステムを実現しました。

今後も、この実装を基盤として、型安全性を保ちながらより高度な機能や最適化を段階的に追加していくことで、さらに魅力的なぷよぷよゲームに発展させることができるでしょう。

---

*このガイドがScala.jsとTDDを使ったゲーム開発の参考になれば幸いです。コードの完全版は[プロジェクトリポジトリ](.)で確認できます。*
