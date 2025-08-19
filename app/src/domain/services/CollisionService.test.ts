import { beforeEach, describe, expect, it } from 'vitest'

import { FieldAdapter } from '../models/FieldAdapter'
import { createEmptyField } from '../models/ImmutableField'
import { createPuyo } from '../models/Puyo'
import { createPuyoPair } from '../models/PuyoPair'
import { CollisionService } from './CollisionService'

describe('CollisionService', () => {
  let service: CollisionService
  let field: FieldAdapter

  beforeEach(() => {
    service = new CollisionService()
    // 6x13のフィールドを作成
    field = new FieldAdapter(createEmptyField(6, 13))
  })

  describe('canPlacePuyo', () => {
    it('空の位置にはぷよを配置できる', () => {
      const puyo = createPuyo('red', { x: 0, y: 12 })
      expect(service.canPlacePuyo(puyo, field)).toBe(true)
    })

    it('境界外の位置にはぷよを配置できない', () => {
      const puyo = createPuyo('red', { x: -1, y: 12 })
      expect(service.canPlacePuyo(puyo, field)).toBe(false)
    })

    it('フィールド右端を超えた位置にはぷよを配置できない', () => {
      const puyo = createPuyo('red', { x: 6, y: 12 })
      expect(service.canPlacePuyo(puyo, field)).toBe(false)
    })

    it('フィールド下端を超えた位置にはぷよを配置できない', () => {
      const puyo = createPuyo('red', { x: 0, y: 13 })
      expect(service.canPlacePuyo(puyo, field)).toBe(false)
    })

    it('既にぷよがある位置には配置できない', () => {
      field = field.withPuyo(0, 12, createPuyo('blue', { x: 0, y: 12 }))
      const puyo = createPuyo('red', { x: 0, y: 12 })
      expect(service.canPlacePuyo(puyo, field)).toBe(false)
    })
  })

  describe('canPlacePuyoPair', () => {
    it('空の位置にはぷよペアを配置できる', () => {
      const pair = createPuyoPair('red', 'blue', 2, 1)
      expect(service.canPlacePuyoPair(pair, field)).toBe(true)
    })

    it('どちらか一方でも配置できない場合はぷよペア全体が配置できない', () => {
      field = field.withPuyo(2, 1, createPuyo('green', { x: 2, y: 1 }))
      const pair = createPuyoPair('red', 'blue', 2, 1)
      expect(service.canPlacePuyoPair(pair, field)).toBe(false)
    })

    it('境界外にはぷよペアを配置できない', () => {
      const pair = createPuyoPair('red', 'blue', -1, 1)
      expect(service.canPlacePuyoPair(pair, field)).toBe(false)
    })
  })

  describe('findLandingPosition', () => {
    it('空のフィールドではぷよペアが最下段まで落下する', () => {
      const pair = createPuyoPair('red', 'blue', 2, 1)

      const landingPair = service.findLandingPosition(pair, field)
      expect(landingPair).not.toBeNull()
      expect(landingPair!.main.position.y).toBe(12)
      expect(landingPair!.sub.position.y).toBe(11)
    })

    it('ぷよがある場合はその上に着地する', () => {
      field = field.withPuyo(2, 12, createPuyo('green', { x: 2, y: 12 }))
      field = field.withPuyo(2, 11, createPuyo('yellow', { x: 2, y: 11 }))

      const pair = createPuyoPair('red', 'blue', 2, 1)

      const landingPair = service.findLandingPosition(pair, field)
      expect(landingPair).not.toBeNull()
      expect(landingPair!.main.position.y).toBe(10)
      expect(landingPair!.sub.position.y).toBe(9)
    })

    it('配置できない場合はnullを返す', () => {
      // フィールドを上まで埋める
      for (let y = 0; y < 13; y++) {
        field = field.withPuyo(2, y, createPuyo('green', { x: 2, y }))
      }

      const pair = createPuyoPair('red', 'blue', 2, 1)

      const landingPair = service.findLandingPosition(pair, field)
      expect(landingPair).toBeNull()
    })
  })

  describe('isWithinBounds', () => {
    it('有効な範囲内の座標でtrueを返す', () => {
      expect(service.isWithinBounds({ x: 0, y: 0 }, field)).toBe(true)
      expect(service.isWithinBounds({ x: 5, y: 12 }, field)).toBe(true)
      expect(service.isWithinBounds({ x: 3, y: 6 }, field)).toBe(true)
    })

    it('範囲外の座標でfalseを返す', () => {
      expect(service.isWithinBounds({ x: -1, y: 0 }, field)).toBe(false)
      expect(service.isWithinBounds({ x: 6, y: 0 }, field)).toBe(false)
      expect(service.isWithinBounds({ x: 0, y: -1 }, field)).toBe(false)
      expect(service.isWithinBounds({ x: 0, y: 13 }, field)).toBe(false)
    })
  })

  describe('canMoveHorizontally', () => {
    it('空の場所への水平移動は可能', () => {
      const pair = createPuyoPair('red', 'blue', 2, 10)

      expect(service.canMoveHorizontally(pair, 1, field)).toBe(true)
      expect(service.canMoveHorizontally(pair, -1, field)).toBe(true)
    })

    it('境界を超える移動は不可能', () => {
      const pair = createPuyoPair('red', 'blue', 0, 10)

      expect(service.canMoveHorizontally(pair, -1, field)).toBe(false)
    })

    it('ぷよがある場所への移動は不可能', () => {
      field = field.withPuyo(3, 10, createPuyo('green', { x: 3, y: 10 }))

      const pair = createPuyoPair('red', 'blue', 2, 10)

      expect(service.canMoveHorizontally(pair, 1, field)).toBe(false)
    })
  })

  describe('canRotate', () => {
    it('空の場所への回転は可能', () => {
      const originalPair = createPuyoPair('red', 'blue', 2, 10)

      // 回転後のペアを新しい位置で作成
      const rotatedPair = createPuyoPair('red', 'blue', 2, 10)
      // 回転をシミュレート: subが右側に移動
      const rotatedPairRotated = {
        ...rotatedPair,
        sub: {
          ...rotatedPair.sub,
          position: { x: 3, y: 10 },
        },
      }

      expect(service.canRotate(originalPair, rotatedPairRotated, field)).toBe(
        true,
      )
    })

    it('ぷよがある場所への回転は不可能', () => {
      field = field.withPuyo(3, 10, createPuyo('green', { x: 3, y: 10 }))

      const originalPair = createPuyoPair('red', 'blue', 2, 10)

      // 回転後のペアを新しい位置で作成
      const rotatedPair = createPuyoPair('red', 'blue', 2, 10)
      const rotatedPairRotated = {
        ...rotatedPair,
        sub: {
          ...rotatedPair.sub,
          position: { x: 3, y: 10 },
        },
      }

      expect(service.canRotate(originalPair, rotatedPairRotated, field)).toBe(
        false,
      )
    })
  })

  describe('findWallKickPosition', () => {
    it('壁蹴り可能な位置を見つける', () => {
      const rotatedPair = createPuyoPair('red', 'blue', 5, 10)
      // サブぷよが境界外に配置される状況
      const rotatedPairWithBoundaryIssue = {
        ...rotatedPair,
        sub: {
          ...rotatedPair.sub,
          position: { x: 6, y: 10 },
        },
      }

      const kickOffsets = [
        { x: -1, y: 0 },
        { x: -2, y: 0 },
      ]

      const result = service.findWallKickPosition(
        rotatedPairWithBoundaryIssue,
        field,
        kickOffsets,
      )
      expect(result).not.toBeNull()
      expect(result!.main.position.x).toBe(4)
      expect(result!.sub.position.x).toBe(5)
    })

    it('壁蹴り不可能な場合はnullを返す', () => {
      // 左側をぷよで埋める
      field = field.withPuyo(3, 10, createPuyo('green', { x: 3, y: 10 }))
      field = field.withPuyo(4, 10, createPuyo('green', { x: 4, y: 10 }))

      const rotatedPair = createPuyoPair('red', 'blue', 5, 10)
      const rotatedPairWithBoundaryIssue = {
        ...rotatedPair,
        sub: {
          ...rotatedPair.sub,
          position: { x: 6, y: 10 },
        },
      }

      const kickOffsets = [
        { x: -1, y: 0 },
        { x: -2, y: 0 },
      ]

      const result = service.findWallKickPosition(
        rotatedPairWithBoundaryIssue,
        field,
        kickOffsets,
      )
      expect(result).toBeNull()
    })
  })

  describe('isGameOver', () => {
    it('生成位置が空の場合はゲームオーバーではない', () => {
      expect(service.isGameOver(field, { x: 2, y: 0 })).toBe(false)
    })

    it('生成位置にぷよがある場合はゲームオーバー', () => {
      field = field.withPuyo(2, 0, createPuyo('red', { x: 2, y: 0 }))
      expect(service.isGameOver(field, { x: 2, y: 0 })).toBe(true)
    })
  })

  describe('isDangerZone', () => {
    it('危険ライン以下にぷよがない場合は安全', () => {
      field = field.withPuyo(0, 5, createPuyo('red', { x: 0, y: 5 }))
      expect(service.isDangerZone(field, 2)).toBe(false)
    })

    it('危険ライン以上にぷよがある場合は危険', () => {
      field = field.withPuyo(0, 1, createPuyo('red', { x: 0, y: 1 }))
      expect(service.isDangerZone(field, 2)).toBe(true)
    })

    it('カスタム危険ラインで正しく判定する', () => {
      field = field.withPuyo(0, 3, createPuyo('red', { x: 0, y: 3 }))
      expect(service.isDangerZone(field, 4)).toBe(true)
      expect(service.isDangerZone(field, 3)).toBe(false)
    })
  })

  describe('findFloatingPuyos', () => {
    it('浮いているぷよを正しく検出する', () => {
      field = field.withPuyo(2, 8, createPuyo('red', { x: 2, y: 8 }))
      field = field.withPuyo(2, 6, createPuyo('blue', { x: 2, y: 6 }))
      field = field.withPuyo(2, 5, createPuyo('green', { x: 2, y: 5 }))

      const floatingPuyos = service.findFloatingPuyos(field, { x: 2, y: 10 })
      expect(floatingPuyos).toHaveLength(3)
      expect(floatingPuyos.map((p) => p.y)).toEqual([8, 6, 5])
    })

    it('浮いているぷよがない場合は空配列を返す', () => {
      const floatingPuyos = service.findFloatingPuyos(field, { x: 2, y: 10 })
      expect(floatingPuyos).toEqual([])
    })

    it('指定位置より下のぷよは検出しない', () => {
      field = field.withPuyo(2, 11, createPuyo('red', { x: 2, y: 11 }))
      field = field.withPuyo(2, 8, createPuyo('blue', { x: 2, y: 8 }))

      const floatingPuyos = service.findFloatingPuyos(field, { x: 2, y: 10 })
      expect(floatingPuyos).toHaveLength(1)
      expect(floatingPuyos[0].y).toBe(8)
    })
  })
})
