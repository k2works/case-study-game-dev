import { describe, it, expect } from 'vitest'
import { Game, GameState } from '../domain/Game'
import { Puyo, PuyoColor } from '../domain/Puyo'

describe('重力処理統合テスト', () => {
  describe('基本的な重力処理', () => {
    it('ぷよペア配置後に重力が適用される', () => {
      // Given: ゲームを開始
      const game = new Game()
      game.start()

      // 浮いたぷよを配置（本来なら落下すべき）
      game.field.setPuyo(2, 7, new Puyo(PuyoColor.BLUE))

      // When: ぷよペアを配置
      const currentPair = game.currentPair!
      currentPair.x = 1
      currentPair.y = 15
      game.fixCurrentPair()

      // Then: 浮いたぷよが落下している
      expect(game.field.getPuyo(2, 7)).toBeNull()
      expect(game.field.getPuyo(2, 15)).not.toBeNull()
      expect(game.field.getPuyo(2, 15)!.color).toBe(PuyoColor.BLUE)
    })

    it('重なったぷよペアが正しく落下する', () => {
      // Given: ゲームを開始し、ベースぷよを配置
      const game = new Game()
      game.start()
      game.field.setPuyo(3, 15, new Puyo(PuyoColor.GREEN))

      // When: 空中に縦向きペアを配置
      const currentPair = game.currentPair!
      currentPair.x = 3
      currentPair.y = 5 // 空中
      currentPair.rotation = 180 // 縦向き
      game.fixCurrentPair()

      // Then: 両方のぷよがベースの上に落下
      expect(game.field.getPuyo(3, 5)).toBeNull() // main元位置は空
      expect(game.field.getPuyo(3, 6)).toBeNull() // sub元位置は空
      expect(game.field.getPuyo(3, 14)).not.toBeNull() // mainが落下
      expect(game.field.getPuyo(3, 13)).not.toBeNull() // subが落下
    })
  })

  describe('連鎖無しでの重力処理', () => {
    it('連鎖が発生しなくても重力は適用される', () => {
      // Given: ゲーム開始、連鎖しない色配置
      const game = new Game()
      game.start()

      game.field.setPuyo(1, 15, new Puyo(PuyoColor.RED))
      game.field.setPuyo(2, 15, new Puyo(PuyoColor.BLUE))
      game.field.setPuyo(3, 15, new Puyo(PuyoColor.GREEN))

      // 浮いたぷよを配置
      game.field.setPuyo(2, 8, new Puyo(PuyoColor.YELLOW))

      // When: 連鎖しないぷよペアを配置
      const currentPair = game.currentPair!
      currentPair.main = new Puyo(PuyoColor.YELLOW)
      currentPair.sub = new Puyo(PuyoColor.GREEN)
      currentPair.x = 4
      currentPair.y = 15
      game.fixCurrentPair()

      // Then: 連鎖は発生しないが重力は適用される
      expect(game.lastChainResult?.chainCount || 0).toBe(0)
      expect(game.field.getPuyo(2, 8)).toBeNull()
      expect(game.field.getPuyo(2, 14)).not.toBeNull()
      expect(game.field.getPuyo(2, 14)!.color).toBe(PuyoColor.YELLOW)
    })
  })

  describe('複雑な重力処理', () => {
    it('複数列に浮いたぷよがすべて正しく落下する', () => {
      // Given: 複雑な配置
      const game = new Game()
      game.start()

      // 各列にベースぷよ
      game.field.setPuyo(1, 15, new Puyo(PuyoColor.RED))
      game.field.setPuyo(2, 15, new Puyo(PuyoColor.BLUE))
      game.field.setPuyo(4, 15, new Puyo(PuyoColor.GREEN))

      // 各列に浮いたぷよ
      game.field.setPuyo(1, 8, new Puyo(PuyoColor.YELLOW))
      game.field.setPuyo(1, 6, new Puyo(PuyoColor.GREEN))
      game.field.setPuyo(2, 9, new Puyo(PuyoColor.RED))
      game.field.setPuyo(4, 7, new Puyo(PuyoColor.BLUE))

      // When: ぷよペアを配置
      const currentPair = game.currentPair!
      currentPair.x = 3
      currentPair.y = 15
      game.fixCurrentPair()

      // Then: すべての浮いたぷよが落下
      // 列1の浮いたぷよ: GREEN(6)->13, YELLOW(8)->14
      expect(game.field.getPuyo(1, 6)).toBeNull()
      expect(game.field.getPuyo(1, 8)).toBeNull()
      expect(game.field.getPuyo(1, 13)!.color).toBe(PuyoColor.GREEN)
      expect(game.field.getPuyo(1, 14)!.color).toBe(PuyoColor.YELLOW)

      // 列2の浮いたぷよ: RED(9)->14
      expect(game.field.getPuyo(2, 9)).toBeNull()
      expect(game.field.getPuyo(2, 14)!.color).toBe(PuyoColor.RED)

      // 列4の浮いたぷよ: BLUE(7)->14
      expect(game.field.getPuyo(4, 7)).toBeNull()
      expect(game.field.getPuyo(4, 14)!.color).toBe(PuyoColor.BLUE)
    })

    it('連鎖発生時でも重力が正しく動作する', () => {
      // Given: 横に4つ並べて連鎖可能な配置と浮いたぷよ
      const game = new Game()
      game.start()

      // 連鎖用：横に3個の赤ぷよ
      game.field.setPuyo(1, 15, new Puyo(PuyoColor.RED))
      game.field.setPuyo(2, 15, new Puyo(PuyoColor.RED))
      game.field.setPuyo(3, 15, new Puyo(PuyoColor.RED))

      // 浮いたぷよ（連鎖とは独立した位置）
      game.field.setPuyo(0, 10, new Puyo(PuyoColor.BLUE))

      // When: 4つ目の赤ぷよをペアで配置（連鎖発生）
      const currentPair = game.currentPair!
      currentPair.main = new Puyo(PuyoColor.RED)
      currentPair.sub = new Puyo(PuyoColor.BLUE)
      currentPair.x = 4
      currentPair.y = 15
      game.fixCurrentPair()

      // Then: 連鎖が発生していることを確認
      expect(game.lastChainResult!.chainCount).toBeGreaterThan(0)

      // 連鎖で4個の赤ぷよが消去されている
      expect(game.field.getPuyo(1, 15)).toBeNull()
      expect(game.field.getPuyo(2, 15)).toBeNull()
      expect(game.field.getPuyo(3, 15)).toBeNull()
      expect(game.field.getPuyo(4, 15)).toBeNull()

      // 浮いたぷよが重力で落下している
      expect(game.field.getPuyo(0, 10)).toBeNull() // 元の位置は空
      expect(game.field.getPuyo(0, 15)!.color).toBe(PuyoColor.BLUE) // 落下先にある
    })
  })

  describe('エッジケースの重力処理', () => {
    it('フィールドが空でも重力処理は安全に実行される', () => {
      // Given: 空のフィールド
      const game = new Game()
      game.start()

      // フィールドをクリア（念のため）
      for (let x = 0; x < game.field.width; x++) {
        for (let y = 0; y < game.field.height; y++) {
          game.field.clearPuyo(x, y)
        }
      }

      // When: ぷよペアを配置
      const currentPair = game.currentPair!
      currentPair.x = 2
      currentPair.y = 15
      game.fixCurrentPair()

      // Then: 問題なく処理される（クラッシュしない）
      expect(game.state).toBe(GameState.PLAYING)
    })

    it('最下段のぷよは重力の影響を受けない', () => {
      // Given: 最下段に配置されたぷよ
      const game = new Game()
      game.start()

      const redPuyo = new Puyo(PuyoColor.RED)
      const bluePuyo = new Puyo(PuyoColor.BLUE)
      game.field.setPuyo(1, 15, redPuyo)
      game.field.setPuyo(2, 15, bluePuyo)

      // When: 重力処理を含むぷよペア配置
      const currentPair = game.currentPair!
      currentPair.x = 3
      currentPair.y = 15
      game.fixCurrentPair()

      // Then: 最下段のぷよは移動していない
      expect(game.field.getPuyo(1, 15)).toBe(redPuyo)
      expect(game.field.getPuyo(2, 15)).toBe(bluePuyo)
    })
  })
})
