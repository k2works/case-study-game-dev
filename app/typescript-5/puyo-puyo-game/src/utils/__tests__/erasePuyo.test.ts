import { checkErasePuyo, findConnectedPuyo, erasePuyoFromGrid, fallPuyo } from '../erasePuyo'
import { PuyoColor } from '../../models/PuyoColor'

describe('erasePuyo', () => {
  describe('findConnectedPuyo', () => {
    it('同じ色のぷよが4つつながっていると、接続されたぷよのリストが返される', () => {
      // ステージにぷよを配置（REDは赤ぷよ）
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 R R 0 0 0  (y=10)
      // 0 R R 0 0 0  (y=11)
      const grid: PuyoColor[][] = Array(13)
        .fill(null)
        .map(() => Array(6).fill(PuyoColor.EMPTY))

      grid[10][1] = PuyoColor.RED
      grid[10][2] = PuyoColor.RED
      grid[11][1] = PuyoColor.RED
      grid[11][2] = PuyoColor.RED

      // 接続判定
      const connected = findConnectedPuyo(grid, 1, 10)

      // 4つのぷよが接続されていることを確認
      expect(connected.length).toBe(4)
      expect(connected).toContainEqual({ x: 1, y: 10 })
      expect(connected).toContainEqual({ x: 2, y: 10 })
      expect(connected).toContainEqual({ x: 1, y: 11 })
      expect(connected).toContainEqual({ x: 2, y: 11 })
    })

    it('異なる色のぷよは接続されない', () => {
      // ステージにぷよを配置（REDは赤ぷよ、BLUEは青ぷよ）
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 R B 0 0 0  (y=10)
      // 0 B R 0 0 0  (y=11)
      const grid: PuyoColor[][] = Array(13)
        .fill(null)
        .map(() => Array(6).fill(PuyoColor.EMPTY))

      grid[10][1] = PuyoColor.RED
      grid[10][2] = PuyoColor.BLUE
      grid[11][1] = PuyoColor.BLUE
      grid[11][2] = PuyoColor.RED

      // 接続判定
      const connected = findConnectedPuyo(grid, 1, 10)

      // 同じ色のぷよ1つだけが返される
      expect(connected.length).toBe(1)
      expect(connected).toContainEqual({ x: 1, y: 10 })
    })
  })

  describe('checkErasePuyo', () => {
    it('横に4つ並んだぷよが消去対象として返される', () => {
      const grid: PuyoColor[][] = Array(13)
        .fill(null)
        .map(() => Array(6).fill(PuyoColor.EMPTY))

      // 横に4つ並べる
      grid[11][0] = PuyoColor.RED
      grid[11][1] = PuyoColor.RED
      grid[11][2] = PuyoColor.RED
      grid[11][3] = PuyoColor.RED

      // 消去判定
      const eraseGroups = checkErasePuyo(grid)

      // 1つのグループが消去対象になる
      expect(eraseGroups.length).toBe(1)
      expect(eraseGroups[0].length).toBe(4)

      // 全ての位置が含まれているか確認
      expect(eraseGroups[0]).toContainEqual({ x: 0, y: 11 })
      expect(eraseGroups[0]).toContainEqual({ x: 1, y: 11 })
      expect(eraseGroups[0]).toContainEqual({ x: 2, y: 11 })
      expect(eraseGroups[0]).toContainEqual({ x: 3, y: 11 })
    })

    it('4つ以上つながったぷよのグループが消去対象として返される', () => {
      const grid: PuyoColor[][] = Array(13)
        .fill(null)
        .map(() => Array(6).fill(PuyoColor.EMPTY))

      grid[10][1] = PuyoColor.RED
      grid[10][2] = PuyoColor.RED
      grid[11][1] = PuyoColor.RED
      grid[11][2] = PuyoColor.RED

      // 消去判定
      const eraseGroups = checkErasePuyo(grid)

      // 1つのグループが消去対象になる
      expect(eraseGroups.length).toBe(1)
      expect(eraseGroups[0].length).toBe(4)
    })

    it('3つ以下のつながりは消去対象にならない', () => {
      const grid: PuyoColor[][] = Array(13)
        .fill(null)
        .map(() => Array(6).fill(PuyoColor.EMPTY))

      grid[11][1] = PuyoColor.RED
      grid[11][2] = PuyoColor.RED
      grid[11][3] = PuyoColor.RED

      // 消去判定
      const eraseGroups = checkErasePuyo(grid)

      // 消去対象なし
      expect(eraseGroups.length).toBe(0)
    })

    it('複数のグループが消去対象になる', () => {
      const grid: PuyoColor[][] = Array(13)
        .fill(null)
        .map(() => Array(6).fill(PuyoColor.EMPTY))

      // 赤ぷよのグループ（4つ）
      grid[10][0] = PuyoColor.RED
      grid[10][1] = PuyoColor.RED
      grid[11][0] = PuyoColor.RED
      grid[11][1] = PuyoColor.RED

      // 青ぷよのグループ（4つ）
      grid[10][4] = PuyoColor.BLUE
      grid[10][5] = PuyoColor.BLUE
      grid[11][4] = PuyoColor.BLUE
      grid[11][5] = PuyoColor.BLUE

      // 消去判定
      const eraseGroups = checkErasePuyo(grid)

      // 2つのグループが消去対象になる
      expect(eraseGroups.length).toBe(2)
    })
  })

  describe('erasePuyoFromGrid', () => {
    it('消去対象のぷよを消去する', () => {
      const grid: PuyoColor[][] = Array(13)
        .fill(null)
        .map(() => Array(6).fill(PuyoColor.EMPTY))

      grid[10][1] = PuyoColor.RED
      grid[10][2] = PuyoColor.RED
      grid[11][1] = PuyoColor.RED
      grid[11][2] = PuyoColor.RED

      // 消去判定
      const eraseGroups = checkErasePuyo(grid)

      // 消去実行
      const newGrid = erasePuyoFromGrid(grid, eraseGroups)

      // ぷよが消去されていることを確認
      expect(newGrid[10][1]).toBe(PuyoColor.EMPTY)
      expect(newGrid[10][2]).toBe(PuyoColor.EMPTY)
      expect(newGrid[11][1]).toBe(PuyoColor.EMPTY)
      expect(newGrid[11][2]).toBe(PuyoColor.EMPTY)
    })

    it('横に並んだ4つのぷよを全て消去する（右端を含む）', () => {
      const grid: PuyoColor[][] = Array(13)
        .fill(null)
        .map(() => Array(6).fill(PuyoColor.EMPTY))

      // 右端を含む横並び（x=2,3,4,5）
      grid[11][2] = PuyoColor.RED
      grid[11][3] = PuyoColor.RED
      grid[11][4] = PuyoColor.RED
      grid[11][5] = PuyoColor.RED

      // 消去判定
      const eraseGroups = checkErasePuyo(grid)

      // グループが1つ検出されることを確認
      expect(eraseGroups.length).toBe(1)
      expect(eraseGroups[0].length).toBe(4)

      // 全ての位置が含まれているか確認
      expect(eraseGroups[0]).toContainEqual({ x: 2, y: 11 })
      expect(eraseGroups[0]).toContainEqual({ x: 3, y: 11 })
      expect(eraseGroups[0]).toContainEqual({ x: 4, y: 11 })
      expect(eraseGroups[0]).toContainEqual({ x: 5, y: 11 })

      // 消去実行
      const newGrid = erasePuyoFromGrid(grid, eraseGroups)

      // 全てのぷよが消去されていることを確認（特に右端 x=5）
      expect(newGrid[11][2]).toBe(PuyoColor.EMPTY)
      expect(newGrid[11][3]).toBe(PuyoColor.EMPTY)
      expect(newGrid[11][4]).toBe(PuyoColor.EMPTY)
      expect(newGrid[11][5]).toBe(PuyoColor.EMPTY)
    })
  })

  describe('fallPuyo', () => {
    it('消去後、上にあるぷよが落下する', () => {
      const grid: PuyoColor[][] = Array(13)
        .fill(null)
        .map(() => Array(6).fill(PuyoColor.EMPTY))

      // ステージにぷよを配置
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 B 0 0 0  (y=8)
      // 0 0 B 0 0 0  (y=9)
      // 0 R R 0 0 0  (y=10)
      // 0 R R 0 0 0  (y=11)
      grid[10][1] = PuyoColor.RED
      grid[10][2] = PuyoColor.RED
      grid[11][1] = PuyoColor.RED
      grid[11][2] = PuyoColor.RED
      grid[8][2] = PuyoColor.BLUE
      grid[9][2] = PuyoColor.BLUE

      // 消去判定と実行
      const eraseGroups = checkErasePuyo(grid)
      const erasedGrid = erasePuyoFromGrid(grid, eraseGroups)

      // 落下処理
      const fallenGrid = fallPuyo(erasedGrid)

      // 上にあったぷよが落下していることを確認
      expect(fallenGrid[10][2]).toBe(PuyoColor.BLUE)
      expect(fallenGrid[11][2]).toBe(PuyoColor.BLUE)
      // 元の位置は空になっている
      expect(fallenGrid[8][2]).toBe(PuyoColor.EMPTY)
      expect(fallenGrid[9][2]).toBe(PuyoColor.EMPTY)
    })

    it('複数の列で独立して落下する', () => {
      const grid: PuyoColor[][] = Array(13)
        .fill(null)
        .map(() => Array(6).fill(PuyoColor.EMPTY))

      // 列0にぷよ
      grid[8][0] = PuyoColor.RED
      grid[11][0] = PuyoColor.RED

      // 列2にぷよ
      grid[7][2] = PuyoColor.BLUE
      grid[11][2] = PuyoColor.BLUE

      const fallenGrid = fallPuyo(grid)

      // 列0のぷよが落下
      expect(fallenGrid[10][0]).toBe(PuyoColor.RED)
      expect(fallenGrid[11][0]).toBe(PuyoColor.RED)

      // 列2のぷよが落下
      expect(fallenGrid[10][2]).toBe(PuyoColor.BLUE)
      expect(fallenGrid[11][2]).toBe(PuyoColor.BLUE)
    })
  })

  describe('連鎖反応', () => {
    it('ぷよの消去と落下後、新たな消去パターンがあれば連鎖が発生する', () => {
      const grid: PuyoColor[][] = Array(13)
        .fill(null)
        .map(() => Array(6).fill(PuyoColor.EMPTY))

      // ステージにぷよを配置
      // 赤ぷよの2×2と、その上に緑ぷよが縦に3つ、さらに緑ぷよが1つ横に
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 G 0 0 0  (y=7)
      // 0 0 G 0 0 0  (y=8)
      // 0 0 G 0 0 0  (y=9)
      // 0 R R G 0 0  (y=10)
      // 0 R R 0 0 0  (y=11)
      grid[10][1] = PuyoColor.RED // 赤
      grid[10][2] = PuyoColor.RED // 赤
      grid[11][1] = PuyoColor.RED // 赤
      grid[11][2] = PuyoColor.RED // 赤
      grid[10][3] = PuyoColor.GREEN // 緑（横）
      grid[7][2] = PuyoColor.GREEN // 緑（上）
      grid[8][2] = PuyoColor.GREEN // 緑（上）
      grid[9][2] = PuyoColor.GREEN // 緑（上）

      // 1回目の消去判定
      const eraseInfo1 = checkErasePuyo(grid)

      // 赤ぷよが消去対象になっていることを確認
      expect(eraseInfo1.length).toBe(1)
      expect(eraseInfo1[0].length).toBe(4)

      // 1回目の消去実行
      const erasedGrid1 = erasePuyoFromGrid(grid, eraseInfo1)

      // 落下処理
      const fallenGrid1 = fallPuyo(erasedGrid1)

      // 2回目の消去判定（連鎖）
      const eraseInfo2 = checkErasePuyo(fallenGrid1)

      // 連鎖が発生していることを確認（緑ぷよが4つつながっている）
      expect(eraseInfo2.length).toBe(1)
      expect(eraseInfo2[0].length).toBe(4)

      // 落下後の緑ぷよの位置を確認
      // 列2の緑ぷよ3つと列3の緑ぷよ1つがそれぞれ落下し、L字型に4つつながる
      // 0  1  2  3  4  5
      // .  .  .  .  .  .  (y=7)
      // .  .  .  .  .  .  (y=8)
      // .  .  G  .  .  .  (y=9)
      // .  .  G  .  .  .  (y=10)
      // .  .  G  G  .  .  (y=11)
      expect(fallenGrid1[11][2]).toBe(PuyoColor.GREEN) // 列2の一番下
      expect(fallenGrid1[10][2]).toBe(PuyoColor.GREEN) // 列2
      expect(fallenGrid1[9][2]).toBe(PuyoColor.GREEN) // 列2
      expect(fallenGrid1[11][3]).toBe(PuyoColor.GREEN) // 列3（落下してきたぷよ）
      // 赤ぷよの位置は空
      expect(fallenGrid1[10][1]).toBe(PuyoColor.EMPTY)
      expect(fallenGrid1[11][1]).toBe(PuyoColor.EMPTY)
    })
  })
})
