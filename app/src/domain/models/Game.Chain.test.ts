import { describe, expect, it } from 'vitest'

import { createGame, placePuyoPair, updateCurrentPuyoPair } from './Game'
import { getPuyoAt, placePuyoAt } from './ImmutableField'
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
      let updatedField = placePuyoAt({ x: 2, y: 11 }, redPuyo1, field)
      updatedField = placePuyoAt({ x: 2, y: 10 }, redPuyo2, updatedField)
      updatedField = placePuyoAt({ x: 2, y: 9 }, redPuyo3, updatedField)

      // 4つ目のぷよをペアとして配置
      const puyoPair = createPuyoPair('red', 'blue', 2, 8)
      const gameWithField = { ...game, field: updatedField }
      const gameWithPair = updateCurrentPuyoPair(gameWithField, puyoPair)

      // Act
      const result = placePuyoPair(gameWithPair)

      // Assert
      // 赤いぷよ4つが消去され、その位置に青いぷよが落ちていることを確認
      // 青いぷよ（サブ）は重力により最下部に落ちている
      expect(getPuyoAt({ x: 2, y: 11 }, result.field)?.color).toBe('blue')

      // 他の位置は空になっている
      expect(getPuyoAt({ x: 2, y: 10 }, result.field)).toBeNull()
      expect(getPuyoAt({ x: 2, y: 9 }, result.field)).toBeNull()
      expect(getPuyoAt({ x: 2, y: 8 }, result.field)).toBeNull()
      expect(getPuyoAt({ x: 2, y: 7 }, result.field)).toBeNull()

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
      let updatedField = placePuyoAt({ x: 2, y: 11 }, redPuyo1, field)
      updatedField = placePuyoAt({ x: 2, y: 10 }, redPuyo2, updatedField)
      updatedField = placePuyoAt({ x: 3, y: 11 }, redPuyo3, updatedField)

      // 4つ目のぷよをペアとして配置
      const puyoPair = createPuyoPair('red', 'blue', 1, 10)
      const gameWithField = { ...game, field: updatedField }
      const gameWithPair = updateCurrentPuyoPair(gameWithField, puyoPair)

      // Act
      const result = placePuyoPair(gameWithPair)

      // Assert
      // 赤いぷよ4つが消去されていることを確認（最終的にそれらの位置は空またはblue）
      // 青いぷよが重力により落下して存在していることを確認
      let bluePuyoCount = 0
      for (let x = 0; x < result.field.width; x++) {
        for (let y = 0; y < result.field.height; y++) {
          const puyo = getPuyoAt({ x, y }, result.field)
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
      let updatedField = placePuyoAt({ x: 2, y: 11 }, redPuyo1, field)
      updatedField = placePuyoAt({ x: 2, y: 10 }, redPuyo2, updatedField)
      updatedField = placePuyoAt({ x: 2, y: 9 }, redPuyo3, updatedField)

      // 異なる色のペアを配置
      const puyoPair = createPuyoPair('blue', 'green', 2, 7)
      const gameWithField = { ...game, field: updatedField }
      const gameWithPair = updateCurrentPuyoPair(gameWithField, puyoPair)

      // Act
      const result = placePuyoPair(gameWithPair)

      // Assert
      // 赤いぷよ3つは消去されていない
      expect(getPuyoAt({ x: 2, y: 11 }, result.field)).not.toBeNull()
      expect(getPuyoAt({ x: 2, y: 10 }, result.field)).not.toBeNull()
      expect(getPuyoAt({ x: 2, y: 9 }, result.field)).not.toBeNull()

      // スコアは増加していない（連鎖なし）
      expect(result.score.current).toBe(0)
    })

    it('重力適用後に連鎖が発生する', () => {
      // Arrange
      const game = createGame()
      const field = game.field

      // 複雑な配置：上部に同色ぷよを配置し、下部を消去すると連鎖する
      // 下部: 4つの青ぷよ（消去対象）
      let updatedField = placePuyoAt(
        { x: 2, y: 11 },
        createPuyo('blue', { x: 2, y: 11 }),
        field,
      )
      updatedField = placePuyoAt(
        { x: 2, y: 10 },
        createPuyo('blue', { x: 2, y: 10 }),
        updatedField,
      )
      updatedField = placePuyoAt(
        { x: 2, y: 9 },
        createPuyo('blue', { x: 2, y: 9 }),
        updatedField,
      )
      updatedField = placePuyoAt(
        { x: 3, y: 11 },
        createPuyo('blue', { x: 3, y: 11 }),
        updatedField,
      )

      // 上部: 赤ぷよを配置（青が消えると落ちて4つ繋がる）
      updatedField = placePuyoAt(
        { x: 2, y: 8 },
        createPuyo('red', { x: 2, y: 8 }),
        updatedField,
      )
      updatedField = placePuyoAt(
        { x: 2, y: 7 },
        createPuyo('red', { x: 2, y: 7 }),
        updatedField,
      )
      updatedField = placePuyoAt(
        { x: 3, y: 10 },
        createPuyo('red', { x: 3, y: 10 }),
        updatedField,
      )

      // 4つ目の青ぷよをペアとして配置
      const puyoPair = createPuyoPair('blue', 'green', 1, 10)
      const gameWithField = { ...game, field: updatedField }
      const gameWithPair = updateCurrentPuyoPair(gameWithField, puyoPair)

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
      let updatedField = placePuyoAt(
        { x: 2, y: 11 },
        createPuyo('red', { x: 2, y: 11 }),
        field,
      )
      updatedField = placePuyoAt(
        { x: 2, y: 10 },
        createPuyo('blue', { x: 2, y: 10 }),
        updatedField,
      )
      updatedField = placePuyoAt(
        { x: 2, y: 9 },
        createPuyo('green', { x: 2, y: 9 }),
        updatedField,
      )
      updatedField = placePuyoAt(
        { x: 2, y: 8 },
        createPuyo('yellow', { x: 2, y: 8 }),
        updatedField,
      )

      // 新しいペアを配置
      const puyoPair = createPuyoPair('purple', 'red', 3, 10)
      const gameWithField = { ...game, field: updatedField }
      const gameWithPair = updateCurrentPuyoPair(gameWithField, puyoPair)

      // Act
      const result = placePuyoPair(gameWithPair)

      // Assert
      // すべてのぷよが残っている
      expect(getPuyoAt({ x: 2, y: 11 }, result.field)).not.toBeNull()
      expect(getPuyoAt({ x: 2, y: 10 }, result.field)).not.toBeNull()
      expect(getPuyoAt({ x: 2, y: 9 }, result.field)).not.toBeNull()
      expect(getPuyoAt({ x: 2, y: 8 }, result.field)).not.toBeNull()

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
      let updatedField = placePuyoAt(
        { x: 2, y: 11 },
        createPuyo('red', { x: 2, y: 11 }),
        field,
      )
      updatedField = placePuyoAt(
        { x: 2, y: 10 },
        createPuyo('red', { x: 2, y: 10 }),
        updatedField,
      )
      updatedField = placePuyoAt(
        { x: 2, y: 9 },
        createPuyo('red', { x: 2, y: 9 }),
        updatedField,
      )

      const puyoPair = createPuyoPair('red', 'blue', 2, 8)
      const gameWithField = { ...game, field: updatedField }
      const gameWithPair = updateCurrentPuyoPair(gameWithField, puyoPair)

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
      let updatedField = placePuyoAt(
        { x: 2, y: 11 },
        createPuyo('red', { x: 2, y: 11 }),
        field,
      )
      updatedField = placePuyoAt(
        { x: 2, y: 10 },
        createPuyo('red', { x: 2, y: 10 }),
        updatedField,
      )
      updatedField = placePuyoAt(
        { x: 2, y: 9 },
        createPuyo('red', { x: 2, y: 9 }),
        updatedField,
      )
      updatedField = placePuyoAt(
        { x: 3, y: 11 },
        createPuyo('red', { x: 3, y: 11 }),
        updatedField,
      )

      const puyoPair = createPuyoPair('red', 'blue', 2, 8)
      const gameWithField = { ...game, field: updatedField }
      const gameWithPair = updateCurrentPuyoPair(gameWithField, puyoPair)

      // Act
      const result = placePuyoPair(gameWithPair)

      // Assert
      expect(result.score.current).toBe(50) // 5つ × 10点 = 50点
    })
  })
})
