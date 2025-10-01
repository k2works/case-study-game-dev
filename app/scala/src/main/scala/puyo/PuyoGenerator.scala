package puyo

import scala.util.Random

// ========== ランダムぷよ生成 ==========
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
