/**
 * ゲームフェーズ管理サービスのテスト
 */
import { describe, expect, it } from 'vitest'

import type { AIGameState } from '../../models/ai/GameState'
import { GamePhase } from '../../models/ai/MayahEvaluation'
import {
  adjustWeightsForSituation,
  determineGamePhase,
  generatePhaseDescription,
  generateWeightDescription,
  getPhaseWeights,
  isEmergencyPhase,
  isFieldUnstable,
  isOpponentThreatening,
} from './PhaseManagementService'

describe('PhaseManagementService', () => {
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
    currentPuyo: {
      primary: { color: 'red', position: { x: 2, y: 0 } },
      secondary: { color: 'blue', position: { x: 2, y: 1 } },
    },
    nextPuyos: [],
    score: 0,
    chainCount: 0,
  })

  const setCell = (
    gameState: AIGameState,
    x: number,
    y: number,
    color: string,
  ) => {
    gameState.currentField!.cells[y][x] = color as any
  }

  describe('determineGamePhase', () => {
    it('序盤フェーズを正しく判定', () => {
      // Arrange
      const gameState = createTestGameState()

      // Act
      const phase = determineGamePhase(gameState, 15)

      // Assert
      expect(phase).toBe(GamePhase.EARLY)
    })

    it('中盤フェーズを正しく判定', () => {
      // Arrange
      const gameState = createTestGameState()

      // Act
      const phase = determineGamePhase(gameState, 45)

      // Assert
      expect(phase).toBe(GamePhase.MIDDLE)
    })

    it('終盤フェーズを正しく判定', () => {
      // Arrange
      const gameState = createTestGameState()

      // Act
      const phase = determineGamePhase(gameState, 80)

      // Assert
      expect(phase).toBe(GamePhase.LATE)
    })

    it('緊急フェーズを手数に関係なく判定', () => {
      // Arrange
      const gameState = createTestGameState()
      // フィールドを高く積む（緊急状態）
      for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 11; y++) {
          setCell(gameState, x, y, 'red')
        }
      }

      // Act
      const phase = determineGamePhase(gameState, 15) // 序盤手数だが緊急

      // Assert
      expect(phase).toBe(GamePhase.EMERGENCY)
    })
  })

  describe('isEmergencyPhase', () => {
    it('安全なフィールドでfalseを返す', () => {
      // Arrange
      const gameState = createTestGameState()
      setCell(gameState, 2, 10, 'red')
      setCell(gameState, 3, 11, 'blue')

      // Act
      const isEmergency = isEmergencyPhase(gameState)

      // Assert
      expect(isEmergency).toBe(false)
    })

    it('危険な高さのフィールドでtrueを返す', () => {
      // Arrange
      const gameState = createTestGameState()
      // 複数列を危険な高さまで積む
      for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 11; y++) {
          setCell(gameState, x, y, 'red')
        }
      }

      // Act
      const isEmergency = isEmergencyPhase(gameState)

      // Assert
      expect(isEmergency).toBe(true)
    })

    it('一部の列のみ高い場合はfalseを返す', () => {
      // Arrange
      const gameState = createTestGameState()
      // 1列のみ高く積む
      for (let y = 0; y < 11; y++) {
        setCell(gameState, 0, y, 'red')
      }

      // Act
      const isEmergency = isEmergencyPhase(gameState)

      // Assert
      expect(isEmergency).toBe(false)
    })
  })

  describe('getPhaseWeights', () => {
    it('序盤の重みを正しく取得', () => {
      // Arrange & Act
      const weights = getPhaseWeights(GamePhase.EARLY)

      // Assert
      expect(weights.shapeWeight).toBeGreaterThan(weights.operationWeight)
      expect(weights.chainWeight).toBeGreaterThan(weights.strategyWeight)
      expect(weights.riskTolerance).toBeGreaterThan(0.5)
    })

    it('終盤の重みを正しく取得', () => {
      // Arrange & Act
      const weights = getPhaseWeights(GamePhase.LATE)

      // Assert
      expect(weights.strategyWeight).toBeGreaterThan(weights.shapeWeight)
      expect(weights.operationWeight).toBeGreaterThan(0.2)
      expect(weights.riskTolerance).toBeLessThan(0.5)
    })

    it('緊急時の重みを正しく取得', () => {
      // Arrange & Act
      const weights = getPhaseWeights(GamePhase.EMERGENCY)

      // Assert
      expect(weights.operationWeight).toBeGreaterThan(0.3)
      expect(weights.riskTolerance).toBeLessThan(0.2)
    })

    it('カスタム重みを適用', () => {
      // Arrange
      const customWeights = {
        [GamePhase.EARLY]: {
          operationWeight: 0.5,
        },
      }

      // Act
      const weights = getPhaseWeights(GamePhase.EARLY, customWeights)

      // Assert
      expect(weights.operationWeight).toBe(0.5)
    })
  })

  describe('isOpponentThreatening', () => {
    it('相手情報がない場合はfalseを返す', () => {
      // Arrange
      const gameState = createTestGameState()

      // Act
      const isThreatening = isOpponentThreatening(gameState)

      // Assert
      expect(isThreatening).toBe(false)
    })

    it('相手の方が高く積んでいる場合はtrueを返す', () => {
      // Arrange
      const gameState = createTestGameState()
      gameState.opponentField = {
        width: 6,
        height: 12,
        cells: Array(12)
          .fill(null)
          .map(() => Array(6).fill(null)),
      }

      // 自分のフィールドは低く
      setCell(gameState, 2, 11, 'red')

      // 相手のフィールドは高く
      for (let y = 6; y < 12; y++) {
        gameState.opponentField.cells[y][2] = 'blue' as any
      }

      // Act
      const isThreatening = isOpponentThreatening(gameState)

      // Assert
      expect(isThreatening).toBe(true)
    })
  })

  describe('isFieldUnstable', () => {
    it('安定したフィールドでfalseを返す', () => {
      // Arrange
      const gameState = createTestGameState()
      // 均等に積む
      for (let x = 0; x < 6; x++) {
        for (let y = 9; y < 12; y++) {
          setCell(gameState, x, y, 'red')
        }
      }

      // Act
      const isUnstable = isFieldUnstable(gameState)

      // Assert
      expect(isUnstable).toBe(false)
    })

    it('高低差の大きいフィールドでtrueを返す', () => {
      // Arrange
      const gameState = createTestGameState()
      // 極端な高低差を作る
      for (let y = 0; y < 12; y++) {
        setCell(gameState, 0, y, 'red') // 1列目は最大高
      }
      setCell(gameState, 1, 11, 'blue') // 2列目は最小高
      for (let y = 0; y < 11; y++) {
        setCell(gameState, 2, y, 'green') // 3列目は高い
      }

      // Act
      const isUnstable = isFieldUnstable(gameState)

      // Assert
      expect(isUnstable).toBe(true)
    })
  })

  describe('adjustWeightsForSituation', () => {
    it('通常状況では重みを変更しない', () => {
      // Arrange
      const gameState = createTestGameState()
      const baseWeights = getPhaseWeights(GamePhase.MIDDLE)

      // Act
      const adjustedWeights = adjustWeightsForSituation(baseWeights, gameState)

      // Assert
      expect(adjustedWeights).toEqual(baseWeights)
    })

    it('相手の脅威に対して重みを調整', () => {
      // Arrange
      const gameState = createTestGameState()
      gameState.opponentField = {
        width: 6,
        height: 12,
        cells: Array(12)
          .fill(null)
          .map(() => Array(6).fill(null)),
      }

      // 相手を脅威的にする
      for (let y = 4; y < 12; y++) {
        gameState.opponentField.cells[y][2] = 'blue' as any
      }

      const baseWeights = getPhaseWeights(GamePhase.MIDDLE)

      // Act
      const adjustedWeights = adjustWeightsForSituation(baseWeights, gameState)

      // Assert
      expect(adjustedWeights.operationWeight).toBeGreaterThan(
        baseWeights.operationWeight,
      )
      expect(adjustedWeights.strategyWeight).toBeGreaterThan(
        baseWeights.strategyWeight,
      )
    })

    it('不安定なフィールドに対して重みを調整', () => {
      // Arrange
      const gameState = createTestGameState()
      // より不安定な形状を作る（複数の列で高低差を作る）
      for (let y = 0; y < 12; y++) {
        setCell(gameState, 0, y, 'red') // 1列目：高さ12
      }
      setCell(gameState, 1, 11, 'blue') // 2列目：高さ1
      for (let y = 0; y < 11; y++) {
        setCell(gameState, 2, y, 'green') // 3列目：高さ11
      }
      setCell(gameState, 3, 11, 'yellow') // 4列目：高さ1
      for (let y = 0; y < 10; y++) {
        setCell(gameState, 4, y, 'purple') // 5列目：高さ10
      }

      const baseWeights = getPhaseWeights(GamePhase.MIDDLE)

      // Act
      const adjustedWeights = adjustWeightsForSituation(baseWeights, gameState)

      // Assert
      expect(adjustedWeights.shapeWeight).toBeGreaterThan(
        baseWeights.shapeWeight,
      )
      expect(adjustedWeights.riskTolerance).toBeLessThan(
        baseWeights.riskTolerance,
      )
    })
  })

  describe('generatePhaseDescription', () => {
    it('序盤の説明を生成', () => {
      // Arrange & Act
      const description = generatePhaseDescription(GamePhase.EARLY, 15)

      // Assert
      expect(description).toBe('序盤（15手目）- 土台構築重視')
    })

    it('中盤の説明を生成', () => {
      // Arrange & Act
      const description = generatePhaseDescription(GamePhase.MIDDLE, 45)

      // Assert
      expect(description).toBe('中盤（45手目）- バランス重視')
    })

    it('終盤の説明を生成', () => {
      // Arrange & Act
      const description = generatePhaseDescription(GamePhase.LATE, 80)

      // Assert
      expect(description).toBe('終盤（80手目）- 戦略・操作重視')
    })

    it('緊急時の説明を生成', () => {
      // Arrange & Act
      const description = generatePhaseDescription(GamePhase.EMERGENCY, 25)

      // Assert
      expect(description).toBe('緊急（25手目）- 速攻・防御優先')
    })
  })

  describe('generateWeightDescription', () => {
    it('操作重視の説明を生成', () => {
      // Arrange
      const weights = {
        operationWeight: 0.4,
        shapeWeight: 0.2,
        chainWeight: 0.2,
        strategyWeight: 0.2,
        riskTolerance: 0.1,
      }

      // Act
      const description = generateWeightDescription(weights)

      // Assert
      expect(description).toContain('操作重視')
      expect(description).toContain('低リスク')
    })

    it('バランス型の説明を生成', () => {
      // Arrange
      const weights = {
        operationWeight: 0.25,
        shapeWeight: 0.25,
        chainWeight: 0.25,
        strategyWeight: 0.25,
        riskTolerance: 0.5,
      }

      // Act
      const description = generateWeightDescription(weights)

      // Assert
      expect(description).toContain('中リスク')
    })

    it('高リスク戦略の説明を生成', () => {
      // Arrange
      const weights = {
        operationWeight: 0.1,
        shapeWeight: 0.4,
        chainWeight: 0.4,
        strategyWeight: 0.1,
        riskTolerance: 0.8,
      }

      // Act
      const description = generateWeightDescription(weights)

      // Assert
      expect(description).toContain('形状重視')
      expect(description).toContain('連鎖重視')
      expect(description).toContain('高リスク')
    })
  })

  describe('統合テスト', () => {
    it('フェーズ判定から重み調整まで一連の流れをテスト', () => {
      // Arrange
      const gameState = createTestGameState()
      const moveCount = 45

      // 中程度の危険状態を作る
      for (let x = 0; x < 3; x++) {
        for (let y = 3; y < 12; y++) {
          setCell(gameState, x, y, 'red')
        }
      }

      // Act
      const phase = determineGamePhase(gameState, moveCount)
      const baseWeights = getPhaseWeights(phase)
      const adjustedWeights = adjustWeightsForSituation(baseWeights, gameState)
      const phaseDesc = generatePhaseDescription(phase, moveCount)
      const weightDesc = generateWeightDescription(adjustedWeights)

      // Assert
      expect(phase).toBe(GamePhase.MIDDLE)
      expect(phaseDesc).toContain('中盤')
      expect(weightDesc).toBeTruthy()
      expect(adjustedWeights.shapeWeight).toBeGreaterThanOrEqual(
        baseWeights.shapeWeight,
      )
    })
  })
})
