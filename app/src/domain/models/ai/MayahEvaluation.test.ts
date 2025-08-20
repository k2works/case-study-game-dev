/**
 * mayah型評価システムの型定義テスト
 */
import { describe, expect, it } from 'vitest'

import {
  type ChainEvaluation,
  DEFAULT_MAYAH_SETTINGS,
  DEFAULT_PHASE_WEIGHTS,
  GamePhase,
  type MayahEvaluation,
  type OperationEvaluation,
  PatternType,
  type RensaHandTree,
  type RensaNode,
  type ShapeEvaluation,
  type StrategyEvaluation,
} from './MayahEvaluation'

describe('MayahEvaluation', () => {
  describe('型定義の検証', () => {
    it('操作評価の型が正しく定義されている', () => {
      // Arrange
      const operationEval: OperationEvaluation = {
        frameCount: 30,
        chigiriCount: 1,
        efficiencyScore: 85,
        totalScore: 100,
      }

      // Assert
      expect(operationEval.frameCount).toBe(30)
      expect(operationEval.chigiriCount).toBe(1)
      expect(operationEval.efficiencyScore).toBe(85)
      expect(operationEval.totalScore).toBe(100)
    })

    it('形評価の型が正しく定義されている', () => {
      // Arrange
      const shapeEval: ShapeEvaluation = {
        uShapeScore: 80,
        connectivityScore: 75,
        valleyScore: 70,
        balanceScore: 85,
        totalScore: 310,
      }

      // Assert
      expect(shapeEval.uShapeScore).toBe(80)
      expect(shapeEval.connectivityScore).toBe(75)
      expect(shapeEval.valleyScore).toBe(70)
      expect(shapeEval.balanceScore).toBe(85)
      expect(shapeEval.totalScore).toBe(310)
    })

    it('連鎖評価の型が正しく定義されている', () => {
      // Arrange
      const chainEval: ChainEvaluation = {
        patterns: [],
        bestPattern: undefined,
        chainPotential: 80,
        diversityScore: 60,
        stabilityScore: 75,
        feasibilityScore: 70,
        totalScore: 800,
      }

      // Assert
      expect(chainEval.patterns).toEqual([])
      expect(chainEval.bestPattern).toBeUndefined()
      expect(chainEval.chainPotential).toBe(80)
      expect(chainEval.diversityScore).toBe(60)
      expect(chainEval.stabilityScore).toBe(75)
      expect(chainEval.feasibilityScore).toBe(70)
      expect(chainEval.totalScore).toBe(800)
    })

    it('戦略評価の型が正しく定義されている', () => {
      // Arrange
      const strategyEval: StrategyEvaluation = {
        timingScore: 70,
        gazeScore: 60,
        riskScore: 40,
        defenseScore: 30,
        totalScore: 200,
      }

      // Assert
      expect(strategyEval.timingScore).toBe(70)
      expect(strategyEval.gazeScore).toBe(60)
      expect(strategyEval.riskScore).toBe(40)
      expect(strategyEval.defenseScore).toBe(30)
      expect(strategyEval.totalScore).toBe(200)
    })

    it('総合評価の型が正しく定義されている', () => {
      // Arrange
      const mayahEval: MayahEvaluation = {
        operation: {
          frameCount: 30,
          chigiriCount: 1,
          efficiencyScore: 85,
          totalScore: 100,
        },
        shape: {
          uShapeScore: 80,
          connectivityScore: 75,
          valleyScore: 70,
          balanceScore: 85,
          totalScore: 310,
        },
        chain: {
          patterns: [],
          bestPattern: undefined,
          chainPotential: 80,
          diversityScore: 60,
          stabilityScore: 75,
          feasibilityScore: 70,
          totalScore: 800,
        },
        strategy: {
          timingScore: 70,
          gazeScore: 60,
          riskScore: 40,
          defenseScore: 30,
          totalScore: 200,
        },
        phase: GamePhase.MIDDLE,
        weights: DEFAULT_PHASE_WEIGHTS[GamePhase.MIDDLE],
        totalScore: 1410,
        reason: '中盤戦略: 連鎖構築重視',
      }

      // Assert
      expect(mayahEval.operation.totalScore).toBe(100)
      expect(mayahEval.shape.totalScore).toBe(310)
      expect(mayahEval.chain.totalScore).toBe(800)
      expect(mayahEval.strategy.totalScore).toBe(200)
      expect(mayahEval.phase).toBe(GamePhase.MIDDLE)
      expect(mayahEval.totalScore).toBe(1410)
    })
  })

  describe('ゲームフェーズ', () => {
    it('全てのゲームフェーズが定義されている', () => {
      expect(GamePhase.EARLY).toBe('early')
      expect(GamePhase.MIDDLE).toBe('middle')
      expect(GamePhase.LATE).toBe('late')
      expect(GamePhase.EMERGENCY).toBe('emergency')
    })

    it('各フェーズのデフォルト重みが適切に設定されている', () => {
      // 序盤: 形と連鎖構築重視
      const earlyWeights = DEFAULT_PHASE_WEIGHTS[GamePhase.EARLY]
      expect(earlyWeights.shapeWeight).toBe(0.4)
      expect(earlyWeights.chainWeight).toBe(0.4)
      expect(earlyWeights.riskTolerance).toBe(0.7)

      // 中盤: バランス型
      const middleWeights = DEFAULT_PHASE_WEIGHTS[GamePhase.MIDDLE]
      expect(middleWeights.chainWeight).toBe(0.35)
      expect(middleWeights.strategyWeight).toBe(0.25)
      expect(middleWeights.riskTolerance).toBe(0.5)

      // 終盤: 戦略重視
      const lateWeights = DEFAULT_PHASE_WEIGHTS[GamePhase.LATE]
      expect(lateWeights.strategyWeight).toBe(0.35)
      expect(lateWeights.operationWeight).toBe(0.25)
      expect(lateWeights.riskTolerance).toBe(0.3)

      // 緊急: 操作速度重視
      const emergencyWeights = DEFAULT_PHASE_WEIGHTS[GamePhase.EMERGENCY]
      expect(emergencyWeights.operationWeight).toBe(0.4)
      expect(emergencyWeights.riskTolerance).toBe(0.1)
    })

    it('重みの合計が1になる', () => {
      Object.values(DEFAULT_PHASE_WEIGHTS).forEach((weights) => {
        const sum =
          weights.operationWeight +
          weights.shapeWeight +
          weights.chainWeight +
          weights.strategyWeight
        expect(sum).toBeCloseTo(1.0, 5)
      })
    })
  })

  describe('パターンタイプ', () => {
    it('全ての定跡パターンが定義されている', () => {
      expect(PatternType.GTR).toBe('GTR')
      expect(PatternType.NEW_GTR).toBe('NEW_GTR')
      expect(PatternType.DAAZUMI).toBe('DAAZUMI')
      expect(PatternType.YAYOI).toBe('YAYOI')
      expect(PatternType.SUBMARINE).toBe('SUBMARINE')
      expect(PatternType.FUKIGEN_GTR).toBe('FUKIGEN_GTR')
      expect(PatternType.NONE).toBe('NONE')
    })
  })

  describe('RensaHandTree', () => {
    it('連鎖木ノードが正しく定義されている', () => {
      // Arrange
      const node: RensaNode = {
        chainCount: 5,
        score: 2400,
        frameCount: 120,
        requiredPuyos: 12,
        probability: 0.75,
        children: [],
      }

      // Assert
      expect(node.chainCount).toBe(5)
      expect(node.score).toBe(2400)
      expect(node.frameCount).toBe(120)
      expect(node.requiredPuyos).toBe(12)
      expect(node.probability).toBe(0.75)
      expect(node.children).toHaveLength(0)
    })

    it('連鎖木が正しく定義されている', () => {
      // Arrange
      const tree: RensaHandTree = {
        myTree: {
          chainCount: 8,
          score: 8640,
          frameCount: 180,
          requiredPuyos: 20,
          probability: 0.6,
          children: [],
        },
        opponentTree: {
          chainCount: 6,
          score: 4320,
          frameCount: 150,
          requiredPuyos: 16,
          probability: 0.7,
          children: [],
        },
        optimalTiming: 160,
        battleEvaluation: 0.8,
      }

      // Assert
      expect(tree.myTree.chainCount).toBe(8)
      expect(tree.opponentTree.chainCount).toBe(6)
      expect(tree.optimalTiming).toBe(160)
      expect(tree.battleEvaluation).toBe(0.8)
    })
  })

  describe('デフォルト設定', () => {
    it('デフォルトmayah設定が適切に定義されている', () => {
      expect(DEFAULT_MAYAH_SETTINGS.idealUShapeDepth).toBe(3)
      expect(DEFAULT_MAYAH_SETTINGS.idealConnectivity).toBe(4)
      expect(DEFAULT_MAYAH_SETTINGS.idealValleyBalance).toBe(2)
      expect(DEFAULT_MAYAH_SETTINGS.gtrBonus).toBe(100)
      expect(DEFAULT_MAYAH_SETTINGS.maxChigiri).toBe(2)
      expect(DEFAULT_MAYAH_SETTINGS.chainProbabilityThreshold).toBe(0.5)
      expect(DEFAULT_MAYAH_SETTINGS.emergencyHeight).toBe(10)
    })
  })
})
