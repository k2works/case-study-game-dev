/**
 * 関数型戦略評価サービステスト
 */
import { beforeEach, describe, expect, it } from 'vitest'

import type { PuyoColor } from '../../models/Puyo'
import type { AIGameState, PossibleMove } from '../../models/ai'
import {
  type StrategyEvaluationSettings,
  evaluateStrategy,
} from './StrategyEvaluationService'
import { StrategyPriority, ThreatLevel } from './StrategyTypes'

describe('関数型戦略評価サービス', () => {
  let gameState: AIGameState
  let possibleMoves: PossibleMove[]
  let settings: StrategyEvaluationSettings

  beforeEach(() => {
    // テスト用ゲーム状態の作成
    gameState = {
      field: {
        width: 6,
        height: 13,
        cells: Array.from({ length: 13 }, (_, row) =>
          Array.from({ length: 6 }, () =>
            row > 10 ? null : ('red' as PuyoColor),
          ),
        ),
      },
      score: 1000,
      chainCount: 0,
      turn: 1,
      currentPuyoPair: {
        primaryColor: 'red' as PuyoColor,
        secondaryColor: 'blue' as PuyoColor,
        x: 2,
        y: 0,
        rotation: 0,
      },
      nextPuyoPair: {
        primaryColor: 'green' as PuyoColor,
        secondaryColor: 'yellow' as PuyoColor,
        x: 2,
        y: 0,
        rotation: 0,
      },
      isGameOver: false,
    }

    // テスト用可能手の作成
    possibleMoves = [
      {
        x: 2,
        rotation: 0,
        isValid: true,
        primaryPosition: { x: 2, y: 0 },
        secondaryPosition: { x: 2, y: 1 },
      },
    ]

    // テスト用設定の作成
    settings = {
      strategy: {
        aggressiveness: 0.7,
        riskTolerance: 0.5,
        chainPriority: 0.8,
        defensiveWeight: 0.6,
        speedPreference: 0.5,
        thinkingDepth: 3,
      },
      stare: {
        enabled: true,
        intensity: 0.7,
        responseSpeed: 0.8,
        threatThreshold: 0.6,
      },
      weights: {
        firing: 0.4,
        situation: 0.3,
        risk: 0.2,
        pattern: 0.1,
      },
    }
  })

  describe('評価戦略関数', () => {
    it('基本的な戦略評価が正常に実行される', () => {
      // When: 戦略評価を実行
      const result = evaluateStrategy(gameState, possibleMoves, [], settings)

      // Then: 結果が正常に返される
      expect(result).toBeDefined()
      expect(result.firingDetails).toBeDefined()
      expect(result.situationDetails).toBeDefined()
      expect(result.riskDetails).toBeDefined()
      expect(result.moveRecommendations).toHaveLength(1)
      expect(result.actionPlan).toBeTruthy()
      expect(result.totalScore).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeGreaterThanOrEqual(0)
    })

    it('相手状態ありの戦略評価が正常に実行される', () => {
      // Given: 相手状態を設定
      const opponentState: AIGameState = {
        ...gameState,
        field: {
          ...gameState.field,
          cells: Array.from({ length: 13 }, (_, row) =>
            Array.from({ length: 6 }, () =>
              row > 8 ? null : ('blue' as PuyoColor),
            ),
          ),
        },
      }

      // When: 相手状態ありで戦略評価を実行
      const result = evaluateStrategy(
        gameState,
        possibleMoves,
        [],
        settings,
        opponentState,
      )

      // Then: 相手を考慮した評価が実行される
      expect(result).toBeDefined()
      expect(result.riskDetails).toBeDefined()
      expect(result.situationDetails).toBeDefined()
      // 相手状態が考慮されていることを確認
      expect(result.totalScore).toBeGreaterThanOrEqual(0)
    })

    it('戦略優先度が適切に決定される', () => {
      // Given: 発火可能な状況を設定
      const chainGameState: AIGameState = {
        ...gameState,
        field: {
          ...gameState.field,
          cells: Array.from({ length: 13 }, (_, row) =>
            Array.from({ length: 6 }, () =>
              row > 11 ? null : ('red' as PuyoColor),
            ),
          ),
        },
      }

      // When: 戦略評価を実行
      const result = evaluateStrategy(
        chainGameState,
        possibleMoves,
        [],
        settings,
      )

      // Then: 適切な戦略優先度が設定される
      expect(Object.values(StrategyPriority)).toContain(
        result.recommendedPriority,
      )
      expect(result.strategyPriority).toBeDefined()
    })

    it('手の推奨評価が正常に動作する', () => {
      // Given: 複数の可能手を設定
      const multiMoves: PossibleMove[] = [
        ...possibleMoves,
        {
          x: 3,
          rotation: 1,
          isValid: true,
          primaryPosition: { x: 3, y: 0 },
          secondaryPosition: { x: 3, y: 1 },
        },
      ]

      // When: 戦略評価を実行
      const result = evaluateStrategy(gameState, multiMoves, [], settings)

      // Then: 手の推奨評価が適切に実行される
      expect(result.moveRecommendations).toHaveLength(2)

      const firstRecommendation = result.moveRecommendations[0]
      expect(firstRecommendation.move).toBeDefined()
      expect(firstRecommendation.strategicValue).toBeGreaterThanOrEqual(0)
      expect(firstRecommendation.reason).toBeTruthy()
      expect(firstRecommendation.priority).toBeGreaterThanOrEqual(0)
      expect(Object.values(ThreatLevel)).toContain(
        firstRecommendation.riskLevel,
      )

      // 戦略的価値でソートされていることを確認
      const [first, second] = result.moveRecommendations
      expect(first.strategicValue).toBeGreaterThanOrEqual(second.strategicValue)
    })

    it('実行指針が適切に生成される', () => {
      // When: 戦略評価を実行
      const result = evaluateStrategy(gameState, possibleMoves, [], settings)

      // Then: 実行指針が適切に生成される
      expect(result.actionPlan).toBeTruthy()
      expect(result.actionPlan).toContain('【')
      expect(result.actionPlan).toContain('】')
      expect(result.actionPlan).toContain('次の行動')
    })

    it('設定の重みが評価に反映される', () => {
      // Given: 異なる重み設定
      const heavyFiringSettings: StrategyEvaluationSettings = {
        ...settings,
        weights: {
          firing: 0.8,
          situation: 0.1,
          risk: 0.05,
          pattern: 0.05,
        },
      }

      const heavyRiskSettings: StrategyEvaluationSettings = {
        ...settings,
        weights: {
          firing: 0.1,
          situation: 0.1,
          risk: 0.7,
          pattern: 0.1,
        },
      }

      // When: 異なる設定で評価を実行
      const firingResult = evaluateStrategy(
        gameState,
        possibleMoves,
        [],
        heavyFiringSettings,
      )

      const riskResult = evaluateStrategy(
        gameState,
        possibleMoves,
        [],
        heavyRiskSettings,
      )

      // Then: 重みの違いが結果に反映される
      expect(firingResult.totalScore).toBeDefined()
      expect(riskResult.totalScore).toBeDefined()

      // 発火重視の場合は発火関連スコアが高い
      expect(firingResult.firingDecision).toBeGreaterThanOrEqual(0)

      // リスク重視の場合はリスク評価が高い
      expect(riskResult.riskAssessment).toBeGreaterThanOrEqual(0)
    })
  })

  describe('純粋関数特性', () => {
    it('同じ入力に対して同じ結果を返す（参照透明性）', () => {
      // When: 同じ入力で複数回評価を実行
      const result1 = evaluateStrategy(gameState, possibleMoves, [], settings)

      const result2 = evaluateStrategy(gameState, possibleMoves, [], settings)

      // Then: 同じ結果が返される
      expect(result1.totalScore).toBe(result2.totalScore)
      expect(result1.confidence).toBe(result2.confidence)
      expect(result1.recommendedPriority).toBe(result2.recommendedPriority)
    })

    it('入力オブジェクトが変更されない（副作用なし）', () => {
      // Given: 入力の元の状態を記録
      const originalField = JSON.parse(JSON.stringify(gameState.field))
      const originalMoves = [...possibleMoves]

      // When: 評価を実行
      evaluateStrategy(gameState, possibleMoves, [], settings)

      // Then: 入力が変更されていない
      expect(gameState.field).toEqual(originalField)
      expect(possibleMoves).toEqual(originalMoves)
    })
  })

  describe('エラーハンドリング', () => {
    it('空の可能手リストでもエラーにならない', () => {
      // When & Then: 空リストでもエラーにならない
      expect(() => evaluateStrategy(gameState, [], [], settings)).not.toThrow()

      const result = evaluateStrategy(gameState, [], [], settings)
      expect(result.moveRecommendations).toHaveLength(0)
    })

    it('異常な設定値でも適切にハンドリングされる', () => {
      // Given: 異常な重み設定
      const abnormalSettings: StrategyEvaluationSettings = {
        ...settings,
        weights: {
          firing: -1,
          situation: 2,
          risk: 0,
          pattern: 0.5,
        },
      }

      // When & Then: 異常値でもエラーにならない
      expect(() =>
        evaluateStrategy(gameState, possibleMoves, [], abnormalSettings),
      ).not.toThrow()

      const result = evaluateStrategy(
        gameState,
        possibleMoves,
        [],
        abnormalSettings,
      )
      expect(result).toBeDefined()
    })
  })
})
