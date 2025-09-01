/**
 * useLearningSystemフックのテスト
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook } from '@testing-library/react'

import type { LearningService } from '../../application/services/learning/LearningService'
import { useLearningSystem } from './useLearningSystem'

// LearningServiceのモック
const mockLearningService: LearningService = {
  startLearning: vi.fn().mockResolvedValue({
    accuracy: 0.85,
    loss: 0.15,
    trainingDataSize: 1000,
    modelPath: '/models/test-model',
    timestamp: new Date(),
  }),
  evaluateModel: vi.fn().mockResolvedValue({
    accuracy: 0.8,
    loss: 0.2,
    testDataSize: 200,
    timestamp: new Date(),
  }),
  isLearning: vi.fn().mockReturnValue(false),
  getCurrentProgress: vi.fn().mockReturnValue(0),
  stopLearning: vi.fn(),
  getPerformanceHistory: vi.fn().mockReturnValue([]),
  getLearningHistory: vi.fn().mockReturnValue([]),
}

describe('useLearningSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初期状態', () => {
    it('正しい初期状態で初期化される', () => {
      const { result } = renderHook(() =>
        useLearningSystem(mockLearningService),
      )

      expect(result.current.currentTab).toBe('game')
      expect(result.current.isLearning).toBe(false)
      expect(result.current.learningProgress).toBe(0)
      expect(result.current.currentModel).toBe('mayah-ai-v1')
      expect(result.current.latestPerformance).toBeNull()
      expect(result.current.learningHistory).toEqual([])
    })
  })

  describe('タブ管理', () => {
    it('タブを切り替えできる', () => {
      const { result } = renderHook(() =>
        useLearningSystem(mockLearningService),
      )

      act(() => {
        result.current.setCurrentTab('learning')
      })

      expect(result.current.currentTab).toBe('learning')

      act(() => {
        result.current.setCurrentTab('analysis')
      })

      expect(result.current.currentTab).toBe('analysis')
    })
  })

  describe('学習制御', () => {
    it('学習ハンドラーが存在する', () => {
      const { result } = renderHook(() =>
        useLearningSystem(mockLearningService),
      )

      expect(typeof result.current.handleStartLearning).toBe('function')
      expect(typeof result.current.handleStopLearning).toBe('function')
    })

    it('学習状態を正しく管理する', () => {
      const { result } = renderHook(() =>
        useLearningSystem(mockLearningService),
      )

      // 初期状態
      expect(result.current.isLearning).toBe(false)
      expect(result.current.learningProgress).toBe(0)
    })
  })

  describe('モデル管理', () => {
    it('現在のモデル情報を取得できる', () => {
      const { result } = renderHook(() =>
        useLearningSystem(mockLearningService),
      )

      expect(result.current.currentModel).toBe('mayah-ai-v1')
      expect(typeof result.current.handleModelSelect).toBe('function')
    })

    it('モデル比較ハンドラーが存在する', () => {
      const { result } = renderHook(() =>
        useLearningSystem(mockLearningService),
      )

      expect(typeof result.current.handleCompareModels).toBe('function')
      expect(Array.isArray(result.current.models)).toBe(true)
    })
  })

  describe('A/Bテスト機能', () => {
    it('A/Bテスト関連のハンドラーが存在する', () => {
      const { result } = renderHook(() =>
        useLearningSystem(mockLearningService),
      )

      expect(typeof result.current.handleStartABTest).toBe('function')
      expect(typeof result.current.handleStopABTest).toBe('function')
      expect(Array.isArray(result.current.abTests)).toBe(true)
    })

    it('初期状態でA/Bテスト配列が空である', () => {
      const { result } = renderHook(() =>
        useLearningSystem(mockLearningService),
      )

      expect(result.current.abTests.length).toBe(0)
    })
  })

  describe('パフォーマンス情報', () => {
    it('最新のパフォーマンス情報の初期状態を確認', () => {
      const { result } = renderHook(() =>
        useLearningSystem(mockLearningService),
      )

      expect(result.current.latestPerformance).toBeNull()
    })
  })

  describe('学習履歴', () => {
    it('学習履歴の初期状態を確認', () => {
      const { result } = renderHook(() =>
        useLearningSystem(mockLearningService),
      )

      expect(Array.isArray(result.current.learningHistory)).toBe(true)
      expect(result.current.learningHistory.length).toBe(0)
    })
  })
})
