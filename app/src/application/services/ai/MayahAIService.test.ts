/**
 * MayahAIServiceのテスト
 */
import { beforeEach, describe, expect, it } from 'vitest'

import type { PuyoColor } from '../../../domain/models/Puyo'
import type { AIGameState } from '../../../domain/models/ai'
import { MayahAIService } from './MayahAIService'

describe('MayahAIService', () => {
  let aiService: MayahAIService

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
    aiService = new MayahAIService()
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
      const settings = {
        enabled: true,
        thinkingSpeed: 500,
      }

      aiService.updateSettings(settings)
      expect(aiService.isEnabled()).toBe(true)
    })
  })

  describe('手の決定', () => {
    beforeEach(() => {
      aiService.setEnabled(true)
    })

    it('AIが無効の場合はエラーを投げる', async () => {
      aiService.setEnabled(false)
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

    it('currentPuyoPairがnullの場合はエラーを投げる', async () => {
      const emptyCells = Array(6)
        .fill(null)
        .map(() => Array(12).fill(null))
      const gameState = createMockGameState(emptyCells)
      gameState.currentPuyoPair = null

      await expect(aiService.decideMove(gameState)).rejects.toThrow(
        'AI is not enabled or no current puyo pair',
      )
    })

    it('空のフィールドで有効な手を返す', async () => {
      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createMockGameState(emptyCells)

      const move = await aiService.decideMove(gameState)

      expect(move.x).toBeGreaterThanOrEqual(0)
      expect(move.x).toBeLessThan(6)
      expect([0, 90, 180, 270]).toContain(move.rotation)
      expect(move.score).toBeGreaterThanOrEqual(0)
    })

    it('思考速度の遅延が適用される', async () => {
      const startTime = Date.now()
      aiService.updateSettings({ enabled: true, thinkingSpeed: 100 })

      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createMockGameState(emptyCells)

      await aiService.decideMove(gameState)

      const endTime = Date.now()
      const elapsed = endTime - startTime
      expect(elapsed).toBeGreaterThanOrEqual(95) // 多少の誤差を許容
    })
  })

  describe('mayah AI評価システム', () => {
    beforeEach(() => {
      aiService.setEnabled(true)
    })

    it('評価結果を取得できる', async () => {
      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createMockGameState(emptyCells)

      await aiService.decideMove(gameState)
      const result = await aiService.getLastEvaluationResult()

      expect(result).not.toBeNull()
      expect(result!.basic.score).toBeGreaterThanOrEqual(0)
      expect(result!.basic.computeTime).toBeGreaterThan(0)
      expect(result!.evaluationLevels).toContain('basic')
      expect(result!.cacheInfo.hitRate).toBeGreaterThanOrEqual(0)
    })

    it('候補手ランキングを取得できる', async () => {
      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createMockGameState(emptyCells)

      await aiService.decideMove(gameState)
      const candidates = await aiService.getCandidateMovesWithEvaluation()

      expect(candidates.length).toBeGreaterThan(0)
      expect(candidates[0].rank).toBe(1)
      expect(candidates[0].move.x).toBeGreaterThanOrEqual(0)
      expect(candidates[0].move.x).toBeLessThan(6)
      expect(candidates[0].evaluation.basic.score).toBeGreaterThanOrEqual(0)
    })

    it('候補手はスコア順にソートされている', async () => {
      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createMockGameState(emptyCells)

      await aiService.decideMove(gameState)
      const candidates = await aiService.getCandidateMovesWithEvaluation()

      for (let i = 0; i < candidates.length - 1; i++) {
        expect(candidates[i].evaluation.basic.score).toBeGreaterThanOrEqual(
          candidates[i + 1].evaluation.basic.score,
        )
      }
    })
  })

  describe('ゲームフェーズ管理', () => {
    beforeEach(() => {
      aiService.setEnabled(true)
    })

    it('ゲーム初期段階では適切なフェーズが判定される', async () => {
      const emptyCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createMockGameState(emptyCells)

      const move = await aiService.decideMove(gameState)
      const result = await aiService.getLastEvaluationResult()

      expect(move.score).toBeGreaterThanOrEqual(0)
      expect(result).not.toBeNull()
      expect(result!.evaluationLevels).toContain('basic')
    })

    it('複雑なフィールド状態でも評価できる', async () => {
      // 一部にぷよが配置されたフィールド
      const complexCells = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))

      // 底部にいくつかのぷよを配置
      complexCells[11][2] = 'red'
      complexCells[11][3] = 'blue'
      complexCells[10][2] = 'red'

      const gameState = createMockGameState(complexCells)
      const move = await aiService.decideMove(gameState)

      expect(move.x).toBeGreaterThanOrEqual(0)
      expect(move.x).toBeLessThan(6)
      expect(move.score).toBeGreaterThanOrEqual(0)
    })
  })
})
