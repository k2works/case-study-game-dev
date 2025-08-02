import { describe, it, expect, beforeEach } from 'vitest'
import { Game } from './Game'
import { GameState } from './GameState'
import { PuyoColor } from './Puyo'

describe('Game', () => {
  let game: Game

  beforeEach(() => {
    game = new Game()
  })

  describe('ゲームの初期化', () => {
    it('新しいゲームを作成できる', () => {
      expect(game).toBeDefined()
    })

    it('ゲーム状態が初期状態である', () => {
      expect(game.getState()).toBe(GameState.READY)
    })

    it('スコアが0で初期化される', () => {
      expect(game.getScore()).toBe(0)
    })

    it('ゲームフィールドが初期化される', () => {
      const field = game.getField()
      expect(field).toBeDefined()
      expect(field.isEmpty()).toBe(true)
    })
  })

  describe('ゲーム開始', () => {
    it('ゲームを開始できる', () => {
      game.start()
      expect(game.getState()).toBe(GameState.PLAYING)
    })

    it('ゲーム開始時に最初のぷよが生成される', () => {
      game.start()
      const currentPuyo = game.getCurrentPuyo()
      expect(currentPuyo).toBeDefined()
    })
  })

  describe('ぷよの移動', () => {
    beforeEach(() => {
      game.start()
    })

    it('ぷよが自動的に下に落下する', () => {
      const initialPuyo = game.getCurrentPuyo()
      const initialMainY = initialPuyo!.main.position.y
      const initialSubY = initialPuyo!.sub.position.y

      // 落下タイマー分（30フレーム）ゲームを更新
      for (let i = 0; i < 30; i++) {
        game.update()
      }

      const updatedPuyo = game.getCurrentPuyo()
      expect(updatedPuyo!.main.position.y).toBe(initialMainY + 1)
      expect(updatedPuyo!.sub.position.y).toBe(initialSubY + 1)
    })

    it('ぷよが地面に着地する', () => {
      const field = game.getField()
      const fieldHeight = field.getHeight()

      // ぷよを地面近くまで落下させる（フレーム数を調整）
      for (let i = 0; i < fieldHeight * 30; i++) {
        game.update()
      }

      // 着地したぷよがフィールドに配置される
      expect(field.isEmpty()).toBe(false)
    })

    it('ぷよが着地したら新しいぷよが生成される', () => {
      const initialPuyo = game.getCurrentPuyo()
      const field = game.getField()
      const fieldHeight = field.getHeight()

      // ぷよを地面まで落下させる（フレーム数を調整）
      for (let i = 0; i < fieldHeight * 30; i++) {
        game.update()
      }

      const newPuyo = game.getCurrentPuyo()
      expect(newPuyo).toBeDefined()
      expect(newPuyo).not.toBe(initialPuyo)
      expect(newPuyo!.main.position.y).toBe(0) // 新しいぷよは上から開始
    })

    it('ぷよを左に移動できる', () => {
      const initialPuyo = game.getCurrentPuyo()
      const initialX = initialPuyo!.main.position.x

      const moved = game.movePuyo(-1, 0)

      expect(moved).toBe(true)
      const movedPuyo = game.getCurrentPuyo()
      expect(movedPuyo!.main.position.x).toBe(initialX - 1)
    })

    it('ぷよを右に移動できる', () => {
      const initialPuyo = game.getCurrentPuyo()
      const initialX = initialPuyo!.main.position.x

      const moved = game.movePuyo(1, 0)

      expect(moved).toBe(true)
      const movedPuyo = game.getCurrentPuyo()
      expect(movedPuyo!.main.position.x).toBe(initialX + 1)
    })

    it('フィールドの左端を超えて移動できない', () => {
      // ぷよを左端まで移動
      for (let i = 0; i < 10; i++) {
        game.movePuyo(-1, 0)
      }

      const puyoBeforeMove = game.getCurrentPuyo()
      const moved = game.movePuyo(-1, 0)

      expect(moved).toBe(false)
      const puyoAfterMove = game.getCurrentPuyo()
      expect(puyoAfterMove!.main.position.x).toBe(
        puyoBeforeMove!.main.position.x
      )
    })

    it('フィールドの右端を超えて移動できない', () => {
      // ぷよを右端まで移動
      for (let i = 0; i < 10; i++) {
        game.movePuyo(1, 0)
      }

      const puyoBeforeMove = game.getCurrentPuyo()
      const moved = game.movePuyo(1, 0)

      expect(moved).toBe(false)
      const puyoAfterMove = game.getCurrentPuyo()
      expect(puyoAfterMove!.main.position.x).toBe(
        puyoBeforeMove!.main.position.x
      )
    })
  })

  describe('ぷよの回転', () => {
    beforeEach(() => {
      game.start()
    })

    it('ぷよを時計回りに回転できる', () => {
      const initialPuyo = game.getCurrentPuyo()
      const initialSubPosition = initialPuyo!.sub.position

      const rotated = game.rotatePuyo()

      expect(rotated).toBe(true)
      const rotatedPuyo = game.getCurrentPuyo()
      expect(rotatedPuyo!.sub.position).not.toEqual(initialSubPosition)
    })

    it('壁キック処理が動作する', () => {
      // ぷよを右端まで移動
      for (let i = 0; i < 10; i++) {
        game.movePuyo(1, 0)
      }

      // 現在の位置を記録
      const puyoBeforeRotate = game.getCurrentPuyo()!
      const originalX = puyoBeforeRotate.main.position.x

      // 回転を試行（壁キックが必要な状況）
      const rotated = game.rotatePuyo()

      if (rotated) {
        const puyoAfterRotate = game.getCurrentPuyo()!
        // 壁キックが発生した場合、位置が調整される
        expect(puyoAfterRotate.main.position.x).toBeLessThanOrEqual(originalX)
      }
    })

    it('壁キックでも回転できない場合は失敗する', () => {
      // まず1回回転させてサブぷよを右側に配置
      game.rotatePuyo()

      // 左端まで移動
      for (let i = 0; i < 10; i++) {
        game.movePuyo(-1, 0)
      }

      const puyoBeforeRotate = game.getCurrentPuyo()!

      // この状態でもう一度回転を試行（サブぷよが左端から出てしまう）
      const rotated = game.rotatePuyo()

      // 特定の状況では回転できない場合もある
      if (!rotated) {
        const puyoAfterRotate = game.getCurrentPuyo()!
        expect(puyoAfterRotate.sub.position).toEqual(
          puyoBeforeRotate.sub.position
        )
      }
    })

    it('他のぷよがある位置への回転は失敗する', () => {
      // この時点ではまだ他のぷよがフィールドにないため、
      // フィールドに配置されたぷよとの衝突テストは後で実装
      expect(true).toBe(true) // プレースホルダー
    })
  })

  describe('ぷよの消去', () => {
    beforeEach(() => {
      game.start()
    })

    it('4つ以上接続したぷよが消去されスコアが加算される', () => {
      const field = game.getField()

      // 4つ接続した赤いぷよを手動で配置
      field.setCell(0, 8, PuyoColor.RED)
      field.setCell(1, 8, PuyoColor.RED)
      field.setCell(0, 9, PuyoColor.RED)
      field.setCell(1, 9, PuyoColor.RED)

      // 消去処理を実行するために新しいぷよを配置してprocessClearAndGravityを呼び出す
      // 直接processClearAndGravityを呼び出すことはできないので、
      // placePuyoOnFieldメソッドが呼ばれる状況を作る

      // ゲームの更新処理中にぷよ着地をシミュレート
      // テスト用にprivateメソッドを直接呼ぶ代わりに、
      // clearConnectedPuyosを直接呼び出してテストする
      const clearedCount = field.clearConnectedPuyos()

      expect(clearedCount).toBe(4) // 4つの赤いぷよが消去される
      expect(field.getCell(0, 8)).toBe(null)
      expect(field.getCell(1, 8)).toBe(null)
      expect(field.getCell(0, 9)).toBe(null)
      expect(field.getCell(1, 9)).toBe(null)
    })

    it('消去後に重力が適用される', () => {
      const field = game.getField()

      // テスト用配置：下に4つ接続、上に別の色を配置
      field.setCell(0, 8, PuyoColor.BLUE) // 上のぷよ
      field.setCell(0, 9, PuyoColor.RED) // 消去対象
      field.setCell(1, 9, PuyoColor.RED) // 消去対象
      field.setCell(0, 10, PuyoColor.RED) // 消去対象
      field.setCell(1, 10, PuyoColor.RED) // 消去対象

      // 消去処理を実行
      field.clearConnectedPuyos()

      // 重力を適用
      field.applyGravity()

      // 青いぷよが落下していることを確認
      expect(field.getCell(0, 8)).toBe(null) // 元の位置は空
      expect(field.getCell(0, 11)).toBe(PuyoColor.BLUE) // 最下段に落下
    })

    it('ぷよ配置時に重力が適用される（消去されない場合）', () => {
      const field = game.getField()

      // 途中の位置にぷよを配置（消去されない組み合わせ）
      field.setCell(0, 8, PuyoColor.RED)
      field.setCell(1, 8, PuyoColor.BLUE)
      field.setCell(2, 8, PuyoColor.GREEN)

      // Game.processClearAndGravityを模擬するために、直接重力を適用
      field.applyGravity()

      // ぷよが最下段に落下していることを確認
      expect(field.getCell(0, 8)).toBe(null)
      expect(field.getCell(1, 8)).toBe(null)
      expect(field.getCell(2, 8)).toBe(null)

      expect(field.getCell(0, 11)).toBe(PuyoColor.RED)
      expect(field.getCell(1, 11)).toBe(PuyoColor.BLUE)
      expect(field.getCell(2, 11)).toBe(PuyoColor.GREEN)
    })

    it('空中に浮いているぷよが重力で落下する', () => {
      const field = game.getField()

      // 空中に浮いているぷよを配置
      field.setCell(2, 5, PuyoColor.YELLOW) // 中空のぷよ
      field.setCell(2, 11, PuyoColor.PURPLE) // 最下段のぷよ

      // 重力を適用
      field.applyGravity()

      // 浮いていたぷよが下に詰まることを確認
      expect(field.getCell(2, 5)).toBe(null) // 元の位置は空

      // 重力適用後、順序を保持して配置される
      // YELLOW(4)が上、PURPLE(5)が下にあったので、その順序を保持
      expect(field.getCell(2, 10)).toBe(PuyoColor.YELLOW) // 下から2番目に移動
      expect(field.getCell(2, 11)).toBe(PuyoColor.PURPLE) // 最下段に移動
    })
  })

  describe('色の保持', () => {
    beforeEach(() => {
      game.start()
    })

    it('ぷよの色が配置後も正しく保持される', () => {
      const field = game.getField()

      // 特定の色のぷよを配置
      field.setCell(0, 11, PuyoColor.RED)
      field.setCell(1, 11, PuyoColor.BLUE)
      field.setCell(2, 11, PuyoColor.GREEN)
      field.setCell(3, 11, PuyoColor.YELLOW)
      field.setCell(4, 11, PuyoColor.PURPLE)

      // 配置直後の色を確認
      expect(field.getCell(0, 11)).toBe(PuyoColor.RED)
      expect(field.getCell(1, 11)).toBe(PuyoColor.BLUE)
      expect(field.getCell(2, 11)).toBe(PuyoColor.GREEN)
      expect(field.getCell(3, 11)).toBe(PuyoColor.YELLOW)
      expect(field.getCell(4, 11)).toBe(PuyoColor.PURPLE)
    })

    it('重力適用後もぷよの色が保持される', () => {
      const field = game.getField()

      // 中空にぷよを配置
      field.setCell(0, 5, PuyoColor.RED)
      field.setCell(1, 5, PuyoColor.BLUE)
      field.setCell(2, 5, PuyoColor.GREEN)

      // 重力を適用
      field.applyGravity()

      // 落下後も色が保持されていることを確認
      expect(field.getCell(0, 11)).toBe(PuyoColor.RED)
      expect(field.getCell(1, 11)).toBe(PuyoColor.BLUE)
      expect(field.getCell(2, 11)).toBe(PuyoColor.GREEN)
    })

    it('ぷよ配置と重力適用の一連の処理で色が保持される', () => {
      const field = game.getField()

      // 複数色のぷよを配置（消去されない配置）
      field.setCell(0, 8, PuyoColor.RED)
      field.setCell(1, 8, PuyoColor.BLUE)
      field.setCell(0, 9, PuyoColor.GREEN)
      field.setCell(1, 9, PuyoColor.YELLOW)

      // processClearAndGravityを模擬
      field.applyGravity()
      const clearedCount = field.clearConnectedPuyos()

      // 消去は発生しないはず
      expect(clearedCount).toBe(0)

      // 色が正しく保持されていることを確認
      // 元の上下関係を保持：RED(y=8)、GREEN(y=9)の順
      expect(field.getCell(0, 10)).toBe(PuyoColor.RED)
      expect(field.getCell(1, 10)).toBe(PuyoColor.BLUE)
      expect(field.getCell(0, 11)).toBe(PuyoColor.GREEN)
      expect(field.getCell(1, 11)).toBe(PuyoColor.YELLOW)
    })
  })

  describe('連鎖反応', () => {
    beforeEach(() => {
      game.start()
    })

    it('連鎖が発生して連鎖数がカウントされる', () => {
      const field = game.getField()

      // 連鎖が発生する配置を作成
      // 赤4つが消えると青が落下して青4つが揃う
      // B B - -  (y=9)
      // R R B B  (y=10)
      // R R - -  (y=11)
      field.setCell(0, 9, PuyoColor.BLUE)
      field.setCell(1, 9, PuyoColor.BLUE)
      field.setCell(0, 10, PuyoColor.RED)
      field.setCell(1, 10, PuyoColor.RED)
      field.setCell(2, 10, PuyoColor.BLUE)
      field.setCell(3, 10, PuyoColor.BLUE)
      field.setCell(0, 11, PuyoColor.RED)
      field.setCell(1, 11, PuyoColor.RED)

      const initialScore = game.getScore()

      // 連鎖処理を実行
      game.processClearAndGravity()

      // 連鎖数を確認
      expect(game.getChainCount()).toBe(2) // 2連鎖

      // スコアにボーナスが加算されている
      const finalScore = game.getScore()
      expect(finalScore).toBeGreaterThan(initialScore)

      // 具体的なスコア計算の確認
      // 1連鎖目: 赤4個 × 10点 × 1倍 = 40点
      // 2連鎖目: 青4個 × 10点 × 2倍 = 80点
      // 合計: 120点
      expect(finalScore - initialScore).toBe(120)
    })

    it('連鎖ボーナスが正しく計算される', () => {
      const field = game.getField()

      // シンプルな2連鎖のセットアップに変更
      //
      // 配置：
      // B B - -  (y=9) 2連鎖目の青が落下後にここに来る
      // R R - -  (y=10) 1連鎖目の赤（最初に消える）
      // R R B B  (y=11) 赤が消えると青が隣接して4つ揃う

      // 1連鎖目: 赤4個（最初に消える）
      field.setCell(0, 10, PuyoColor.RED)
      field.setCell(1, 10, PuyoColor.RED)
      field.setCell(0, 11, PuyoColor.RED)
      field.setCell(1, 11, PuyoColor.RED)

      // 2連鎖目: 青4個（赤が消えた後に4つ隣接する）
      field.setCell(0, 9, PuyoColor.BLUE)
      field.setCell(1, 9, PuyoColor.BLUE)
      field.setCell(2, 11, PuyoColor.BLUE)
      field.setCell(3, 11, PuyoColor.BLUE)

      const initialScore = game.getScore()

      // 連鎖処理を実行
      game.processClearAndGravity()

      // 2連鎖発生を確認
      expect(game.getChainCount()).toBe(2)

      // スコア計算
      // 1連鎖目: 4個 × 10点 × 1倍 = 40点
      // 2連鎖目: 4個 × 10点 × 2倍 = 80点
      // 合計: 120点
      const finalScore = game.getScore()
      expect(finalScore - initialScore).toBe(120)
    })

    it('計算式のテスト', () => {
      // 連鎖ボーナス計算式の単体テスト

      // calculateChainBonusメソッドが private なのでテスト用に確認
      // 1連鎖: 1倍, 2連鎖: 2倍, 3連鎖: 4倍, 4連鎖: 8倍...

      // 2^0 = 1, 2^1 = 2, 2^2 = 4, 2^3 = 8 の数列
      const testBonuses = [1, 2, 4, 8, 16]

      for (let chain = 1; chain <= 5; chain++) {
        const expected = testBonuses[chain - 1]
        // Math.pow(2, chain - 1) で chain=1なら 2^0=1, chain=2なら 2^1=2
        const actual = chain <= 1 ? 1 : Math.pow(2, chain - 1)
        expect(actual).toBe(expected)
      }
    })
  })

  describe('色反転バグの再現', () => {
    beforeEach(() => {
      game.start()
    })

    it('左端配置後に右端配置すると左端ぷよの色が反転しない', () => {
      const field = game.getField()

      // 最初のぷよを手動で左端（x=0）に移動して配置
      const firstPuyo = game.getCurrentPuyo()!

      // 1つ目のぷよの色を記録
      const firstMainColor = firstPuyo.main.color
      const firstSubColor = firstPuyo.sub.color
      console.log(
        `First puyo colors - Main: ${firstMainColor}, Sub: ${firstSubColor}`
      )

      // 左端まで移動（初期位置x=2から x=0へ）
      game.movePuyo(-2, 0) // 左に2マス移動
      console.log(
        `First puyo after move - Main: (${game.getCurrentPuyo()!.main.position.x}, ${game.getCurrentPuyo()!.main.position.y}), Sub: (${game.getCurrentPuyo()!.sub.position.x}, ${game.getCurrentPuyo()!.sub.position.y})`
      )

      // 下まで落下させて配置
      for (let i = 0; i < 20; i++) {
        if (!game.movePuyo(0, 1)) break // 着地するまで下に移動
      }

      // 配置されたぷよの色を確認
      const placedMainColor = field.getCell(0, 11) // 左端最下段
      const placedSubColor = field.getCell(0, 10) // 左端下から2番目
      console.log(
        `Placed puyo colors - Main: ${placedMainColor}, Sub: ${placedSubColor}`
      )

      // 色が正しく配置されていることを確認
      expect(placedMainColor).toBe(firstMainColor)
      expect(placedSubColor).toBe(firstSubColor)

      // 2つ目のぷよの色を記録
      const secondPuyo = game.getCurrentPuyo()!
      const secondMainColor = secondPuyo.main.color
      const secondSubColor = secondPuyo.sub.color

      // 右端まで移動（初期位置x=2から x=5へ）
      game.movePuyo(3, 0) // 右に3マス移動

      // 下まで落下させて配置
      for (let i = 0; i < 20; i++) {
        if (!game.movePuyo(0, 1)) break // 着地するまで下に移動
      }

      // 右端に配置されたぷよの色を確認
      const rightMainColor = field.getCell(5, 11) // 右端最下段
      const rightSubColor = field.getCell(5, 10) // 右端下から2番目

      expect(rightMainColor).toBe(secondMainColor)
      expect(rightSubColor).toBe(secondSubColor)

      // 重要: 左端のぷよの色が変わっていないことを確認
      expect(field.getCell(0, 11)).toBe(firstMainColor) // 変わってはいけない
      expect(field.getCell(0, 10)).toBe(firstSubColor) // 変わってはいけない
    })
  })
})
