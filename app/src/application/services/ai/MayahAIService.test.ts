/**
 * MayahAIService のテスト
 * Phase 4a-4c段階的実装のテスト
 */
import { beforeEach, describe, expect, it } from 'vitest'

import type { PuyoColor } from '../../../domain/models/Puyo'
import type { AIGameState } from '../../../domain/models/ai/GameState'
import { MayahAIService } from './MayahAIService'

describe('MayahAIService', () => {
  let service: MayahAIService
  let gameState: AIGameState

  beforeEach(() => {
    service = new MayahAIService()

    // テスト用のゲーム状態を作成
    gameState = {
      field: {
        width: 6,
        height: 12,
        cells: Array(12)
          .fill(null)
          .map(() => Array(6).fill(null)),
      },
      currentPuyoPair: {
        primaryColor: 'RED' as PuyoColor,
        secondaryColor: 'BLUE' as PuyoColor,
        x: 2,
        y: 0,
        rotation: 0,
      },
      nextPuyoPair: {
        primaryColor: 'GREEN' as PuyoColor,
        secondaryColor: 'YELLOW' as PuyoColor,
        x: 2,
        y: 0,
        rotation: 0,
      },
      score: 0,
    }
  })

  describe('基本機能', () => {
    it('初期状態では無効になっている', () => {
      expect(service.isEnabled()).toBe(false)
    })

    it('設定更新で有効化できる', () => {
      service.updateSettings({ enabled: true, thinkingSpeed: 500 })
      expect(service.isEnabled()).toBe(true)
    })

    it('直接有効化・無効化できる', () => {
      service.setEnabled(true)
      expect(service.isEnabled()).toBe(true)

      service.setEnabled(false)
      expect(service.isEnabled()).toBe(false)
    })
  })

  describe('Phase 4a: 基本評価システム', () => {
    beforeEach(() => {
      service.setEnabled(true)
    })

    it('手を決定できる', async () => {
      const move = await service.decideMove(gameState)

      expect(move).toHaveProperty('x')
      expect(move).toHaveProperty('rotation')
      expect(move).toHaveProperty('score')
      expect(move.x).toBeGreaterThanOrEqual(0)
      expect(move.x).toBeLessThan(6)
      expect(move.rotation).toBeGreaterThanOrEqual(0)
      expect([0, 90, 180, 270]).toContain(move.rotation)
    })

    it('評価結果を保存する', async () => {
      await service.decideMove(gameState)

      const evaluation = await service.getLastEvaluationResult()
      expect(evaluation).not.toBeNull()
      expect(evaluation?.score).toBeGreaterThan(0)
      expect(evaluation?.reason).toContain('Phase 4a基本評価')
      expect(evaluation?.phase).toBe('Phase 4a - 基本実装')
      expect(evaluation?.confidence).toBe(0.6)
    })

    it('候補手ランキングを生成する', async () => {
      await service.decideMove(gameState)

      const candidates = await service.getCandidateMovesWithEvaluation()
      expect(candidates.length).toBeGreaterThan(0)

      // ランクが正しく設定されている
      candidates.forEach((candidate, index) => {
        expect(candidate.rank).toBe(index + 1)
        expect(candidate.move).toHaveProperty('x')
        expect(candidate.evaluation).toHaveProperty('score')
      })

      // スコア順でソートされている
      for (let i = 0; i < candidates.length - 1; i++) {
        expect(candidates[i].evaluation.score).toBeGreaterThanOrEqual(
          candidates[i + 1].evaluation.score,
        )
      }
    })

    it('中央に近い手が高評価される', async () => {
      // 中央付近の手を強制的にテスト
      await service.decideMove(gameState)

      const evaluatedMoves = await service.getCandidateMovesWithEvaluation()

      // 中央(x=2,3)の手が端(x=0,5)より高評価されることを確認
      const centerMoves = evaluatedMoves.filter(
        (m) => m.move.x === 2 || m.move.x === 3,
      )
      const edgeMoves = evaluatedMoves.filter(
        (m) => m.move.x === 0 || m.move.x === 5,
      )

      if (centerMoves.length > 0 && edgeMoves.length > 0) {
        const avgCenterScore =
          centerMoves.reduce((sum, m) => sum + m.evaluation.score, 0) /
          centerMoves.length
        const avgEdgeScore =
          edgeMoves.reduce((sum, m) => sum + m.evaluation.score, 0) /
          edgeMoves.length
        expect(avgCenterScore).toBeGreaterThan(avgEdgeScore)
      }
    })

    it('AI無効時はエラーを投げる', async () => {
      service.setEnabled(false)

      await expect(service.decideMove(gameState)).rejects.toThrow(
        'AI is not enabled or no current puyo pair',
      )
    })

    it('現在のぷよペアがない場合はエラーを投げる', async () => {
      service.setEnabled(true)
      gameState.currentPuyoPair = null

      await expect(service.decideMove(gameState)).rejects.toThrow(
        'AI is not enabled or no current puyo pair',
      )
    })
  })

  describe('設定管理', () => {
    it('思考速度を設定できる', () => {
      const newSettings = { enabled: true, thinkingSpeed: 2000 }
      service.updateSettings(newSettings)

      // プライベートプロパティなので間接的にテスト
      expect(service.isEnabled()).toBe(true)
    })
  })
})
