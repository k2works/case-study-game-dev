package puyo

import org.scalajs.dom
import org.scalajs.dom.{document, window, html}
import org.scalajs.dom.CanvasRenderingContext2D
import scala.scalajs.js.timers._

object Main {
  def main(args: Array[String]): Unit = {
    window.addEventListener("load", { (_: dom.Event) =>
      setupGame()
    })
  }

  def setupGame(): Unit = {
    val canvas = document.getElementById("stage").asInstanceOf[html.Canvas]
    val game = new Game(canvas)
    game.initialize()
    game.start()
  }
}

// ========== ゲーム状態 ==========
case class GameState(
  board: Board,
  currentPiece: Option[PuyoPair],
  nextPiece: Option[PuyoPair],
  score: Int,
  level: Int,
  chainCount: Int,
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
    isRunning = false
  )
}

// ========== ゲーム管理 ==========
class Game(canvas: html.Canvas) {
  private var state: GameState = GameState.initial
  private val renderer = new GameRenderer(canvas)
  private var dropTimer: Option[SetIntervalHandle] = None

  val cellSize = 24

  def initialize(): Unit = {
    canvas.width = Board.BoardWidth * cellSize
    canvas.height = Board.BoardHeight * cellSize

    setupEventListeners()

    state = GameState.initial.copy(
      currentPiece = Some(PuyoGenerator.spawnNewPuyoPair()),
      nextPiece = Some(PuyoGenerator.spawnNewPuyoPair()),
      isRunning = true
    )
  }

  def start(): Unit = {
    startDropTimer()
    render()
  }

  private def setupEventListeners(): Unit = {
    window.addEventListener("keydown", { (e: dom.KeyboardEvent) =>
      handleKeyDown(e)
    })

    // リスタートボタン
    Option(document.getElementById("restart")).foreach { btn =>
      btn.addEventListener("click", { (_: dom.Event) =>
        restart()
      })
    }
  }

  private def handleKeyDown(event: dom.KeyboardEvent): Unit = {
    if (state.isRunning) {
      event.key match {
        case "ArrowLeft"  => processLeftMovement()
        case "ArrowRight" => processRightMovement()
        case "ArrowUp"    => processRotation()
        case "ArrowDown"  => processSoftDrop()
        case " "          => processHardDrop()
        case _ => // 無視
      }
      event.preventDefault()
      render()
    }
  }

  private def processLeftMovement(): Unit = {
    state.currentPiece.foreach { piece =>
      GameLogic.movePuyoPair(piece, state.board, Direction.Left).foreach { moved =>
        state = state.copy(currentPiece = Some(moved))
      }
    }
  }

  private def processRightMovement(): Unit = {
    state.currentPiece.foreach { piece =>
      GameLogic.movePuyoPair(piece, state.board, Direction.Right).foreach { moved =>
        state = state.copy(currentPiece = Some(moved))
      }
    }
  }

  private def processRotation(): Unit = {
    state.currentPiece.foreach { piece =>
      val rotated = piece.rotate
      val (pos1, pos2) = rotated.getPositions

      // 回転後の位置が有効かチェック
      if (state.board.isValidPosition(pos1.x, pos1.y) &&
          state.board.isValidPosition(pos2.x, pos2.y) &&
          state.board.getPuyoAt(pos1.x, pos1.y).contains(0) &&
          state.board.getPuyoAt(pos2.x, pos2.y).contains(0)) {
        state = state.copy(currentPiece = Some(rotated))
      }
    }
  }

  private def processSoftDrop(): Unit = {
    state.currentPiece.foreach { piece =>
      GameLogic.movePuyoPair(piece, state.board, Direction.Down).foreach { moved =>
        state = state.copy(currentPiece = Some(moved))
      }
    }
  }

  private def processHardDrop(): Unit = {
    state.currentPiece.foreach { piece =>
      val dropped = GameLogic.hardDrop(piece, state.board)
      state = state.copy(currentPiece = Some(dropped))
      gameStep() // 即座に固定処理
    }
  }

  private def gameStep(): Unit = {
    if (state.isRunning) {
      state.currentPiece match {
        case Some(piece) =>
          if (GameLogic.canFall(piece, state.board)) {
            val movedPiece = piece.moveDown
            state = state.copy(currentPiece = Some(movedPiece))
          } else {
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

    updateScoreDisplay()
  }

  private def spawnNewPuyoPair(): Unit = {
    val newPiece = state.nextPiece.getOrElse(PuyoGenerator.spawnNewPuyoPair())
    state = state.copy(
      currentPiece = Some(newPiece),
      nextPiece = Some(PuyoGenerator.spawnNewPuyoPair())
    )
  }

  private def checkAndHandleGameOver(): Boolean = {
    if (GameLogic.isGameOver(state.board)) {
      state = state.copy(isRunning = false)
      showGameOver()
      true
    } else false
  }

  private def showGameOver(): Unit = {
    Option(document.getElementById("gameOver")).foreach { elem =>
      elem.asInstanceOf[html.Div].style.display = "flex"
    }
  }

  private def restart(): Unit = {
    Option(document.getElementById("gameOver")).foreach { elem =>
      elem.asInstanceOf[html.Div].style.display = "none"
    }

    state = GameState.initial.copy(
      currentPiece = Some(PuyoGenerator.spawnNewPuyoPair()),
      nextPiece = Some(PuyoGenerator.spawnNewPuyoPair()),
      isRunning = true
    )

    updateScoreDisplay()
    render()
  }

  private def startDropTimer(): Unit = {
    stopDropTimer()
    dropTimer = Some(setInterval(1000)(gameStep()))
  }

  private def stopDropTimer(): Unit = {
    dropTimer.foreach(clearInterval)
    dropTimer = None
  }

  private def render(): Unit = {
    renderer.renderBoard(state.board)
    state.currentPiece.foreach(renderer.renderPuyoPair)
  }

  private def updateScoreDisplay(): Unit = {
    Option(document.getElementById("score")).foreach { elem =>
      elem.asInstanceOf[html.Span].textContent = state.score.toString
    }
    Option(document.getElementById("level")).foreach { elem =>
      elem.asInstanceOf[html.Span].textContent = state.level.toString
    }
    Option(document.getElementById("chain")).foreach { elem =>
      elem.asInstanceOf[html.Span].textContent = state.chainCount.toString
    }
  }
}

// ========== レンダラー ==========
class GameRenderer(canvas: html.Canvas) {
  val ctx: CanvasRenderingContext2D =
    canvas.getContext("2d").asInstanceOf[CanvasRenderingContext2D]

  val cellSize = 24

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

  private def drawCell(x: Int, y: Int, color: String): Unit = {
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
      ctx.arc(centerX, centerY, radius, 0, 2 * math.Pi)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = "#333333"
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
}
