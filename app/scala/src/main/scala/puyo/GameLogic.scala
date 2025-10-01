package puyo

import scala.annotation.tailrec

// ========== ゲームロジック ==========
object GameLogic {

  // ========== 移動判定 ==========
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

  // ========== 落下判定 ==========
  def canFall(pair: PuyoPair, board: Board): Boolean = {
    canMovePuyoPair(pair, board, Direction.Down)
  }

  def hardDrop(pair: PuyoPair, board: Board): PuyoPair = {
    @tailrec
    def loop(current: PuyoPair): PuyoPair = {
      movePuyoPair(current, board, Direction.Down) match {
        case Some(moved) => loop(moved)
        case None => current
      }
    }
    loop(pair)
  }

  // ========== ぷよ固定 ==========
  def fixPuyoPairToBoard(pair: PuyoPair, board: Board): Board = {
    val (pos1, pos2) = pair.getPositions
    board.setPuyo(pos1.x, pos1.y, pair.color1.value)
         .setPuyo(pos2.x, pos2.y, pair.color2.value)
  }

  // ========== 浮遊ぷよ落下 ==========
  def dropFloatingPuyos(board: Board): Board = {
    @tailrec
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

  // ========== 隣接ぷよ検索（BFS） ==========
  def findAdjacentPuyos(board: Board, x: Int, y: Int): Seq[Position] = {
    board.getPuyoAt(x, y) match {
      case Some(targetColor) if targetColor > 0 =>
        @tailrec
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

  // ========== 消去対象グループ検索 ==========
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

  // ========== ぷよ消去 ==========
  def clearPuyoGroups(board: Board, groups: Seq[Seq[Position]]): Board = {
    groups.foldLeft(board) { (acc, group) =>
      group.foldLeft(acc) { (b, pos) =>
        b.setPuyo(pos.x, pos.y, 0)
      }
    }
  }

  // ========== 連鎖実行 ==========
  def executeChain(board: Board): ChainResult = {
    @tailrec
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

  // ========== スコア計算 ==========
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

  def calculatePerfectClearBonus(): Int = 1000

  // ========== ゲームオーバー判定 ==========
  def isGameOver(board: Board): Boolean = {
    val topRows = Seq(0, 1)
    topRows.exists { y =>
      (0 until Board.BoardWidth).exists { x =>
        board.getPuyoAt(x, y).exists(_ > 0)
      }
    }
  }
}
