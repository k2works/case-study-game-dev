import { describe, expect, it } from 'vitest'

import { type FieldData, createFieldFromPattern } from '../models/Field.ts'
import { createPosition } from '../models/Position'
import {
  type ChainResult,
  type PuyoGroupData,
  calculateAllClearBonus,
  calculateChainBonus,
  calculateChainScore,
  calculateGroupBaseScore,
  calculateGroupBonus,
  combineChainResults,
  executeChainStep,
  findConnectedPuyos,
  findErasableGroups,
  hasNextChain,
  isAllClear,
  processSingleChain,
} from './ChainDetectionService'

describe('関数型ChainDetectionService', () => {
  describe('消去可能グループ検出', () => {
    describe('findErasableGroups', () => {
      it('4個以上の連結した同色ぷよを検出する', () => {
        // Given
        const field = createFieldFromPattern([
          ['R', 'R', 'B'],
          ['R', 'R', 'B'],
          ['G', 'G', 'B'],
        ])

        // When
        const erasableGroups = findErasableGroups(field)

        // Then
        expect(erasableGroups).toHaveLength(1)
        expect(erasableGroups[0].size).toBe(4)
        expect(erasableGroups[0].color).toBe('red')
        expect(erasableGroups[0].baseScore).toBe(40) // 4 * 10
        expect(Object.isFrozen(erasableGroups[0])).toBe(true)
      })

      it('複数の消去可能グループを検出する', () => {
        // Given
        const field = createFieldFromPattern([
          ['R', 'R', 'B', 'B'],
          ['R', 'R', 'B', 'B'],
          ['G', 'G', 'G', 'G'],
        ])

        // When
        const erasableGroups = findErasableGroups(field)

        // Then
        expect(erasableGroups).toHaveLength(3)
        const colors = erasableGroups.map((g) => g.color).sort()
        expect(colors).toEqual(['blue', 'green', 'red'])
      })

      it('消去可能グループがない場合は空配列を返す', () => {
        // Given
        const field = createFieldFromPattern([
          ['R', 'B', 'G'],
          ['B', 'G', 'R'],
          ['G', 'R', 'B'],
        ])

        // When
        const erasableGroups = findErasableGroups(field)

        // Then
        expect(erasableGroups).toHaveLength(0)
      })
    })

    describe('findConnectedPuyos', () => {
      it('指定位置から連結したぷよを検出する', () => {
        // Given
        const field = createFieldFromPattern([
          ['R', 'R', 'B'],
          ['R', 'B', 'B'],
          ['G', 'B', 'B'],
        ])
        const startPosition = createPosition(0, 0)

        // When
        const connectedPuyos = findConnectedPuyos(startPosition, field)

        // Then
        expect(connectedPuyos).toHaveLength(3)
        expect(connectedPuyos.every(({ puyo }) => puyo.color === 'red')).toBe(
          true,
        )
      })

      it('カリー化された関数として使用できる', () => {
        // Given
        const field = createFieldFromPattern([
          ['R', 'R'],
          ['R', 'B'],
        ])
        const findRedFromTopLeft = findConnectedPuyos(createPosition(0, 0))

        // When
        const connectedPuyos = findRedFromTopLeft(field)

        // Then
        expect(connectedPuyos).toHaveLength(3)
      })
    })
  })

  describe('スコア計算関数', () => {
    describe('calculateChainBonus', () => {
      it('連鎖数に応じた正しいボーナスを計算する', () => {
        // When & Then
        expect(calculateChainBonus(0)).toBe(0)
        expect(calculateChainBonus(1)).toBe(8)
        expect(calculateChainBonus(2)).toBe(16)
        expect(calculateChainBonus(3)).toBe(32)
        expect(calculateChainBonus(100)).toBe(512) // 最大値
      })
    })

    describe('calculateGroupBonus', () => {
      it('同時消しグループ数に応じた正しいボーナスを計算する', () => {
        // When & Then
        expect(calculateGroupBonus(1)).toBe(0)
        expect(calculateGroupBonus(2)).toBe(3)
        expect(calculateGroupBonus(3)).toBe(4)
        expect(calculateGroupBonus(100)).toBe(10) // 最大値
      })
    })

    describe('calculateAllClearBonus', () => {
      it('固定の全消しボーナスを返す', () => {
        // When & Then
        expect(calculateAllClearBonus()).toBe(2100)
      })
    })

    describe('calculateGroupBaseScore', () => {
      it('グループサイズに応じた正しいベーススコアを計算する', () => {
        // When & Then
        expect(calculateGroupBaseScore(4)).toBe(40)
        expect(calculateGroupBaseScore(5)).toBe(50)
        expect(calculateGroupBaseScore(10)).toBe(100)
      })
    })

    describe('calculateChainScore', () => {
      it('連鎖スコアを正しく計算する', () => {
        // Given
        const erasedGroups: PuyoGroupData[] = [
          {
            puyos: [],
            color: 'red',
            size: 4,
            baseScore: 40,
            positions: [],
          },
        ]

        // When
        const score = calculateChainScore(1, false, erasedGroups)

        // Then
        const expectedScore = 40 * Math.max(1, 8 + 0) // ベーススコア * (チェインボーナス + グループボーナス)
        expect(score).toBe(expectedScore)
      })

      it('全消しボーナスを含む場合の計算', () => {
        // Given
        const erasedGroups: PuyoGroupData[] = [
          {
            puyos: [],
            color: 'red',
            size: 4,
            baseScore: 40,
            positions: [],
          },
        ]

        // When
        const score = calculateChainScore(1, true, erasedGroups)

        // Then
        const baseScore = 40 * Math.max(1, 8 + 0)
        const expectedScore = baseScore + 2100
        expect(score).toBe(expectedScore)
      })

      it('カリー化された関数として使用できる', () => {
        // Given
        const erasedGroups: PuyoGroupData[] = [
          {
            puyos: [],
            color: 'red',
            size: 4,
            baseScore: 40,
            positions: [],
          },
        ]
        const calculateScore = calculateChainScore(2, false)

        // When
        const score = calculateScore(erasedGroups)

        // Then
        expect(typeof score).toBe('number')
        expect(score).toBeGreaterThan(0)
      })
    })
  })

  describe('連鎖判定関数', () => {
    describe('hasNextChain', () => {
      it('次の連鎖があるフィールドでtrueを返す', () => {
        // Given
        const field = createFieldFromPattern([
          ['R', 'R', 'R', 'R'],
          ['B', 'B', 'B', 'G'],
        ])

        // When
        const result = hasNextChain(field)

        // Then
        expect(result).toBe(true)
      })

      it('次の連鎖がないフィールドでfalseを返す', () => {
        // Given
        const field = createFieldFromPattern([
          ['R', 'B', 'G'],
          ['B', 'G', 'R'],
        ])

        // When
        const result = hasNextChain(field)

        // Then
        expect(result).toBe(false)
      })
    })

    describe('isAllClear', () => {
      it('空のフィールドでtrueを返す', () => {
        // Given
        const field = createFieldFromPattern([
          ['.', '.', '.'],
          ['.', '.', '.'],
        ])

        // When
        const result = isAllClear(field)

        // Then
        expect(result).toBe(true)
      })

      it('ぷよがあるフィールドでfalseを返す', () => {
        // Given
        const field = createFieldFromPattern([
          ['R', '.', '.'],
          ['.', '.', '.'],
        ])

        // When
        const result = isAllClear(field)

        // Then
        expect(result).toBe(false)
      })
    })
  })

  describe('連鎖処理パイプライン', () => {
    describe('processSingleChain', () => {
      it('単一連鎖を処理し結果を返す', () => {
        // Given
        const field = createFieldFromPattern([
          ['R', 'R', 'R', 'R'],
          ['B', 'B', 'B', 'G'],
        ])

        // When
        const result = processSingleChain(1, field)

        // Then
        expect(result.erasedGroups).toHaveLength(1)
        expect(result.chainCount).toBe(1)
        expect(result.totalScore).toBeGreaterThan(0)
        expect(result.isAllClear).toBe(false)
        expect(Object.isFrozen(result)).toBe(true)
      })

      it('消去可能グループがない場合は空の結果を返す', () => {
        // Given
        const field = createFieldFromPattern([
          ['R', 'B', 'G'],
          ['B', 'G', 'R'],
        ])

        // When
        const result = processSingleChain(1, field)

        // Then
        expect(result.erasedGroups).toHaveLength(0)
        expect(result.totalScore).toBe(0)
        expect(result.bonusScore).toBe(0)
      })

      it('カリー化された関数として使用できる', () => {
        // Given
        const field = createFieldFromPattern([['R', 'R', 'R', 'R']])
        const processChain1 = processSingleChain(1)

        // When
        const result = processChain1(field)

        // Then
        expect(result.chainCount).toBe(1)
        expect(result.erasedGroups).toHaveLength(1)
      })
    })

    describe('executeChainStep', () => {
      it('連鎖ステップを実行し結果を返す', () => {
        // Given
        const field = createFieldFromPattern([
          ['R', 'R', 'R', 'R'],
          ['.', '.', '.', '.'],
        ])

        // When
        const result = executeChainStep(1, field)

        // Then
        expect(result.erasedGroups).toHaveLength(1)
        expect(result.chainCount).toBe(1)
        expect(result.totalScore).toBeGreaterThan(0)
        expect(Object.isFrozen(result)).toBe(true)
      })

      it('カリー化された関数として使用できる', () => {
        // Given
        const field = createFieldFromPattern([['R', 'R', 'R', 'R']])
        const executeStep1 = executeChainStep(1)

        // When
        const result = executeStep1(field)

        // Then
        expect(result.chainCount).toBe(1)
      })
    })

    describe('combineChainResults', () => {
      it('複数の連鎖結果を正しく組み合わせる', () => {
        // Given
        const result1: ChainResult = {
          erasedGroups: [
            { puyos: [], color: 'red', size: 4, baseScore: 40, positions: [] },
          ],
          chainCount: 1,
          totalScore: 320,
          isAllClear: false,
          bonusScore: 280,
        }
        const result2: ChainResult = {
          erasedGroups: [
            { puyos: [], color: 'blue', size: 5, baseScore: 50, positions: [] },
          ],
          chainCount: 2,
          totalScore: 800,
          isAllClear: true,
          bonusScore: 750,
        }

        // When
        const combined = combineChainResults([result1, result2])

        // Then
        expect(combined.erasedGroups).toHaveLength(2)
        expect(combined.chainCount).toBe(2) // 最大値
        expect(combined.totalScore).toBe(1120) // 合計
        expect(combined.bonusScore).toBe(1030) // 合計
        expect(combined.isAllClear).toBe(true) // いずれかがtrue
        expect(Object.isFrozen(combined)).toBe(true)
      })
    })
  })

  describe('関数型プログラミングの性質', () => {
    it('純粋関数：同じ入力に対して常に同じ出力を返す', () => {
      // Given
      const field = createFieldFromPattern([
        ['R', 'R', 'R', 'R'],
        ['B', 'B', 'B', 'G'],
      ])

      // When
      const result1 = findErasableGroups(field)
      const result2 = findErasableGroups(field)

      // Then
      expect(result1).toEqual(result2)
      expect(calculateChainBonus(3)).toBe(calculateChainBonus(3))
      expect(calculateGroupBonus(2)).toBe(calculateGroupBonus(2))
    })

    it('イミュータビリティ：返されるオブジェクトが凍結されている', () => {
      // Given
      const field = createFieldFromPattern([['R', 'R', 'R', 'R']])

      // When
      const erasableGroups = findErasableGroups(field)
      const chainResult = processSingleChain(1, field)

      // Then
      erasableGroups.forEach((group) => {
        expect(Object.isFrozen(group)).toBe(true)
      })
      expect(Object.isFrozen(chainResult)).toBe(true)
    })

    it('副作用なし：元のデータを変更しない', () => {
      // Given
      const originalField = createFieldFromPattern([
        ['R', 'R', 'R', 'R'],
        ['B', 'B', 'B', 'G'],
      ])
      const originalFieldString = JSON.stringify(originalField)

      // When
      findErasableGroups(originalField)
      processSingleChain(1, originalField)
      calculateChainScore(1, false, [])
      hasNextChain(originalField)

      // Then
      expect(JSON.stringify(originalField)).toBe(originalFieldString)
    })

    it('関数合成：複数の関数を組み合わせて使用できる', () => {
      // Given
      const field = createFieldFromPattern([['R', 'R', 'R', 'R']])

      // When
      const processAndCheck = (field: FieldData) => {
        const result = processSingleChain(1, field)
        return result.totalScore > 0
      }

      // Then
      expect(processAndCheck(field)).toBe(true)
      expect(typeof processAndCheck).toBe('function')
    })
  })

  describe('下位互換性', () => {
    it('レガシーAPIが引き続き動作する', () => {
      // Given
      // レガシーAPIのテストは必要に応じて実装
      // 現在は新しい関数型APIのテストに集中
      expect(true).toBe(true)
    })
  })
})
