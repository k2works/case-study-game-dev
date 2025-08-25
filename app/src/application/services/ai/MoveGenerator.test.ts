/**
 * MoveGeneratorのテスト
 */
import { describe, expect, it } from 'vitest'

import type { PuyoColor } from '../../../domain/models/Puyo'
import type { AIGameState } from '../../../domain/models/ai/index'
import { MoveGenerator } from './MoveGenerator'

describe('MoveGenerator', () => {
  const moveGenerator = new MoveGenerator()

  const createMockGameState = (
    fieldCells: (PuyoColor | null)[][],
    currentPuyoPair?: {
      primaryColor: PuyoColor
      secondaryColor: PuyoColor
      x: number
      y: number
      rotation: number
    },
  ): AIGameState => ({
    field: {
      width: 6, // 固定の幅
      height: fieldCells.length,
      cells: fieldCells,
    },
    currentPuyoPair: currentPuyoPair || {
      primaryColor: 'red' as PuyoColor,
      secondaryColor: 'blue' as PuyoColor,
      x: 2,
      y: 0,
      rotation: 0,
    },
    nextPuyoPair: null,
    score: 0,
    chainCount: 0,
    turn: 1,
    isGameOver: false,
  })

  describe('generateMoves', () => {
    it('空のフィールドで全ての可能な手を生成する', () => {
      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createMockGameState(emptyCells)

      const moves = moveGenerator.generateMoves(gameState)

      // 6列 × 4回転 = 24手の候補が生成される（境界で無効な手も含む）
      expect(moves).toHaveLength(24)

      // 有効な手のみをチェック
      const validMoves = moves.filter((move) => move.isValid)
      expect(validMoves.length).toBeGreaterThan(0)
      expect(validMoves.length).toBeLessThanOrEqual(24)
    })

    it('currentPuyoPairがnullの場合は空の配列を返す', () => {
      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))

      const gameState: AIGameState = {
        field: {
          width: 6,
          height: 12,
          cells: emptyCells,
        },
        currentPuyoPair: null,
        nextPuyoPair: null,
        score: 0,
        chainCount: 0,
        turn: 1,
        isGameOver: false,
      }

      const moves = moveGenerator.generateMoves(gameState)

      expect(moves).toHaveLength(0)
    })

    it('フィールドに障害物がある場合は有効な手のみを返す', () => {
      const cellsWithObstacles = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 列0を満杯にする
      for (let y = 0; y < 12; y++) {
        cellsWithObstacles[y][0] = 'red' as PuyoColor
      }

      const gameState = createMockGameState(cellsWithObstacles)
      const moves = moveGenerator.generateMoves(gameState)

      // 全ての手が生成される
      expect(moves).toHaveLength(24)

      // 列0に関連する手は無効になる
      const invalidMoves = moves.filter((move) => !move.isValid)
      expect(invalidMoves.length).toBeGreaterThan(0)

      const validMoves = moves.filter((move) => move.isValid)
      expect(validMoves.length).toBeLessThan(24)
    })

    it('右端の列での90度回転は境界外になり無効', () => {
      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createMockGameState(emptyCells)

      const moves = moveGenerator.generateMoves(gameState)

      // 右端の列（x=5）で90度回転（右向き）の手は無効
      const rightEdgeRightRotation = moves.find(
        (move) => move.x === 5 && move.rotation === 90,
      )
      expect(rightEdgeRightRotation).toBeDefined()
      expect(rightEdgeRightRotation?.isValid).toBe(false)
    })

    it('左端の列での270度回転は境界外になり無効', () => {
      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createMockGameState(emptyCells)

      const moves = moveGenerator.generateMoves(gameState)

      // 左端の列（x=0）で270度回転（左向き）の手は無効
      const leftEdgeLeftRotation = moves.find(
        (move) => move.x === 0 && move.rotation === 270,
      )
      expect(leftEdgeLeftRotation).toBeDefined()
      expect(leftEdgeLeftRotation?.isValid).toBe(false)
    })
  })

  describe('有効性チェック', () => {
    it('有効な配置位置では正しいぷよの最終座標を返す', () => {
      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createMockGameState(emptyCells)

      const moves = moveGenerator.generateMoves(gameState)
      const validMove = moves.find(
        (move) => move.x === 2 && move.rotation === 0,
      )

      expect(validMove).toBeDefined()
      expect(validMove?.isValid).toBe(true)
      // 落下後の最終位置を期待（空のフィールドの底部）
      expect(validMove?.primaryPosition).toEqual({ x: 2, y: 11 })
      expect(validMove?.secondaryPosition).toEqual({ x: 2, y: 10 })
    })

    it('90度回転時の正しい座標を計算する', () => {
      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createMockGameState(emptyCells)

      const moves = moveGenerator.generateMoves(gameState)
      const rightRotationMove = moves.find(
        (move) => move.x === 2 && move.rotation === 90,
      )

      // 落下後の最終位置を期待
      expect(rightRotationMove?.primaryPosition).toEqual({ x: 2, y: 11 })
      expect(rightRotationMove?.secondaryPosition).toEqual({ x: 3, y: 11 })
    })

    it('180度回転時の正しい座標を計算する', () => {
      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createMockGameState(emptyCells)

      const moves = moveGenerator.generateMoves(gameState)
      const downRotationMove = moves.find(
        (move) => move.x === 2 && move.rotation === 180,
      )

      // 落下後の最終位置を期待
      expect(downRotationMove?.primaryPosition).toEqual({ x: 2, y: 11 })
      expect(downRotationMove?.secondaryPosition).toEqual({ x: 2, y: 11 })
    })

    it('270度回転時の正しい座標を計算する', () => {
      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createMockGameState(emptyCells)

      const moves = moveGenerator.generateMoves(gameState)
      const leftRotationMove = moves.find(
        (move) => move.x === 2 && move.rotation === 270,
      )

      // 落下後の最終位置を期待
      expect(leftRotationMove?.primaryPosition).toEqual({ x: 2, y: 11 })
      expect(leftRotationMove?.secondaryPosition).toEqual({ x: 1, y: 11 })
    })
  })
})
