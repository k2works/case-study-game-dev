package puyo

// ========== ぷよの色定義 ==========
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

// ========== 回転状態 ==========
sealed trait Rotation {
  def value: Int
  def next: Rotation
}

object Rotation {
  case object Deg0 extends Rotation {
    val value = 0
    val next: Rotation = Deg90
  }
  case object Deg90 extends Rotation {
    val value = 1
    val next: Rotation = Deg180
  }
  case object Deg180 extends Rotation {
    val value = 2
    val next: Rotation = Deg270
  }
  case object Deg270 extends Rotation {
    val value = 3
    val next: Rotation = Deg0
  }

  def fromValue(v: Int): Rotation = (v % 4) match {
    case 0 => Deg0
    case 1 => Deg90
    case 2 => Deg180
    case 3 => Deg270
    case _ => Deg0 // unreachable
  }
}

// ========== 位置 ==========
case class Position(x: Int, y: Int)

// ========== 移動方向 ==========
sealed trait Direction
object Direction {
  case object Left extends Direction
  case object Right extends Direction
  case object Down extends Direction
}

// ========== 組ぷよ ==========
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

// ========== 連鎖結果 ==========
case class ChainResult(
  board: Board,
  chainCount: Int,
  totalScore: Int
)
