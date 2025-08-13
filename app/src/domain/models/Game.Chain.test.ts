import { describe, expect, it } from 'vitest'

import { createGame, placePuyoPair, updateCurrentPuyoPair } from './Game'
import { createPuyo } from './Puyo'
import { createPuyoPair } from './PuyoPair'

describe('Game - 連鎖処理', () => {
  describe('placePuyoPair - 連鎖処理統合', () => {
    it('4つ以上の同色ぷよが繋がっている場合、ぷよが消去される', () => {
      // Arrange
      const game = createGame()
      const field = game.field

      // 縦に4つの同色ぷよを配置（一番下に3つ）
      const redPuyo1 = createPuyo('red', { x: 2, y: 11 })
      const redPuyo2 = createPuyo('red', { x: 2, y: 10 })
      const redPuyo3 = createPuyo('red', { x: 2, y: 9 })
      field.setPuyo(2, 11, redPuyo1)
      field.setPuyo(2, 10, redPuyo2)
      field.setPuyo(2, 9, redPuyo3)

      // 4つ目のぷよをペアとして配置
      const puyoPair = createPuyoPair('red', 'blue', 2, 8)
      const gameWithPair = updateCurrentPuyoPair(game, puyoPair)

      // Act
      const result = placePuyoPair(gameWithPair)

      // Assert
      // 赤いぷよ4つが消去され、その位置に青いぷよが落ちていることを確認
      // 青いぷよ（サブ）は重力により最下部に落ちている
      expect(result.field.getPuyo(2, 11)?.color).toBe('blue')

      // 他の位置は空になっている
      expect(result.field.getPuyo(2, 10)).toBeNull()
      expect(result.field.getPuyo(2, 9)).toBeNull()
      expect(result.field.getPuyo(2, 8)).toBeNull()
      expect(result.field.getPuyo(2, 7)).toBeNull()

      // スコアが更新されている
      expect(result.score.current).toBeGreaterThan(0)
    })

    it('L字型に4つ以上の同色ぷよが繋がっている場合、ぷよが消去される', () => {
      // Arrange
      const game = createGame()
      const field = game.field

      // L字型に3つの同色ぷよを配置
      const redPuyo1 = createPuyo('red', { x: 2, y: 11 })
      const redPuyo2 = createPuyo('red', { x: 2, y: 10 })
      const redPuyo3 = createPuyo('red', { x: 3, y: 11 })
      field.setPuyo(2, 11, redPuyo1)
      field.setPuyo(2, 10, redPuyo2)
      field.setPuyo(3, 11, redPuyo3)

      // 4つ目のぷよをペアとして配置
      const puyoPair = createPuyoPair('red', 'blue', 1, 10)
      const gameWithPair = updateCurrentPuyoPair(game, puyoPair)

      // Act
      const result = placePuyoPair(gameWithPair)

      // Assert
      // 赤いぷよ4つが消去されていることを確認（最終的にそれらの位置は空またはblue）
      // 青いぷよが重力により落下して存在していることを確認
      let bluePuyoCount = 0
      for (let x = 0; x < result.field.getWidth(); x++) {
        for (let y = 0; y < result.field.getHeight(); y++) {
          const puyo = result.field.getPuyo(x, y)
          if (puyo?.color === 'blue') {
            bluePuyoCount++
          }
        }
      }

      // 青いぷよが少なくとも1つ存在することを確認（ペアの一部）
      expect(bluePuyoCount).toBeGreaterThanOrEqual(1)

      // スコアが更新されている
      expect(result.score.current).toBeGreaterThan(0)
    })

    it('3つ以下の同色ぷよは消去されない', () => {
      // Arrange
      const game = createGame()
      const field = game.field

      // 縦に3つの同色ぷよを配置
      const redPuyo1 = createPuyo('red', { x: 2, y: 11 })
      const redPuyo2 = createPuyo('red', { x: 2, y: 10 })
      const redPuyo3 = createPuyo('red', { x: 2, y: 9 })
      field.setPuyo(2, 11, redPuyo1)
      field.setPuyo(2, 10, redPuyo2)
      field.setPuyo(2, 9, redPuyo3)

      // 異なる色のペアを配置
      const puyoPair = createPuyoPair('blue', 'green', 2, 7)
      const gameWithPair = updateCurrentPuyoPair(game, puyoPair)

      // Act
      const result = placePuyoPair(gameWithPair)

      // Assert
      // 赤いぷよ3つは消去されていない
      expect(result.field.getPuyo(2, 11)).not.toBeNull()
      expect(result.field.getPuyo(2, 10)).not.toBeNull()
      expect(result.field.getPuyo(2, 9)).not.toBeNull()

      // スコアは増加していない（連鎖なし）
      expect(result.score.current).toBe(0)
    })

    it('重力適用後に連鎖が発生する', () => {
      // Arrange
      const game = createGame()
      const field = game.field

      // 複雑な配置：上部に同色ぷよを配置し、下部を消去すると連鎖する
      // 下部: 4つの青ぷよ（消去対象）
      field.setPuyo(2, 11, createPuyo('blue', { x: 2, y: 11 }))
      field.setPuyo(2, 10, createPuyo('blue', { x: 2, y: 10 }))
      field.setPuyo(2, 9, createPuyo('blue', { x: 2, y: 9 }))
      field.setPuyo(3, 11, createPuyo('blue', { x: 3, y: 11 }))

      // 上部: 赤ぷよを配置（青が消えると落ちて4つ繋がる）
      field.setPuyo(2, 8, createPuyo('red', { x: 2, y: 8 }))
      field.setPuyo(2, 7, createPuyo('red', { x: 2, y: 7 }))
      field.setPuyo(3, 10, createPuyo('red', { x: 3, y: 10 }))

      // 4つ目の青ぷよをペアとして配置
      const puyoPair = createPuyoPair('blue', 'green', 1, 10)
      const gameWithPair = updateCurrentPuyoPair(game, puyoPair)

      // Act
      const result = placePuyoPair(gameWithPair)

      // Assert
      // 連鎖が発生してスコアが高くなっている
      expect(result.score.current).toBeGreaterThan(40) // 1連鎖なら40点、2連鎖以上なら更に高い
    })

    it('異なる色のぷよは消去されない', () => {
      // Arrange
      const game = createGame()
      const field = game.field

      // 異なる色のぷよを4つ配置
      field.setPuyo(2, 11, createPuyo('red', { x: 2, y: 11 }))
      field.setPuyo(2, 10, createPuyo('blue', { x: 2, y: 10 }))
      field.setPuyo(2, 9, createPuyo('green', { x: 2, y: 9 }))
      field.setPuyo(2, 8, createPuyo('yellow', { x: 2, y: 8 }))

      // 新しいペアを配置
      const puyoPair = createPuyoPair('purple', 'red', 3, 10)
      const gameWithPair = updateCurrentPuyoPair(game, puyoPair)

      // Act
      const result = placePuyoPair(gameWithPair)

      // Assert
      // すべてのぷよが残っている
      expect(result.field.getPuyo(2, 11)).not.toBeNull()
      expect(result.field.getPuyo(2, 10)).not.toBeNull()
      expect(result.field.getPuyo(2, 9)).not.toBeNull()
      expect(result.field.getPuyo(2, 8)).not.toBeNull()

      // スコアは増加していない
      expect(result.score.current).toBe(0)
    })
  })

  describe('スコア計算', () => {
    it('4つ消去で基本スコア40点が加算される', () => {
      // Arrange
      const game = createGame()
      const field = game.field

      // 4つの同色ぷよを配置
      field.setPuyo(2, 11, createPuyo('red', { x: 2, y: 11 }))
      field.setPuyo(2, 10, createPuyo('red', { x: 2, y: 10 }))
      field.setPuyo(2, 9, createPuyo('red', { x: 2, y: 9 }))

      const puyoPair = createPuyoPair('red', 'blue', 2, 8)
      const gameWithPair = updateCurrentPuyoPair(game, puyoPair)

      // Act
      const result = placePuyoPair(gameWithPair)

      // Assert
      expect(result.score.current).toBe(40) // 4つ × 10点 = 40点
    })

    it('5つ以上消去でより多くのスコアが加算される', () => {
      // Arrange
      const game = createGame()
      const field = game.field

      // 5つの同色ぷよを配置
      field.setPuyo(2, 11, createPuyo('red', { x: 2, y: 11 }))
      field.setPuyo(2, 10, createPuyo('red', { x: 2, y: 10 }))
      field.setPuyo(2, 9, createPuyo('red', { x: 2, y: 9 }))
      field.setPuyo(3, 11, createPuyo('red', { x: 3, y: 11 }))

      const puyoPair = createPuyoPair('red', 'blue', 2, 8)
      const gameWithPair = updateCurrentPuyoPair(game, puyoPair)

      // Act
      const result = placePuyoPair(gameWithPair)

      // Assert
      expect(result.score.current).toBe(50) // 5つ × 10点 = 50点
    })
  })
})
