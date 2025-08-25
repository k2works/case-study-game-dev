/**
 * ShapeEvaluationService テスト
 */
import { describe, expect, it } from 'vitest'

import type { AIGameState } from '../../models/ai'
import { GamePhase } from './IntegratedEvaluationService'
import { evaluateShape } from './ShapeEvaluationService'

describe('ShapeEvaluationService', () => {
  // ベースフィールドを作成
  const createBaseField = () => ({
    width: 6,
    height: 13,
    cells: Array(13)
      .fill(null)
      .map(() => Array(6).fill(null)),
  })

  // U字型パターンを配置
  const setupUShapePattern = (field: { cells: (string | null)[][] }) => {
    for (let y = 10; y < 13; y++) {
      field.cells[y][0] = 'red'
      field.cells[y][5] = 'blue'
    }
    for (let y = 11; y < 13; y++) {
      field.cells[y][1] = 'green'
      field.cells[y][4] = 'yellow'
    }
    field.cells[12][2] = 'red'
    field.cells[12][3] = 'blue'
  }

  // 谷型パターンを配置
  const setupValleyPattern = (field: { cells: (string | null)[][] }) => {
    for (let y = 8; y < 13; y++) {
      field.cells[y][0] = 'red'
      field.cells[y][1] = 'blue'
      field.cells[y][4] = 'green'
      field.cells[y][5] = 'yellow'
    }
    field.cells[12][2] = 'red'
    field.cells[12][3] = 'blue'
  }

  // 山型パターンを配置
  const setupMountainPattern = (field: { cells: (string | null)[][] }) => {
    for (let y = 11; y < 13; y++) {
      field.cells[y][0] = 'red'
      field.cells[y][1] = 'blue'
      field.cells[y][4] = 'green'
      field.cells[y][5] = 'yellow'
    }
    for (let y = 8; y < 13; y++) {
      field.cells[y][2] = 'red'
      field.cells[y][3] = 'blue'
    }
  }

  // バランス型パターンを配置
  const setupBalancedPattern = (field: { cells: (string | null)[][] }) => {
    for (let y = 11; y < 13; y++) {
      for (let x = 0; x < 6; x++) {
        field.cells[y][x] = x % 2 === 0 ? 'red' : 'blue'
      }
    }
  }

  // テスト用のゲーム状態を作成
  const createMockGameState = (
    pattern: 'empty' | 'u-shape' | 'valley' | 'mountain' | 'balanced',
  ): AIGameState => {
    const field = createBaseField()

    switch (pattern) {
      case 'u-shape':
        setupUShapePattern(field)
        break
      case 'valley':
        setupValleyPattern(field)
        break
      case 'mountain':
        setupMountainPattern(field)
        break
      case 'balanced':
        setupBalancedPattern(field)
        break
      case 'empty':
      default:
        break
    }

    return {
      field,
      currentPuyoPair: {
        primaryColor: 'red',
        secondaryColor: 'blue',
        x: 2,
        y: 0,
        rotation: 0,
      },
      nextPuyoPair: null,
      score: 0,
      chainCount: 0,
      turn: 1,
      isGameOver: false,
    }
  }

  describe('evaluateShape', () => {
    it('空のフィールドを評価できる', () => {
      // Arrange
      const gameState = createMockGameState('empty')

      // Act
      const result = evaluateShape(gameState, GamePhase.EARLY)

      // Assert
      expect(result).toBeDefined()
      expect(result.totalScore).toBeGreaterThanOrEqual(0)
      expect(result.reason).toContain('形評価')
    })

    it('U字型配置を高く評価する', () => {
      // Arrange
      const uShapeState = createMockGameState('u-shape')
      const mountainState = createMockGameState('mountain')

      // Act
      const uShapeResult = evaluateShape(uShapeState, GamePhase.EARLY)
      const mountainResult = evaluateShape(mountainState, GamePhase.EARLY)

      // Assert
      // U字型の方が山型より高評価
      expect(uShapeResult.uShapeScore).toBeGreaterThan(
        mountainResult.uShapeScore,
      )
    })

    it('深い谷にペナルティを与える', () => {
      // Arrange
      const valleyState = createMockGameState('valley')

      // Act
      const result = evaluateShape(valleyState, GamePhase.MIDDLE)

      // Assert
      expect(result.valleyPenalty).toBeGreaterThan(0)
      expect(result.reason).toContain('谷あり')
    })

    it('高い山にペナルティを与える', () => {
      // Arrange
      const mountainState = createMockGameState('mountain')

      // Act
      const result = evaluateShape(mountainState, GamePhase.MIDDLE)

      // Assert
      expect(result.mountainPenalty).toBeGreaterThan(0)
      expect(result.reason).toContain('山あり')
    })

    it('バランスの良い配置を評価する', () => {
      // Arrange
      const balancedState = createMockGameState('balanced')
      const mountainState = createMockGameState('mountain')

      // Act
      const balancedResult = evaluateShape(balancedState, GamePhase.MIDDLE)
      const mountainResult = evaluateShape(mountainState, GamePhase.MIDDLE)

      // Assert
      // バランス型の方が高さバランススコアが高い
      expect(balancedResult.heightBalanceScore).toBeGreaterThan(
        mountainResult.heightBalanceScore,
      )
    })

    it('連結を正しく評価する', () => {
      // Arrange
      const gameState = createMockGameState('empty')
      // 4個連結のグループを作成
      gameState.field.cells[12][0] = 'red'
      gameState.field.cells[12][1] = 'red'
      gameState.field.cells[11][0] = 'red'
      gameState.field.cells[11][1] = 'red'

      // Act
      const result = evaluateShape(gameState, GamePhase.MIDDLE)

      // Assert
      expect(result.connectionScore).toBeGreaterThan(0)
      expect(result.reason).toContain('連結')
    })

    it('ゲームフェーズによって評価が変わる', () => {
      // Arrange
      const gameState = createMockGameState('u-shape')

      // Act
      const earlyResult = evaluateShape(gameState, GamePhase.EARLY)
      const lateResult = evaluateShape(gameState, GamePhase.LATE)

      // Assert
      // 序盤の方がU字型を重視
      expect(earlyResult.uShapeScore).toBeGreaterThan(lateResult.uShapeScore)
    })

    it('総合スコアが負にならない', () => {
      // Arrange
      const gameState = createMockGameState('valley')

      // Act
      const result = evaluateShape(gameState, GamePhase.MIDDLE)

      // Assert
      // ペナルティが大きくても総合スコアは0以上
      expect(result.totalScore).toBeGreaterThanOrEqual(0)
    })

    it('複数の評価要素を統合する', () => {
      // Arrange
      const gameState = createMockGameState('u-shape')

      // Act
      const result = evaluateShape(gameState, GamePhase.MIDDLE)

      // Assert
      expect(result.uShapeScore).toBeDefined()
      expect(result.connectionScore).toBeDefined()
      expect(result.valleyPenalty).toBeDefined()
      expect(result.mountainPenalty).toBeDefined()
      expect(result.heightBalanceScore).toBeDefined()
      expect(result.totalScore).toBe(
        Math.max(
          0,
          result.uShapeScore +
            result.connectionScore +
            result.heightBalanceScore -
            result.valleyPenalty -
            result.mountainPenalty,
        ),
      )
    })
  })
})
