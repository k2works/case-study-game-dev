import { describe, expect, it } from 'vitest'

import { type Position, createPosition } from './Position'
import {
  type PuyoColor,
  type PuyoData,
  arePuyosEqual,
  arePuyosSameColor,
  changePuyoColor,
  createColorFilter,
  createEmptyPuyo,
  createPuyo,
  filterColoredPuyos,
  getColoredPuyoPositions,
  groupPuyosByColor,
  isPuyoAtPosition,
  isPuyoColor,
  isPuyoColored,
  isPuyoEmpty,
  movePuyo,
  puyoToChar,
  puyoToString,
} from './Puyo'

describe('関数型Puyoモデル', () => {
  describe('ファクトリ関数', () => {
    describe('createPuyo', () => {
      it('指定した色と位置で不変なぷよを作成できる', () => {
        // Given
        const color: PuyoColor = 'red'
        const position: Position = createPosition(2, 10)

        // When
        const puyo = createPuyo(color, position)

        // Then
        expect(puyo.color).toBe('red')
        expect(puyo.position).toEqual({ x: 2, y: 10 })
        expect(Object.isFrozen(puyo)).toBe(true)
      })

      it('null色のぷよを作成できる', () => {
        // Given
        const position: Position = createPosition(0, 0)

        // When
        const puyo = createPuyo(null, position)

        // Then
        expect(puyo.color).toBeNull()
        expect(puyo.position).toEqual({ x: 0, y: 0 })
        expect(Object.isFrozen(puyo)).toBe(true)
      })

      it('無効な色の場合はエラーをスローする', () => {
        // Given
        const invalidColor = 'invalid' as PuyoColor
        const position = createPosition(0, 0)

        // When & Then
        expect(() => createPuyo(invalidColor, position)).toThrow(
          'Invalid puyo color',
        )
      })

      it('極端に負の座標の場合はエラーをスローする', () => {
        // Given
        const color: PuyoColor = 'red'
        const invalidPosition = createPosition(-101, 0)

        // When & Then
        expect(() => createPuyo(color, invalidPosition)).toThrow(
          'Position coordinates out of reasonable range',
        )
      })
    })

    describe('createEmptyPuyo', () => {
      it('空のぷよを作成できる', () => {
        // Given
        const position = createPosition(1, 1)

        // When
        const puyo = createEmptyPuyo(position)

        // Then
        expect(puyo.color).toBeNull()
        expect(puyo.position).toEqual({ x: 1, y: 1 })
        expect(Object.isFrozen(puyo)).toBe(true)
      })
    })
  })

  describe('変換関数（純粋関数）', () => {
    describe('movePuyo', () => {
      it('ぷよを新しい位置に移動した新しいインスタンスを返す', () => {
        // Given
        const puyo: PuyoData = createPuyo('blue', createPosition(2, 10))
        const newPosition: Position = createPosition(3, 11)

        // When
        const movedPuyo = movePuyo(newPosition, puyo)

        // Then
        expect(movedPuyo.position).toEqual({ x: 3, y: 11 })
        expect(movedPuyo.color).toBe('blue')
        expect(movedPuyo).not.toBe(puyo) // 新しいインスタンス
        expect(Object.isFrozen(movedPuyo)).toBe(true)
      })

      it('元のぷよは変更されない（イミュータブル）', () => {
        // Given
        const originalPuyo: PuyoData = createPuyo('green', createPosition(1, 5))
        const newPosition: Position = createPosition(2, 6)

        // When
        const movedPuyo = movePuyo(newPosition, originalPuyo)

        // Then
        expect(originalPuyo.position).toEqual({ x: 1, y: 5 })
        expect(originalPuyo.color).toBe('green')
        expect(movedPuyo).not.toBe(originalPuyo)
      })

      it('カリー化された関数として使用できる', () => {
        // Given
        const moveToPosition = movePuyo(createPosition(5, 5))
        const puyo = createPuyo('yellow', createPosition(0, 0))

        // When
        const movedPuyo = moveToPosition(puyo)

        // Then
        expect(movedPuyo.position).toEqual({ x: 5, y: 5 })
        expect(movedPuyo.color).toBe('yellow')
      })
    })

    describe('changePuyoColor', () => {
      it('ぷよの色を変更した新しいインスタンスを返す', () => {
        // Given
        const puyo = createPuyo('red', createPosition(2, 3))
        const newColor: PuyoColor = 'blue'

        // When
        const changedPuyo = changePuyoColor(newColor, puyo)

        // Then
        expect(changedPuyo.color).toBe('blue')
        expect(changedPuyo.position).toEqual({ x: 2, y: 3 })
        expect(changedPuyo).not.toBe(puyo)
        expect(Object.isFrozen(changedPuyo)).toBe(true)
      })
    })
  })

  describe('述語関数（カリー化）', () => {
    const redPuyo = createPuyo('red', createPosition(1, 1))
    const bluePuyo = createPuyo('blue', createPosition(2, 2))
    const emptyPuyo = createPuyo(null, createPosition(3, 3))

    describe('isPuyoColor', () => {
      it('指定の色のぷよを正しく判定する', () => {
        // When & Then
        expect(isPuyoColor('red', redPuyo)).toBe(true)
        expect(isPuyoColor('blue', redPuyo)).toBe(false)
        expect(isPuyoColor(null, emptyPuyo)).toBe(true)
      })

      it('カリー化された関数として使用できる', () => {
        // Given
        const isRed = isPuyoColor('red')

        // When & Then
        expect(isRed(redPuyo)).toBe(true)
        expect(isRed(bluePuyo)).toBe(false)
      })
    })

    describe('isPuyoAtPosition', () => {
      it('指定の位置のぷよを正しく判定する', () => {
        // Given
        const position = createPosition(1, 1)

        // When & Then
        expect(isPuyoAtPosition(position, redPuyo)).toBe(true)
        expect(isPuyoAtPosition(createPosition(2, 2), redPuyo)).toBe(false)
      })
    })

    describe('isPuyoEmpty / isPuyoColored', () => {
      it('空のぷよと色付きぷよを正しく判定する', () => {
        // When & Then
        expect(isPuyoEmpty(emptyPuyo)).toBe(true)
        expect(isPuyoEmpty(redPuyo)).toBe(false)
        expect(isPuyoColored(redPuyo)).toBe(true)
        expect(isPuyoColored(emptyPuyo)).toBe(false)
      })
    })

    describe('arePuyosEqual / arePuyosSameColor', () => {
      it('ぷよの等価性を正しく判定する', () => {
        // Given
        const sameRedPuyo = createPuyo('red', createPosition(1, 1))
        const differentRedPuyo = createPuyo('red', createPosition(2, 2))

        // When & Then
        expect(arePuyosEqual(redPuyo, sameRedPuyo)).toBe(true)
        expect(arePuyosEqual(redPuyo, differentRedPuyo)).toBe(false)
        expect(arePuyosSameColor(redPuyo, differentRedPuyo)).toBe(true)
        expect(arePuyosSameColor(redPuyo, bluePuyo)).toBe(false)
      })
    })
  })

  describe('高階関数とフィルタリング', () => {
    const puyos: PuyoData[] = [
      createPuyo('red', createPosition(0, 0)),
      createPuyo('blue', createPosition(1, 0)),
      createPuyo('red', createPosition(2, 0)),
      createPuyo(null, createPosition(3, 0)),
      createPuyo('green', createPosition(4, 0)),
    ]

    describe('createColorFilter', () => {
      it('指定の色のぷよのみをフィルタリングする', () => {
        // Given
        const redFilter = createColorFilter('red')

        // When
        const redPuyos = redFilter(puyos)

        // Then
        expect(redPuyos).toHaveLength(2)
        expect(redPuyos.every((p) => p.color === 'red')).toBe(true)
      })
    })

    describe('filterColoredPuyos', () => {
      it('色付きぷよのみをフィルタリングする', () => {
        // When
        const coloredPuyos = filterColoredPuyos(puyos)

        // Then
        expect(coloredPuyos).toHaveLength(4)
        expect(coloredPuyos.every((p) => p.color !== null)).toBe(true)
      })
    })

    describe('groupPuyosByColor', () => {
      it('ぷよを色でグループ化する', () => {
        // When
        const groupedPuyos = groupPuyosByColor(puyos)

        // Then
        expect(groupedPuyos.red).toHaveLength(2)
        expect(groupedPuyos.blue).toHaveLength(1)
        expect(groupedPuyos.green).toHaveLength(1)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(groupedPuyos[null as any]).toHaveLength(1)
      })
    })

    describe('getColoredPuyoPositions', () => {
      it('色付きぷよの位置のみを抽出する', () => {
        // When
        const positions = getColoredPuyoPositions(puyos)

        // Then
        expect(positions).toHaveLength(4)
        expect(positions).toEqual([
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 4, y: 0 },
        ])
      })
    })
  })

  describe('ユーティリティ関数', () => {
    const puyo = createPuyo('red', createPosition(2, 3))
    const emptyPuyo = createPuyo(null, createPosition(1, 1))

    describe('puyoToString', () => {
      it('ぷよを文字列表現に変換する', () => {
        // When & Then
        expect(puyoToString(puyo)).toBe('Puyo(red, 2, 3)')
        expect(puyoToString(emptyPuyo)).toBe('Puyo(empty, 1, 1)')
      })
    })

    describe('puyoToChar', () => {
      it('ぷよを簡潔な文字表現に変換する', () => {
        // When & Then
        expect(puyoToChar(puyo)).toBe('R')
        expect(puyoToChar(createPuyo('blue', createPosition(0, 0)))).toBe('B')
        expect(puyoToChar(emptyPuyo)).toBe('.')
      })
    })
  })

  describe('関数型プログラミングの性質', () => {
    it('純粋関数：同じ入力に対して常に同じ出力を返す', () => {
      // Given
      const color: PuyoColor = 'red'
      const position = createPosition(1, 1)

      // When
      const puyo1 = createPuyo(color, position)
      const puyo2 = createPuyo(color, position)

      // Then
      expect(arePuyosEqual(puyo1, puyo2)).toBe(true)
    })

    it('イミュータビリティ：オブジェクトが凍結されている', () => {
      // Given
      const puyo = createPuyo('blue', createPosition(0, 0))

      // When & Then
      expect(Object.isFrozen(puyo)).toBe(true)
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(puyo as any).color = 'red' // 型チェックを回避してテスト
      }).toThrow()
    })

    it('副作用なし：変換操作は元のデータを変更しない', () => {
      // Given
      const originalPuyo = createPuyo('green', createPosition(5, 5))
      const originalColor = originalPuyo.color
      const originalPosition = { ...originalPuyo.position }

      // When
      movePuyo(createPosition(10, 10), originalPuyo)
      changePuyoColor('yellow', originalPuyo)

      // Then
      expect(originalPuyo.color).toBe(originalColor)
      expect(originalPuyo.position).toEqual(originalPosition)
    })
  })
})
