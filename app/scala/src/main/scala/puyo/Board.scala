package puyo

// ========== ゲームボード ==========
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

  def isPerfectClear: Boolean =
    cells.flatten.forall(_ == 0)
}

object Board {
  val BoardWidth = 8
  val BoardHeight = 12

  def createEmpty: Board =
    Board(Vector.fill(BoardHeight, BoardWidth)(0))
}
