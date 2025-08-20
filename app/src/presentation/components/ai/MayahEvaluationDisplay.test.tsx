/**
 * MayahEvaluationDisplayコンポーネントのテスト
 */
import { describe, expect, it } from 'vitest'

import { render, screen } from '@testing-library/react'

import type {
  ChainEvaluation,
  OperationEvaluation,
  ShapeEvaluation,
  StrategyEvaluation,
} from '../../../domain/models/ai/MayahEvaluation'
import type { OptimizedEvaluationResult } from '../../../domain/services/ai/OptimizedEvaluationService'
import { MayahEvaluationDisplay } from './MayahEvaluationDisplay'

describe('MayahEvaluationDisplay', () => {
  const createMockEvaluationResult = (): OptimizedEvaluationResult => ({
    basic: {
      score: 85.5,
      computeTime: 12.3,
    },
    evaluationLevels: ['basic', 'chain_analysis', 'strategy_analysis'],
    cacheInfo: {
      hits: 15,
      misses: 5,
      hitRate: 0.75,
    },
  })

  const createMockDetailedResult = (): OptimizedEvaluationResult => ({
    ...createMockEvaluationResult(),
    detailed: {
      chainEvaluation: {
        patterns: [],
        chainPotential: 120.0,
        diversityScore: 85.0,
        stabilityScore: 75.0,
        feasibilityScore: 90.0,
        totalScore: 95.5,
      },
      strategyEvaluation: {
        timingScore: 75.0,
        gazeScore: 80.0,
        riskScore: 65.0,
        defenseScore: 70.0,
        totalScore: 72.5,
      } as StrategyEvaluation,
      computeTime: 45.8,
    },
  })

  const createMockChainEvaluation = (): ChainEvaluation => ({
    patterns: [],
    chainPotential: 100.0,
    diversityScore: 80.0,
    stabilityScore: 75.0,
    feasibilityScore: 85.0,
    totalScore: 90.0,
  })

  const createMockOperationEvaluation = (): OperationEvaluation => ({
    frameCount: 25,
    chigiriCount: 1,
    efficiencyScore: 85.0,
    totalScore: 78.5,
  })

  const createMockShapeEvaluation = (): ShapeEvaluation => ({
    uShapeScore: 75.0,
    connectivityScore: 80.0,
    valleyScore: 70.0,
    balanceScore: 85.0,
    totalScore: 77.5,
  })

  const createMockStrategyEvaluation = (): StrategyEvaluation => ({
    timingScore: 80.0,
    gazeScore: 75.0,
    riskScore: 65.0,
    defenseScore: 70.0,
    totalScore: 72.5,
  })

  it('評価中状態が正しく表示される', () => {
    // Arrange & Act
    render(
      <MayahEvaluationDisplay evaluationResult={null} isEvaluating={true} />,
    )

    // Assert
    expect(screen.getByText('🧮 mayah AI評価')).toBeInTheDocument()
    expect(screen.getByText('評価計算中...')).toBeInTheDocument()
  })

  it('基本評価結果が正しく表示される', () => {
    // Arrange
    const evaluationResult = createMockEvaluationResult()

    // Act
    render(
      <MayahEvaluationDisplay
        evaluationResult={evaluationResult}
        isEvaluating={false}
      />,
    )

    // Assert
    expect(screen.getByText('基本評価')).toBeInTheDocument()
    expect(screen.getByText('85.5')).toBeInTheDocument()
    expect(screen.getByText('12.3ms')).toBeInTheDocument()
  })

  it('評価段階とキャッシュ情報が正しく表示される', () => {
    // Arrange
    const evaluationResult = createMockEvaluationResult()

    // Act
    render(
      <MayahEvaluationDisplay
        evaluationResult={evaluationResult}
        isEvaluating={false}
      />,
    )

    // Assert
    expect(screen.getByText('実行された評価段階')).toBeInTheDocument()
    expect(screen.getByText('basic')).toBeInTheDocument()
    expect(screen.getByText('chain_analysis')).toBeInTheDocument()
    expect(screen.getByText('strategy_analysis')).toBeInTheDocument()
    expect(screen.getByText('75.0%')).toBeInTheDocument()
    expect(screen.getByText('15/5')).toBeInTheDocument()
  })

  it('詳細評価結果が正しく表示される', () => {
    // Arrange
    const evaluationResult = createMockDetailedResult()

    // Act
    render(
      <MayahEvaluationDisplay
        evaluationResult={evaluationResult}
        isEvaluating={false}
      />,
    )

    // Assert
    expect(screen.getByText('詳細評価')).toBeInTheDocument()
    expect(screen.getByText('95.5')).toBeInTheDocument() // 連鎖スコア
    expect(screen.getByText('72.5')).toBeInTheDocument() // 戦略スコア
    expect(screen.getByText('45.8ms')).toBeInTheDocument() // 計算時間
  })

  it('連鎖評価詳細が正しく表示される', () => {
    // Arrange
    const chainEvaluation = createMockChainEvaluation()

    // Act
    render(
      <MayahEvaluationDisplay
        evaluationResult={null}
        chainEvaluation={chainEvaluation}
        isEvaluating={false}
      />,
    )

    // Assert
    expect(screen.getByText('🔗 連鎖評価')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument() // パターン数
    expect(screen.getByText('100.0')).toBeInTheDocument() // ポテンシャル
    expect(screen.getByText('80.0')).toBeInTheDocument() // 多様性
    expect(screen.getByText('90.0')).toBeInTheDocument() // 総合スコア
  })

  it('操作評価詳細が正しく表示される', () => {
    // Arrange
    const operationEvaluation = createMockOperationEvaluation()

    // Act
    render(
      <MayahEvaluationDisplay
        evaluationResult={null}
        operationEvaluation={operationEvaluation}
        isEvaluating={false}
      />,
    )

    // Assert
    expect(screen.getByText('⚡ 操作評価')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument() // フレーム数
    expect(screen.getByText('1')).toBeInTheDocument() // ちぎり数
    expect(screen.getByText('85.0')).toBeInTheDocument() // 効率性
    expect(screen.getByText('78.5')).toBeInTheDocument() // 総合スコア
  })

  it('形評価詳細が正しく表示される', () => {
    // Arrange
    const shapeEvaluation = createMockShapeEvaluation()

    // Act
    render(
      <MayahEvaluationDisplay
        evaluationResult={null}
        shapeEvaluation={shapeEvaluation}
        isEvaluating={false}
      />,
    )

    // Assert
    expect(screen.getByText('🏗️ 形評価')).toBeInTheDocument()
    expect(screen.getByText('75.0')).toBeInTheDocument() // U字型
    expect(screen.getByText('80.0')).toBeInTheDocument() // 連結性
    expect(screen.getByText('70.0')).toBeInTheDocument() // 山谷バランス
    expect(screen.getByText('77.5')).toBeInTheDocument() // 総合スコア
  })

  it('戦略評価詳細が正しく表示される', () => {
    // Arrange
    const strategyEvaluation = createMockStrategyEvaluation()

    // Act
    render(
      <MayahEvaluationDisplay
        evaluationResult={null}
        strategyEvaluation={strategyEvaluation}
        isEvaluating={false}
      />,
    )

    // Assert
    expect(screen.getByText('🎯 戦略評価')).toBeInTheDocument()
    expect(screen.getByText('80.0')).toBeInTheDocument() // タイミング
    expect(screen.getByText('75.0')).toBeInTheDocument() // 凝視
    expect(screen.getByText('65.0')).toBeInTheDocument() // リスク
    expect(screen.getByText('72.5')).toBeInTheDocument() // 総合スコア
  })

  it('全ての評価詳細が同時に表示される', () => {
    // Arrange
    const evaluationResult = createMockDetailedResult()
    const chainEvaluation = createMockChainEvaluation()
    const operationEvaluation = createMockOperationEvaluation()
    const shapeEvaluation = createMockShapeEvaluation()
    const strategyEvaluation = createMockStrategyEvaluation()

    // Act
    render(
      <MayahEvaluationDisplay
        evaluationResult={evaluationResult}
        chainEvaluation={chainEvaluation}
        operationEvaluation={operationEvaluation}
        shapeEvaluation={shapeEvaluation}
        strategyEvaluation={strategyEvaluation}
        isEvaluating={false}
      />,
    )

    // Assert
    expect(screen.getByText('基本評価')).toBeInTheDocument()
    expect(screen.getByText('詳細評価')).toBeInTheDocument()
    expect(screen.getByText('🔗 連鎖評価')).toBeInTheDocument()
    expect(screen.getByText('⚡ 操作評価')).toBeInTheDocument()
    expect(screen.getByText('🏗️ 形評価')).toBeInTheDocument()
    expect(screen.getByText('🎯 戦略評価')).toBeInTheDocument()
  })

  it('評価結果がnullの場合でもエラーにならない', () => {
    // Arrange & Act
    render(
      <MayahEvaluationDisplay evaluationResult={null} isEvaluating={false} />,
    )

    // Assert
    expect(screen.getByText('🧮 mayah AI評価')).toBeInTheDocument()
  })

  it('連鎖木の有無が正しく表示される', () => {
    // Arrange
    const evaluationResult = createMockDetailedResult()
    evaluationResult.detailed!.rensaHandTree = {
      myTree: {
        chainCount: 0,
        score: 0,
        frameCount: 0,
        requiredPuyos: 0,
        probability: 0,
        children: [],
      },
      opponentTree: {
        chainCount: 0,
        score: 0,
        frameCount: 0,
        requiredPuyos: 0,
        probability: 0,
        children: [],
      },
      optimalTiming: 0,
      battleEvaluation: 0,
    } // 連鎖木あり

    // Act
    render(
      <MayahEvaluationDisplay
        evaluationResult={evaluationResult}
        isEvaluating={false}
      />,
    )

    // Assert
    expect(screen.getByText('有')).toBeInTheDocument() // 連鎖木有
  })
})
