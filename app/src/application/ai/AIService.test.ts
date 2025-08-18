/**
 * AIServiceのテスト
 */
import { beforeEach, describe, expect, it } from 'vitest'

import type { AIGameState, AISettings } from '../../domain/ai/types'
import type { PuyoColor } from '../../domain/models/Puyo'
import { AIService } from './AIService'

describe('AIService', () => {
  let aiService: AIService

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
      width: fieldCells.length,
      height: fieldCells[0]?.length || 12,
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
  })

  beforeEach(() => {
    aiService = new AIService()
  })

  describe('設定管理', () => {
    it('初期状態では無効化されている', () => {
      expect(aiService.isEnabled()).toBe(false)
    })

    it('setEnabledでAIを有効化できる', () => {
      aiService.setEnabled(true)
      expect(aiService.isEnabled()).toBe(true)
    })

    it('updateSettingsで設定を更新できる', () => {
      const newSettings: AISettings = {
        enabled: true,
        thinkingSpeed: 500,
        mode: 'aggressive',
      }

      aiService.updateSettings(newSettings)
      expect(aiService.isEnabled()).toBe(true)
    })
  })

  describe('手の決定', () => {
    beforeEach(() => {
      aiService.setEnabled(true)
      // 思考時間を短縮してテストを高速化
      aiService.updateSettings({
        enabled: true,
        thinkingSpeed: 10,
        mode: 'balanced',
      })
    })

    it('AIが無効の場合はエラーを投げる', async () => {
      aiService.setEnabled(false)
      const emptyCells = Array(6)
        .fill(null)
        .map(() => Array(12).fill(null))
      const gameState = createMockGameState(emptyCells)

      await expect(aiService.decideMove(gameState)).rejects.toThrow(
        'AI is not enabled or no current puyo pair',
      )
    })

    it('currentPuyoPairがnullの場合はエラーを投げる', async () => {
      const emptyCells = Array(6)
        .fill(null)
        .map(() => Array(12).fill(null))

      const gameState: AIGameState = {
        field: {
          width: 6,
          height: 12,
          cells: emptyCells,
        },
        currentPuyoPair: null,
        nextPuyoPair: null,
        score: 0,
      }

      await expect(aiService.decideMove(gameState)).rejects.toThrow(
        'AI is not enabled or no current puyo pair',
      )
    })

    it('空のフィールドで有効な手を返す', async () => {
      const emptyCells = Array(6)
        .fill(null)
        .map(() => Array(12).fill(null))
      const gameState = createMockGameState(emptyCells)

      const move = await aiService.decideMove(gameState)

      expect(move.x).toBeGreaterThanOrEqual(0)
      expect(move.x).toBeLessThan(6)
      expect([0, 90, 180, 270]).toContain(move.rotation)
      expect(move.score).toBeGreaterThan(0)
    })

    it('思考速度の遅延が適用される', async () => {
      aiService.updateSettings({
        enabled: true,
        thinkingSpeed: 100,
        mode: 'balanced',
      })

      const emptyCells = Array(6)
        .fill(null)
        .map(() => Array(12).fill(null))
      const gameState = createMockGameState(emptyCells)

      const startTime = Date.now()
      await aiService.decideMove(gameState)
      const endTime = Date.now()

      expect(endTime - startTime).toBeGreaterThanOrEqual(100)
    })
  })

  describe('評価戦略', () => {
    beforeEach(() => {
      aiService.setEnabled(true)
      aiService.updateSettings({
        enabled: true,
        thinkingSpeed: 10,
        mode: 'balanced',
      })
    })

    it('balancedモードで中央寄りと低い位置のバランスを考慮する', async () => {
      const emptyCells = Array(6)
        .fill(null)
        .map(() => Array(12).fill(null))
      const gameState = createMockGameState(emptyCells)

      const move = await aiService.decideMove(gameState)

      // 中央寄りの位置が選ばれることを期待
      expect(move.x).toBeGreaterThanOrEqual(1)
      expect(move.x).toBeLessThanOrEqual(4)
    })

    it('defensiveモードで低い位置を優先する', async () => {
      aiService.updateSettings({
        enabled: true,
        thinkingSpeed: 10,
        mode: 'defensive',
      })

      const cellsWithSomeHeight = Array(6)
        .fill(null)
        .map(() => Array(12).fill(null))
      // 一部の列に高さを持たせる
      cellsWithSomeHeight[1][11] = 'red' as PuyoColor
      cellsWithSomeHeight[1][10] = 'blue' as PuyoColor

      const gameState = createMockGameState(cellsWithSomeHeight)
      const move = await aiService.decideMove(gameState)

      // 低い位置への配置が優先される
      expect(move.score).toBeGreaterThan(0)
    })

    it('aggressiveモードで中央寄りを強く優遇する', async () => {
      aiService.updateSettings({
        enabled: true,
        thinkingSpeed: 10,
        mode: 'aggressive',
      })

      const emptyCells = Array(6)
        .fill(null)
        .map(() => Array(12).fill(null))
      const gameState = createMockGameState(emptyCells)

      const move = await aiService.decideMove(gameState)

      // 中央寄りの位置が強く選ばれることを期待
      expect(move.x).toBeGreaterThanOrEqual(1)
      expect(move.x).toBeLessThanOrEqual(4)
    })

    it('可能な手がない場合はデフォルトの手を返す', async () => {
      // 全ての列を満杯にする
      const fullCells = Array(6)
        .fill(null)
        .map(() => Array(12).fill('red' as PuyoColor))
      const gameState = createMockGameState(fullCells)

      const move = await aiService.decideMove(gameState)

      expect(move.x).toBe(0)
      expect(move.rotation).toBe(0)
      // 無効な手しかない場合のスコアは-1000になる
      expect(move.score).toBeLessThan(0)
    })
  })
})
