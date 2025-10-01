package puyo

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class PuyoGeneratorSpec extends AnyFlatSpec with Matchers {

  "PuyoGenerator.generateRandomColor" should "5種類のぷよ色のいずれかを返す" in {
    val validColors = Set(
      PuyoColor.Red,
      PuyoColor.Green,
      PuyoColor.Blue,
      PuyoColor.Yellow,
      PuyoColor.Purple
    )

    // 100回生成して全て有効な色であることを確認
    for (_ <- 1 to 100) {
      val color = PuyoGenerator.generateRandomColor()
      validColors should contain(color)
    }
  }

  it should "ランダムに色を生成する（確率的テスト）" in {
    // 1000回生成して、少なくとも3種類以上の色が出現することを確認
    val colors = (1 to 1000).map(_ => PuyoGenerator.generateRandomColor()).toSet
    colors.size should be >= 3
  }

  "PuyoGenerator.spawnNewPuyoPair" should "ボード中央上部にぷよペアを生成する" in {
    val pair = PuyoGenerator.spawnNewPuyoPair()

    pair.basePosition.x shouldBe 4 // 幅8の中央（8 / 2 = 4）
    pair.basePosition.y shouldBe 0 // 上部
  }

  it should "回転状態がDeg0である" in {
    val pair = PuyoGenerator.spawnNewPuyoPair()
    pair.rotation shouldBe Rotation.Deg0
  }

  it should "毎回異なるぷよペアを生成する可能性がある" in {
    // 100回生成して、少なくとも1組は異なるペアが存在することを確認
    val pairs = (1 to 100).map(_ => PuyoGenerator.spawnNewPuyoPair())
    val uniquePairs = pairs.map(p => (p.color1, p.color2)).toSet

    // 5色から2つ選ぶので、理論上は最大25パターン
    // 100回生成すれば複数のパターンが出るはず
    uniquePairs.size should be > 1
  }

  it should "有効な色のペアを生成する" in {
    val validColors = Set(
      PuyoColor.Red,
      PuyoColor.Green,
      PuyoColor.Blue,
      PuyoColor.Yellow,
      PuyoColor.Purple
    )

    for (_ <- 1 to 50) {
      val pair = PuyoGenerator.spawnNewPuyoPair()
      validColors should contain(pair.color1)
      validColors should contain(pair.color2)
    }
  }

  it should "同じ色のペアを生成することもある" in {
    // 1000回生成すれば、少なくとも1回は同じ色のペアが出るはず
    val pairs = (1 to 1000).map(_ => PuyoGenerator.spawnNewPuyoPair())
    val hasSameColorPair = pairs.exists(p => p.color1 == p.color2)

    hasSameColorPair shouldBe true
  }
}
