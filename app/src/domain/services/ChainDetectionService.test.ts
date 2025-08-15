import { beforeEach, describe, expect, it } from 'vitest'

import { FieldAdapter } from '../models/FieldAdapter'
import { createField } from '../models/ImmutableField'
import { createPuyo, type PuyoColor } from '../models/Puyo'
import { ChainDetectionService } from './ChainDetectionService'

describe('ChainDetectionService', () => {
  let service: ChainDetectionService
  let field: FieldAdapter

  beforeEach(() => {
    service = new ChainDetectionService()
    // 6x13のフィールドを作成
    field = new FieldAdapter(createField(6, 13))
  })

  describe('findErasableGroups', () => {
    it('空のフィールドでは消去可能グループがない', () => {
      const result = service.findErasableGroups(field)
      expect(result).toEqual([])
    })

    it('4つ未満の連結では消去可能グループにならない', () => {
      // 赤ぷよを3つ横に並べる
      field = field.withPuyo(0, 12, createPuyo('red', { x: 0, y: 12 }))
      field = field.withPuyo(1, 12, createPuyo('red', { x: 1, y: 12 }))
      field = field.withPuyo(2, 12, createPuyo('red', { x: 2, y: 12 }))

      const result = service.findErasableGroups(field)
      expect(result).toEqual([])
    })

    it('4つ以上の横連結で消去可能グループが見つかる', () => {
      // 赤ぷよを4つ横に並べる
      field = field.withPuyo(0, 12, createPuyo('red', { x: 0, y: 12 }))
      field = field.withPuyo(1, 12, createPuyo('red', { x: 1, y: 12 }))
      field = field.withPuyo(2, 12, createPuyo('red', { x: 2, y: 12 }))
      field = field.withPuyo(3, 12, createPuyo('red', { x: 3, y: 12 }))

      const result = service.findErasableGroups(field)
      expect(result).toHaveLength(1)
      expect(result[0].color).toBe('red')
      expect(result[0].size).toBe(4)
      expect(result[0].puyos).toHaveLength(4)
      expect(result[0].baseScore).toBe(40)
    })

    it('4つ以上の縦連結で消去可能グループが見つかる', () => {
      // 青ぷよを4つ縦に並べる
      field = field.withPuyo(0, 9, createPuyo('blue', { x: 0, y: 9 }))
      field = field.withPuyo(0, 10, createPuyo('blue', { x: 0, y: 10 }))
      field = field.withPuyo(0, 11, createPuyo('blue', { x: 0, y: 11 }))
      field = field.withPuyo(0, 12, createPuyo('blue', { x: 0, y: 12 }))

      const result = service.findErasableGroups(field)
      expect(result).toHaveLength(1)
      expect(result[0].color).toBe('blue')
      expect(result[0].size).toBe(4)
    })

    it('L字型の連結で消去可能グループが見つかる', () => {
      // L字型に5つ配置
      field = field.withPuyo(0, 11, createPuyo('green', { x: 0, y: 11 }))
      field = field.withPuyo(0, 12, createPuyo('green', { x: 0, y: 12 }))
      field = field.withPuyo(1, 12, createPuyo('green', { x: 1, y: 12 }))
      field = field.withPuyo(2, 12, createPuyo('green', { x: 2, y: 12 }))
      field = field.withPuyo(3, 12, createPuyo('green', { x: 3, y: 12 }))

      const result = service.findErasableGroups(field)
      expect(result).toHaveLength(1)
      expect(result[0].size).toBe(5)
    })

    it('複数の消去可能グループが存在する場合', () => {
      // 赤ぷよグループ
      field = field.withPuyo(0, 12, createPuyo('red', { x: 0, y: 12 }))
      field = field.withPuyo(1, 12, createPuyo('red', { x: 1, y: 12 }))
      field = field.withPuyo(2, 12, createPuyo('red', { x: 2, y: 12 }))
      field = field.withPuyo(3, 12, createPuyo('red', { x: 3, y: 12 }))

      // 青ぷよグループ（離れた場所）
      field = field.withPuyo(0, 8, createPuyo('blue', { x: 0, y: 8 }))
      field = field.withPuyo(0, 9, createPuyo('blue', { x: 0, y: 9 }))
      field = field.withPuyo(0, 10, createPuyo('blue', { x: 0, y: 10 }))
      field = field.withPuyo(0, 11, createPuyo('blue', { x: 0, y: 11 }))

      const result = service.findErasableGroups(field)
      expect(result).toHaveLength(2)
    })

    it('異なる色のぷよは別々のグループとして扱われる', () => {
      field = field.withPuyo(0, 12, createPuyo('red', { x: 0, y: 12 }))
      field = field.withPuyo(1, 12, createPuyo('blue', { x: 1, y: 12 }))
      field = field.withPuyo(2, 12, createPuyo('red', { x: 2, y: 12 }))
      field = field.withPuyo(3, 12, createPuyo('red', { x: 3, y: 12 }))

      const result = service.findErasableGroups(field)
      expect(result).toEqual([])
    })
  })

  describe('findConnectedPuyos', () => {
    it('nullカラーでは空配列を返す', () => {
      const visited = Array(6)
        .fill(null)
        .map(() => Array(13).fill(false))
      const result = service.findConnectedPuyos(field, 0, 0, null, visited)
      expect(result).toEqual([])
    })

    it('単一のぷよの場合', () => {
      field = field.withPuyo(0, 12, createPuyo('red', { x: 0, y: 12 }))
      const visited = Array(6)
        .fill(null)
        .map(() => Array(13).fill(false))

      const result = service.findConnectedPuyos(field, 0, 12, 'red', visited)
      expect(result).toHaveLength(1)
      expect(result[0].color).toBe('red')
    })

    it('連結されたぷよを正しく検出', () => {
      field = field.withPuyo(0, 12, createPuyo('red', { x: 0, y: 12 }))
      field = field.withPuyo(1, 12, createPuyo('red', { x: 1, y: 12 }))
      field = field.withPuyo(2, 12, createPuyo('red', { x: 2, y: 12 }))

      const visited = Array(6)
        .fill(null)
        .map(() => Array(13).fill(false))
      const result = service.findConnectedPuyos(field, 0, 12, 'red', visited)
      expect(result).toHaveLength(3)
    })

    it('異なる色のぷよは含まれない', () => {
      field = field.withPuyo(0, 12, createPuyo('red', { x: 0, y: 12 }))
      field = field.withPuyo(1, 12, createPuyo('blue', { x: 1, y: 12 }))
      field = field.withPuyo(2, 12, createPuyo('red', { x: 2, y: 12 }))

      const visited = Array(6)
        .fill(null)
        .map(() => Array(13).fill(false))
      const result = service.findConnectedPuyos(field, 0, 12, 'red', visited)
      expect(result).toHaveLength(1)
    })
  })

  describe('calculateChainBonus', () => {
    it('連鎖数0以下では0を返す', () => {
      expect(service.calculateChainBonus(0)).toBe(0)
      expect(service.calculateChainBonus(-1)).toBe(0)
    })

    it('1連鎖では8を返す', () => {
      expect(service.calculateChainBonus(1)).toBe(8)
    })

    it('2連鎖では16を返す', () => {
      expect(service.calculateChainBonus(2)).toBe(16)
    })

    it('最大値を超える場合は最大値を返す', () => {
      expect(service.calculateChainBonus(100)).toBe(512)
    })
  })

  describe('calculateGroupBonus', () => {
    it('グループ数1以下では0を返す', () => {
      expect(service.calculateGroupBonus(0)).toBe(0)
      expect(service.calculateGroupBonus(1)).toBe(0)
    })

    it('2グループでは3を返す', () => {
      expect(service.calculateGroupBonus(2)).toBe(3)
    })

    it('3グループでは4を返す', () => {
      expect(service.calculateGroupBonus(3)).toBe(4)
    })

    it('最大値を超える場合は最大値を返す', () => {
      expect(service.calculateGroupBonus(100)).toBe(10)
    })
  })

  describe('calculateAllClearBonus', () => {
    it('全消しボーナスは2100を返す', () => {
      expect(service.calculateAllClearBonus()).toBe(2100)
    })
  })

  describe('calculateChainScore', () => {
    it('単一グループのスコア計算', () => {
      const groups = [
        {
          puyos: Array(4).fill(createPuyo('red', { x: 0, y: 0 })),
          color: 'red' as PuyoColor,
          size: 4,
          baseScore: 40,
        },
      ]

      const score = service.calculateChainScore(groups, 1, false)
      expect(score).toBe(40 * 8) // ベーススコア × チェインボーナス
    })

    it('複数グループのスコア計算', () => {
      const groups = [
        {
          puyos: Array(4).fill(createPuyo('red', { x: 0, y: 0 })),
          color: 'red' as PuyoColor,
          size: 4,
          baseScore: 40,
        },
        {
          puyos: Array(4).fill(createPuyo('blue', { x: 0, y: 0 })),
          color: 'blue' as PuyoColor,
          size: 4,
          baseScore: 40,
        },
      ]

      const score = service.calculateChainScore(groups, 1, false)
      const expectedBonus = 8 + 3 // チェインボーナス + グループボーナス（2グループなので3）
      expect(score).toBe(80 * expectedBonus)
    })

    it('全消しボーナス込みのスコア計算', () => {
      const groups = [
        {
          puyos: Array(4).fill(createPuyo('red', { x: 0, y: 0 })),
          color: 'red' as PuyoColor,
          size: 4,
          baseScore: 40,
        },
      ]

      const score = service.calculateChainScore(groups, 1, true)
      expect(score).toBe(40 * 8 + 2100)
    })
  })

  describe('hasNextChain', () => {
    it('消去可能グループがない場合はfalse', () => {
      const result = service.hasNextChain(field)
      expect(result).toBe(false)
    })

    it('消去可能グループがある場合はtrue', () => {
      field = field.withPuyo(0, 12, createPuyo('red', { x: 0, y: 12 }))
      field = field.withPuyo(1, 12, createPuyo('red', { x: 1, y: 12 }))
      field = field.withPuyo(2, 12, createPuyo('red', { x: 2, y: 12 }))
      field = field.withPuyo(3, 12, createPuyo('red', { x: 3, y: 12 }))

      const result = service.hasNextChain(field)
      expect(result).toBe(true)
    })
  })
})
