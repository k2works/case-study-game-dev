/**
 * 戦略評価サービスのテスト
 */
import { describe, expect, it } from 'vitest'

import type { AIFieldState, AIGameState } from '../../models/ai/GameState'
import type {
  ChainEvaluation,
  RensaHandTree,
} from '../../models/ai/MayahEvaluation'
import { GamePhase } from '../../models/ai/MayahEvaluation'
import {
  assessRisk,
  evaluateFireTiming,
  evaluateGaze,
  evaluateStrategy,
} from './StrategyEvaluationService'

describe('StrategyEvaluationService', () => {
  const createTestField = (width: number, height: number): AIFieldState => ({
    width,
    height,
    cells: Array(height)
      .fill(null)
      .map(() => Array(width).fill(null)),
  })

  const setCell = (
    field: AIFieldState,
    x: number,
    y: number,
    color: string,
  ) => {
    field.cells[y][x] = color as never
  }

  const createTestGameState = (field: AIFieldState): AIGameState => ({
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
  })

  const createBasicChainEvaluation = (
    totalScore: number = 300,
    feasibilityScore: number = 70,
    stabilityScore: number = 70,
  ): ChainEvaluation => ({
    patterns: [],
    bestPattern: undefined,
    chainPotential: totalScore * 0.6,
    diversityScore: 40,
    stabilityScore,
    feasibilityScore,
    totalScore,
  })

  describe('evaluateStrategy', () => {
    it('基本的な戦略評価を実行', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(400, 80, 75)
      const opponentChainEvaluation = createBasicChainEvaluation(300, 60, 60)

      // Act
      const result = evaluateStrategy(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
      )

      // Assert
      expect(result.timingScore).toBeGreaterThanOrEqual(0)
      expect(result.gazeScore).toBeGreaterThanOrEqual(0)
      expect(result.riskScore).toBeGreaterThanOrEqual(0)
      expect(result.defenseScore).toBeGreaterThanOrEqual(0)
      expect(result.totalScore).toBeGreaterThanOrEqual(0)
    })

    it('有利な状況で高いスコアを返す', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(800, 90, 85) // 高スコア
      const opponentChainEvaluation = createBasicChainEvaluation(200, 50, 50) // 低スコア

      // Act
      const result = evaluateStrategy(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
      )

      // Assert
      expect(result.totalScore).toBeGreaterThan(60)
      expect(result.timingScore).toBeGreaterThan(70)
    })

    it('不利な状況で低いスコアを返す', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)

      // 自分のフィールドを高くして危険な状況を作る
      for (let x = 0; x < 6; x++) {
        for (let y = 2; y < 12; y++) {
          setCell(myField, x, y, 'red')
        }
      }

      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(200, 40, 30) // 低スコア
      const opponentChainEvaluation = createBasicChainEvaluation(700, 85, 80) // 高スコア

      // Act
      const result = evaluateStrategy(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
      )

      // Assert
      expect(result.totalScore).toBeLessThan(60)
      expect(result.riskScore).toBeLessThan(60) // 高いリスクなので低いriskScore
    })

    it('RensaHandTreeがある場合の評価', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(500)
      const opponentChainEvaluation = createBasicChainEvaluation(400)

      const rensaHandTree: RensaHandTree = {
        myTree: {
          chainCount: 3,
          score: 500,
          frameCount: 300,
          requiredPuyos: 12,
          probability: 0.8,
          children: [],
        },
        opponentTree: {
          chainCount: 2,
          score: 300,
          frameCount: 240,
          requiredPuyos: 8,
          probability: 0.7,
          children: [],
        },
        optimalTiming: 5,
        battleEvaluation: 200,
      }

      // Act
      const result = evaluateStrategy(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
        rensaHandTree,
      )

      // Assert
      expect(result.timingScore).toBeGreaterThan(60)
      expect(result.totalScore).toBeGreaterThan(40)
    })
  })

  describe('evaluateFireTiming', () => {
    it('緊急時の発火判断', () => {
      // Arrange
      const myField = createTestField(6, 12)

      // フィールドを高くして緊急状況を作る
      for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 10; y++) {
          setCell(myField, x, y, 'red')
        }
      }

      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(300)
      const opponentChainEvaluation = createBasicChainEvaluation(200)

      // Act
      const result = evaluateFireTiming(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
      )

      // Assert
      expect(result.shouldFire).toBe(true)
      expect(result.urgency).toBeGreaterThan(0.8)
      expect(result.reason).toContain('緊急')
    })

    it('相手の脅威に対する先制攻撃判断', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(450) // 相手の80%以上
      const opponentChainEvaluation = createBasicChainEvaluation(550) // 高い脅威

      // Act
      const result = evaluateFireTiming(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
      )

      // Assert
      expect(result.shouldFire).toBe(true)
      expect(result.urgency).toBeGreaterThan(0.6)
      expect(result.reason).toContain('先制攻撃')
    })

    it('終盤の高スコア連鎖での発火判断', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(850) // 高スコア
      const opponentChainEvaluation = createBasicChainEvaluation(400)

      // Act
      const result = evaluateFireTiming(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
        undefined,
        GamePhase.LATE,
      )

      // Assert
      expect(result.shouldFire).toBe(true)
      expect(result.urgency).toBeGreaterThan(0.5)
      expect(result.reason).toContain('高スコア連鎖')
    })

    it('連鎖構築継続の判断', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(200) // 低スコア
      const opponentChainEvaluation = createBasicChainEvaluation(250)

      // Act
      const result = evaluateFireTiming(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
        undefined,
        GamePhase.EARLY,
      )

      // Assert
      expect(result.shouldFire).toBe(false)
      expect(result.urgency).toBeLessThan(0.5)
      expect(result.reason).toContain('構築継続')
    })

    it('RensaHandTreeによる発火タイミング補正', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(400)
      const opponentChainEvaluation = createBasicChainEvaluation(350)

      const rensaHandTree: RensaHandTree = {
        myTree: {
          chainCount: 4,
          score: 600,
          frameCount: 360,
          requiredPuyos: 16,
          probability: 0.9,
          children: [],
        },
        opponentTree: {
          chainCount: 2,
          score: 300,
          frameCount: 240,
          requiredPuyos: 8,
          probability: 0.7,
          children: [],
        },
        optimalTiming: 7,
        battleEvaluation: 300, // 有利な評価
      }

      // Act
      const result = evaluateFireTiming(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
        rensaHandTree,
      )

      // Assert
      expect(result.recommendedTiming).toBe(7) // RensaHandTreeのoptimalTimingが反映
      expect(result.timingScore).toBeGreaterThan(60) // battleEvaluationによるボーナス
    })
  })

  describe('evaluateGaze', () => {
    it('危険な相手フィールドの凝視評価', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)

      // 相手の特定列を高くして危険な状況を作る
      for (let y = 2; y < 12; y++) {
        setCell(opponentField, 2, y, 'red')
        setCell(opponentField, 3, y, 'blue')
      }

      const opponentChainEvaluation = createBasicChainEvaluation(500)

      // Act
      const result = evaluateGaze(
        myField,
        opponentField,
        opponentChainEvaluation,
      )

      // Assert
      expect(result.gazeScore).toBeGreaterThan(30)
      expect(result.targetColumns.length).toBeGreaterThan(0)
      expect(result.targetColumns).toContain(2)
      expect(result.targetColumns).toContain(3)
      expect(result.opponentConstraint).toBeGreaterThan(0.3)
    })

    it('安全な相手フィールドの凝視評価', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)

      // 相手フィールドに少しだけぷよを置く（安全な状況）
      setCell(opponentField, 2, 11, 'red')
      setCell(opponentField, 3, 11, 'blue')

      const opponentChainEvaluation = createBasicChainEvaluation(200)

      // Act
      const result = evaluateGaze(
        myField,
        opponentField,
        opponentChainEvaluation,
      )

      // Assert
      expect(result.gazeScore).toBeLessThan(50)
      expect(result.targetColumns.length).toBeLessThanOrEqual(2)
      expect(result.opponentConstraint).toBeLessThan(0.5)
    })

    it('空フィールドの凝視評価', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const opponentChainEvaluation = createBasicChainEvaluation(0)

      // Act
      const result = evaluateGaze(
        myField,
        opponentField,
        opponentChainEvaluation,
      )

      // Assert
      expect(result.gazeScore).toBe(0)
      expect(result.targetColumns).toHaveLength(0)
      expect(result.opponentConstraint).toBe(0)
    })

    it('連鎖パターンがある相手フィールドの凝視評価', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)

      // 相手に中程度の高さでぷよを配置
      for (let y = 6; y < 12; y++) {
        setCell(opponentField, 1, y, 'red')
        setCell(opponentField, 2, y, 'blue')
      }

      const opponentChainEvaluation: ChainEvaluation = {
        patterns: [
          {
            type: 'gtr',
            name: 'GTR連鎖',
            description: 'テスト用GTRパターン',
            position: { startX: 1, endX: 3, columns: 3 },
            completeness: 0.8,
            triggerability: 0.7,
            extensibility: 0.6,
            potential: 70,
            efficiency: 0.8,
            difficulty: 0.6,
            stability: 0.7,
            requiredColors: ['red', 'blue'],
          },
        ],
        bestPattern: undefined,
        chainPotential: 350,
        diversityScore: 40,
        stabilityScore: 70,
        feasibilityScore: 75,
        totalScore: 500,
      }

      // Act
      const result = evaluateGaze(
        myField,
        opponentField,
        opponentChainEvaluation,
      )

      // Assert
      expect(result.gazeScore).toBeGreaterThan(30)
      expect(result.targetColumns).toContain(1)
      // 列2は隣接列として除外される可能性があるため、1または3のいずれかを含むことをテスト
      expect(result.targetColumns.length).toBeGreaterThan(0)
      expect(result.effectiveDuration).toBeGreaterThan(100)
    })
  })

  describe('assessRisk', () => {
    it('高リスク状況の評価', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)

      // 自分のフィールドを危険な高さに
      for (let x = 0; x < 6; x++) {
        for (let y = 1; y < 11; y++) {
          setCell(myField, x, y, 'red')
        }
      }

      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(200, 40, 30) // 低品質
      const opponentChainEvaluation = createBasicChainEvaluation(800, 90, 85) // 高品質

      // Act
      const result = assessRisk(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
        GamePhase.LATE,
      )

      // Assert
      expect(result.totalRisk).toBeGreaterThan(50)
      expect(result.opponentAttackRisk).toBeGreaterThan(40)
      expect(result.defenseCapability).toBeLessThan(50)
      expect(result.misfireRisk).toBeGreaterThan(30)
      expect(result.recommendedDefense.length).toBeGreaterThan(0)
    })

    it('低リスク状況の評価', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)

      // 自分のフィールドは安全
      setCell(myField, 2, 11, 'red')
      setCell(myField, 3, 11, 'blue')

      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(600, 85, 80) // 高品質
      const opponentChainEvaluation = createBasicChainEvaluation(300, 60, 65) // 中品質

      // Act
      const result = assessRisk(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
        GamePhase.EARLY,
      )

      // Assert
      expect(result.totalRisk).toBeLessThan(50)
      expect(result.defenseCapability).toBeGreaterThan(50)
      expect(result.misfireRisk).toBeLessThan(40)
      expect(result.recommendedDefense[0]?.type).toContain('consolidate') // 安定した構築推奨
    })

    it('緊急フェーズでのリスク評価', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(400)
      const opponentChainEvaluation = createBasicChainEvaluation(500)

      // Act
      const result = assessRisk(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
        GamePhase.EMERGENCY,
      )

      // Assert
      expect(result.totalRisk).toBeGreaterThan(40) // 緊急フェーズは高リスク
      expect(result.timeoutRisk).toBeGreaterThan(70) // 時間切れリスク高
      expect(result.opponentAttackRisk).toBeGreaterThan(25) // 攻撃リスク高
    })

    it('防御推奨行動の妥当性', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(500) // 反撃可能
      const opponentChainEvaluation = createBasicChainEvaluation(700) // 脅威

      // Act
      const result = assessRisk(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
        GamePhase.MIDDLE,
      )

      // Assert
      expect(result.recommendedDefense.length).toBeGreaterThan(0)
      expect(result.recommendedDefense.length).toBeLessThanOrEqual(3)

      // 推奨行動が優先度順にソートされている
      for (let i = 0; i < result.recommendedDefense.length - 1; i++) {
        expect(result.recommendedDefense[i].priority).toBeGreaterThanOrEqual(
          result.recommendedDefense[i + 1].priority,
        )
      }

      // 各推奨行動に必要な情報が含まれている
      for (const action of result.recommendedDefense) {
        expect(action.type).toBeDefined()
        expect(action.priority).toBeGreaterThan(0)
        expect(action.priority).toBeLessThanOrEqual(1)
        expect(action.estimatedFrames).toBeGreaterThan(0)
        expect(action.description).toBeDefined()
        expect(action.description.length).toBeGreaterThan(0)
      }
    })

    it('相手が高威力連鎖を持つ場合の妨害推奨', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(300)
      const opponentChainEvaluation = createBasicChainEvaluation(650) // 高威力

      // Act
      const result = assessRisk(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
        GamePhase.MIDDLE,
      )

      // Assert
      const obstructAction = result.recommendedDefense.find(
        (action) => action.type === 'obstruct',
      )
      expect(obstructAction).toBeDefined()
      expect(obstructAction?.priority).toBeGreaterThan(0.5)
    })
  })

  describe('フェーズ別戦略評価', () => {
    it('序盤フェーズでの評価特性', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(400)
      const opponentChainEvaluation = createBasicChainEvaluation(350)

      // Act
      const result = evaluateStrategy(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
        undefined,
        GamePhase.EARLY,
      )

      // Assert
      // 序盤は発火を抑制し、構築を重視
      expect(result.timingScore).toBeLessThan(80)
    })

    it('終盤フェーズでの評価特性', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)
      const myChainEvaluation = createBasicChainEvaluation(600) // 高スコア
      const opponentChainEvaluation = createBasicChainEvaluation(400)

      // Act
      const result = evaluateStrategy(
        myGameState,
        opponentGameState,
        myChainEvaluation,
        opponentChainEvaluation,
        undefined,
        GamePhase.LATE,
      )

      // Assert
      // 終盤は発火を促進
      expect(result.timingScore).toBeGreaterThan(60)
    })
  })
})
