/**
 * MLAIServiceのテスト
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AIGameState } from '../../../domain/models/ai/index'
import type { StrategyPort } from '../../ports/StrategyPort'
import { MLAIService } from './MLAIService'

// TensorFlow.jsのモック
vi.mock('@tensorflow/tfjs', () => ({
  sequential: vi.fn(() => ({
    compile: vi.fn(),
    predict: vi.fn(() => ({
      data: vi.fn().mockResolvedValue([0.5]),
      dispose: vi.fn(),
    })),
    dispose: vi.fn(),
  })),
  layers: {
    dense: vi.fn(),
    dropout: vi.fn(),
  },
  train: {
    adam: vi.fn(),
  },
  tensor2d: vi.fn(() => ({
    dispose: vi.fn(),
  })),
}))

describe('MLAIService', () => {
  let service: MLAIService
  let mockStrategyPort: StrategyPort

  const mockGameState: AIGameState = {
    field: {
      width: 6,
      height: 12,
      cells: Array(6)
        .fill(null)
        .map(() => Array(12).fill(null)),
    },
    currentPuyoPair: {
      primaryColor: 'red',
      secondaryColor: 'blue',
      x: 2,
      y: 0,
      rotation: 0,
    },
    nextPuyoPair: null,
    score: 0,
  }

  beforeEach(() => {
    mockStrategyPort = {
      getActiveStrategy: vi.fn().mockResolvedValue(null),
      setActiveStrategy: vi.fn(),
      getStrategyById: vi.fn(),
      getAllStrategies: vi.fn(),
      saveStrategy: vi.fn(),
      deleteStrategy: vi.fn(),
      getDefaultStrategies: vi.fn().mockReturnValue([]),
      clearAllStrategies: vi.fn(),
    }
    service = new MLAIService(mockStrategyPort)
  })

  afterEach(() => {
    service.dispose()
  })

  describe('基本機能', () => {
    it('初期状態でAIが無効になっている', () => {
      expect(service.isEnabled()).toBe(false)
    })

    it('AI設定を更新できる', () => {
      const settings = {
        enabled: true,
        thinkingSpeed: 500,
      }

      service.updateSettings(settings)
      expect(service.isEnabled()).toBe(true)
    })

    it('AIを有効化/無効化できる', () => {
      service.setEnabled(true)
      expect(service.isEnabled()).toBe(true)

      service.setEnabled(false)
      expect(service.isEnabled()).toBe(false)
    })
  })

  describe('AI判断', () => {
    beforeEach(() => {
      service.setEnabled(true)
    })

    it('有効な手に対して適切な評価を返す', async () => {
      const move = await service.decideMove(mockGameState)

      expect(move).toEqual({
        x: expect.any(Number),
        rotation: expect.any(Number),
        score: expect.any(Number),
        evaluation: expect.objectContaining({
          heightScore: expect.any(Number),
          centerScore: expect.any(Number),
          modeScore: expect.any(Number),
          totalScore: expect.any(Number),
          reason: expect.any(String),
        }),
      })
    })

    it('AIが無効な場合はエラーを投げる', async () => {
      service.setEnabled(false)

      await expect(service.decideMove(mockGameState)).rejects.toThrow(
        'AI is not enabled or no current puyo pair',
      )
    })

    it('現在のぷよペアがない場合はエラーを投げる', async () => {
      const gameStateWithoutPuyo = {
        ...mockGameState,
        currentPuyoPair: null,
      }

      await expect(service.decideMove(gameStateWithoutPuyo)).rejects.toThrow(
        'AI is not enabled or no current puyo pair',
      )
    })
  })

  describe('機械学習機能', () => {
    it('モデルの準備状態を取得できる', () => {
      const isReady = service.isModelReady()
      expect(typeof isReady).toBe('boolean')
    })

    it('学習データを追加できる（スタブ）', () => {
      const mockMove = {
        x: 2,
        rotation: 0,
        score: 85,
      }

      // エラーが投げられないことを確認
      expect(() => {
        service.addTrainingData(mockGameState, mockMove, 1.0)
      }).not.toThrow()
    })
  })

  describe('リソース管理', () => {
    it('disposeを呼び出してもエラーが発生しない', () => {
      expect(() => {
        service.dispose()
      }).not.toThrow()
    })

    it('dispose後にモデルが無効になる', () => {
      service.dispose()
      expect(service.isModelReady()).toBe(false)
    })
  })

  describe('戦略統合', () => {
    it('戦略設定を更新できる', async () => {
      await expect(service.updateStrategy()).resolves.not.toThrow()
      expect(mockStrategyPort.getActiveStrategy).toHaveBeenCalled()
    })

    it('現在の戦略を取得できる', () => {
      const strategy = service.getCurrentStrategy()
      expect(strategy).toBe(null) // モックでnullを返すため
    })
  })
})
