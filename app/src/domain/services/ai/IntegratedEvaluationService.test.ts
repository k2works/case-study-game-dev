/**
 * 統合評価サービスのテスト
 */
import { describe, expect, it } from 'vitest'

import type { AIGameState } from '../../models/ai/GameState'
import { GamePhase } from '../../models/ai/MayahEvaluation'
import type { PossibleMove } from '../../models/ai/MoveTypes'
import {
  DEFAULT_INTEGRATED_SETTINGS,
  adjustEvaluationBalance,
  compareEvaluationSystems,
  evaluateAndSortIntegratedMoves,
  evaluateIntegratedMove,
  getBestIntegratedMove,
  updateIntegratedSettings,
} from './IntegratedEvaluationService'

describe('IntegratedEvaluationService', () => {
  const createTestGameState = (
    width: number = 6,
    height: number = 12,
  ): AIGameState => ({
    field: {
      width,
      height,
      cells: Array(height)
        .fill(null)
        .map(() => Array(width).fill(null)),
    },
    currentField: {
      width,
      height,
      cells: Array(height)
        .fill(null)
        .map(() => Array(width).fill(null)),
    },
    currentPuyoPair: null,
    nextPuyoPair: null,
    score: 0,
  })

  const createTestMove = (
    x: number = 2,
    rotation: number = 0,
  ): PossibleMove => ({
    x,
    rotation,
    primaryPosition: { x, y: 11 },
    secondaryPosition: { x, y: 10 },
    isValid: true,
  })

  const setCell = (
    gameState: AIGameState,
    x: number,
    y: number,
    color: string,
  ) => {
    gameState.field.cells[y][x] = color as never
    if (gameState.currentField) {
      gameState.currentField.cells[y][x] = color as never
    }
  }

  describe('evaluateIntegratedMove', () => {
    it('基本的な統合評価を正しく実行', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove()
      const moveCount = 15

      // Act
      const evaluation = evaluateIntegratedMove(move, gameState, moveCount)

      // Assert
      expect(evaluation.mayahEvaluation).toBeDefined()
      expect(evaluation.mayahEvaluation.operation).toBeDefined()
      expect(evaluation.mayahEvaluation.shape).toBeDefined()
      expect(evaluation.mayahEvaluation.totalScore).toBeGreaterThanOrEqual(0)
      expect(evaluation.legacyEvaluation).toBeDefined()
      expect(evaluation.totalScore).toBeGreaterThanOrEqual(0)
      expect(evaluation.phaseInfo.phase).toBe(GamePhase.EARLY)
      expect(evaluation.phaseInfo.description).toContain('序盤')
      expect(evaluation.reason).toBeTruthy()
    })

    it('中盤フェーズで適切な重み調整', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove()
      const moveCount = 45

      // Act
      const evaluation = evaluateIntegratedMove(move, gameState, moveCount)

      // Assert
      expect(evaluation.phaseInfo.phase).toBe(GamePhase.MIDDLE)
      expect(evaluation.phaseInfo.weights.strategyWeight).toBeGreaterThan(0.2)
      expect(evaluation.phaseInfo.description).toContain('中盤')
    })

    it('緊急フェーズで適切な評価調整', () => {
      // Arrange
      const gameState = createTestGameState()
      // 危険な状態を作成
      for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 11; y++) {
          setCell(gameState, x, y, 'red')
        }
      }
      const move = createTestMove()
      const moveCount = 20

      // Act
      const evaluation = evaluateIntegratedMove(move, gameState, moveCount)

      // Assert
      expect(evaluation.phaseInfo.phase).toBe(GamePhase.EMERGENCY)
      expect(evaluation.phaseInfo.weights.operationWeight).toBeGreaterThan(0.3)
      expect(evaluation.phaseInfo.description).toContain('緊急')
    })

    it('カスタム設定での評価', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove()
      const customSettings = {
        ...DEFAULT_INTEGRATED_SETTINGS,
        mayahWeight: 0.9,
        legacyWeight: 0.1,
        enablePhaseManagement: false,
      }

      // Act
      const evaluation = evaluateIntegratedMove(
        move,
        gameState,
        15,
        customSettings,
      )

      // Assert
      expect(evaluation.reason).toContain('mayah90%')
      expect(evaluation.reason).toContain('既存10%')
    })
  })

  describe('evaluateAndSortIntegratedMoves', () => {
    it('複数の手を正しくソート', () => {
      // Arrange
      const gameState = createTestGameState()
      const moves = [
        createTestMove(0), // 左端
        createTestMove(2), // 中央
        createTestMove(5), // 右端
      ]

      // Act
      const evaluatedMoves = evaluateAndSortIntegratedMoves(moves, gameState)

      // Assert
      expect(evaluatedMoves).toHaveLength(3)
      expect(evaluatedMoves[0].evaluation.totalScore).toBeGreaterThanOrEqual(
        evaluatedMoves[1].evaluation.totalScore,
      )
      expect(evaluatedMoves[1].evaluation.totalScore).toBeGreaterThanOrEqual(
        evaluatedMoves[2].evaluation.totalScore,
      )
    })

    it('無効な手を含む場合の処理', () => {
      // Arrange
      const gameState = createTestGameState()
      const moves = [
        createTestMove(2),
        { ...createTestMove(3), isValid: false },
      ]

      // Act
      const evaluatedMoves = evaluateAndSortIntegratedMoves(moves, gameState)

      // Assert
      expect(evaluatedMoves).toHaveLength(2)
      expect(evaluatedMoves[0].evaluation.totalScore).toBeGreaterThan(
        evaluatedMoves[1].evaluation.totalScore,
      )
    })
  })

  describe('getBestIntegratedMove', () => {
    it('最適な手を正しく選択', () => {
      // Arrange
      const gameState = createTestGameState()
      const moves = [createTestMove(0), createTestMove(2), createTestMove(5)]

      // Act
      const bestMove = getBestIntegratedMove(moves, gameState)

      // Assert
      expect(bestMove).not.toBeNull()
      expect(bestMove?.evaluation.totalScore).toBeDefined()
    })

    it('空の手リストでnullを返す', () => {
      // Arrange
      const gameState = createTestGameState()

      // Act
      const bestMove = getBestIntegratedMove([], gameState)

      // Assert
      expect(bestMove).toBeNull()
    })
  })

  describe('compareEvaluationSystems', () => {
    it('評価システム間の比較分析を実行', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove()

      // Act
      const comparison = compareEvaluationSystems(move, gameState)

      // Assert
      expect(comparison.mayahScore).toBeGreaterThanOrEqual(0)
      expect(comparison.legacyScore).toBeDefined()
      expect(comparison.scoreDifference).toBe(
        comparison.mayahScore - comparison.legacyScore,
      )
      expect(comparison.scoreDifferencePercentage).toBeDefined()
      expect(comparison.mayahAdvantage).toBeGreaterThanOrEqual(-1)
      expect(comparison.mayahAdvantage).toBeLessThanOrEqual(1)
      expect(comparison.agreementLevel).toBeGreaterThanOrEqual(0)
      expect(comparison.agreementLevel).toBeLessThanOrEqual(1)
      expect(comparison.comparisonDescription).toBeTruthy()
    })

    it('mayah型が優位な場合の比較', () => {
      // Arrange
      const gameState = createTestGameState()
      // U字型を作成してmayah型を有利にする
      setCell(gameState, 0, 11, 'red')
      setCell(gameState, 1, 11, 'blue')
      setCell(gameState, 4, 11, 'green')
      setCell(gameState, 5, 11, 'yellow')

      const move = createTestMove(2) // 中央に配置

      // Act
      const comparison = compareEvaluationSystems(move, gameState)

      // Assert
      expect(comparison.comparisonDescription).toBeTruthy()
      // mayah型は形状評価でボーナスを得ると期待
    })

    it('評価システムが拮抗する場合の比較', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove(2) // 中央配置で両システムとも標準的なスコア

      // Act
      const comparison = compareEvaluationSystems(move, gameState)

      // Assert
      expect(Math.abs(comparison.mayahAdvantage)).toBeLessThan(0.5)
      expect(comparison.comparisonDescription).toContain('拮抗')
    })
  })

  describe('設定管理', () => {
    it('updateIntegratedSettings が正しく動作', () => {
      // Arrange
      const updates = {
        mayahWeight: 0.8,
        legacyWeight: 0.2,
        enablePhaseManagement: false,
      }

      // Act
      const newSettings = updateIntegratedSettings(
        DEFAULT_INTEGRATED_SETTINGS,
        updates,
      )

      // Assert
      expect(newSettings.mayahWeight).toBe(0.8)
      expect(newSettings.legacyWeight).toBe(0.2)
      expect(newSettings.enablePhaseManagement).toBe(false)
      expect(newSettings.mayahSettings).toBe(
        DEFAULT_INTEGRATED_SETTINGS.mayahSettings,
      )
    })

    it('adjustEvaluationBalance が重みを正しく調整', () => {
      // Arrange
      const settings = DEFAULT_INTEGRATED_SETTINGS

      // Act
      const adjusted1 = adjustEvaluationBalance(settings, 0.8)
      const adjusted2 = adjustEvaluationBalance(settings, 1.2) // 上限テスト
      const adjusted3 = adjustEvaluationBalance(settings, -0.1) // 下限テスト

      // Assert
      expect(adjusted1.mayahWeight).toBe(0.8)
      expect(adjusted1.legacyWeight).toBeCloseTo(0.2, 10)
      expect(adjusted2.mayahWeight).toBe(1.0)
      expect(adjusted2.legacyWeight).toBe(0.0)
      expect(adjusted3.mayahWeight).toBe(0.0)
      expect(adjusted3.legacyWeight).toBe(1.0)
    })
  })

  describe('統合テスト', () => {
    it('フェーズ変化による評価の変化を確認', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove()

      // Act
      const earlyEval = evaluateIntegratedMove(move, gameState, 15) // 序盤
      const middleEval = evaluateIntegratedMove(move, gameState, 45) // 中盤
      const lateEval = evaluateIntegratedMove(move, gameState, 80) // 終盤

      // Assert
      expect(earlyEval.phaseInfo.phase).toBe(GamePhase.EARLY)
      expect(middleEval.phaseInfo.phase).toBe(GamePhase.MIDDLE)
      expect(lateEval.phaseInfo.phase).toBe(GamePhase.LATE)

      // フェーズによって重み配分が変わることを確認
      expect(earlyEval.phaseInfo.weights.shapeWeight).toBeGreaterThan(
        lateEval.phaseInfo.weights.shapeWeight,
      )
      expect(lateEval.phaseInfo.weights.strategyWeight).toBeGreaterThan(
        earlyEval.phaseInfo.weights.strategyWeight,
      )
    })

    it('設定変更による評価システムの重み調整を確認', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove()

      const mayahHeavySettings = adjustEvaluationBalance(
        DEFAULT_INTEGRATED_SETTINGS,
        0.9,
      )
      const legacyHeavySettings = adjustEvaluationBalance(
        DEFAULT_INTEGRATED_SETTINGS,
        0.1,
      )

      // Act
      const mayahHeavyEval = evaluateIntegratedMove(
        move,
        gameState,
        15,
        mayahHeavySettings,
      )
      const legacyHeavyEval = evaluateIntegratedMove(
        move,
        gameState,
        15,
        legacyHeavySettings,
      )

      // Assert
      expect(mayahHeavyEval.reason).toContain('mayah90%')
      expect(legacyHeavyEval.reason).toContain('mayah10%')

      // 重みの違いによってスコアが変わることを確認
      expect(mayahHeavyEval.totalScore).not.toBe(legacyHeavyEval.totalScore)
    })
  })
})
