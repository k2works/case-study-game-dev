/**
 * MoveEvaluationRankingコンポーネントのテスト
 */
import { describe, expect, it, vi } from 'vitest'

import { fireEvent, render, screen } from '@testing-library/react'

import type { AIMove } from '../../../domain/models/ai/MoveTypes'
import type { OptimizedEvaluationResult } from '../../../domain/services/ai/OptimizedEvaluationService'
import { MoveEvaluationRanking } from './MoveEvaluationRanking'

interface MoveWithEvaluation {
  move: AIMove
  evaluation: OptimizedEvaluationResult
  rank: number
}

describe('MoveEvaluationRanking', () => {
  const createMockMove = (
    x: number,
    rotation: number,
    score: number,
  ): AIMove => ({
    x,
    rotation,
    score,
  })

  const createMockEvaluation = (
    basicScore: number,
    computeTime: number = 10.0,
    detailed = false,
  ): OptimizedEvaluationResult => {
    const result: OptimizedEvaluationResult = {
      basic: {
        score: basicScore,
        computeTime,
      },
      evaluationLevels: ['basic'],
      cacheInfo: {
        hits: 5,
        misses: 2,
        hitRate: 0.7,
      },
    }

    if (detailed) {
      result.detailed = {
        chainEvaluation: {
          patterns: [],
          chainPotential: 80.0,
          diversityScore: 70.0,
          stabilityScore: 75.0,
          feasibilityScore: 85.0,
          totalScore: basicScore + 10,
        },
        strategyEvaluation: {
          timingScore: 75.0,
          gazeScore: 80.0,
          riskScore: 65.0,
          defenseScore: 70.0,
          totalScore: basicScore + 5,
        },
        computeTime: 25.0,
        rensaHandTree: {
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
        }, // 連鎖木あり
      }
      result.evaluationLevels = ['basic', 'chain_analysis', 'strategy_analysis']
    }

    return result
  }

  const createMockMoveWithEvaluation = (
    x: number,
    rotation: number,
    score: number,
    rank: number,
    detailed = false,
  ): MoveWithEvaluation => ({
    move: createMockMove(x, rotation, score),
    evaluation: createMockEvaluation(score, 10.0, detailed),
    rank,
  })

  const defaultProps = {
    evaluatedMoves: [
      createMockMoveWithEvaluation(2, 0, 85.0, 1, true),
      createMockMoveWithEvaluation(1, 90, 75.0, 2),
      createMockMoveWithEvaluation(3, 180, 65.0, 3),
    ],
    selectedMove: null,
    isEvaluating: false,
    onMoveSelect: vi.fn(),
    maxDisplay: 10,
  }

  it('候補手ランキングが正しく表示される', () => {
    // Arrange & Act
    render(<MoveEvaluationRanking {...defaultProps} />)

    // Assert
    expect(screen.getByText('🏆 候補手ランキング')).toBeInTheDocument()
    expect(screen.getByText('3件の候補手')).toBeInTheDocument()
    expect(screen.getByText('🥇')).toBeInTheDocument() // 1位
    expect(screen.getByText('🥈')).toBeInTheDocument() // 2位
    expect(screen.getByText('🥉')).toBeInTheDocument() // 3位
  })

  it('各候補手の基本情報が表示される', () => {
    // Arrange & Act
    render(<MoveEvaluationRanking {...defaultProps} />)

    // Assert
    expect(screen.getByText('列 3 / 0°')).toBeInTheDocument() // 1位の手
    expect(screen.getByText('列 2 / 90°')).toBeInTheDocument() // 2位の手
    expect(screen.getByText('列 4 / 180°')).toBeInTheDocument() // 3位の手
    expect(screen.getByText('85.0')).toBeInTheDocument() // 1位のスコア
  })

  it('詳細評価がある手に詳細スコアが表示される', () => {
    // Arrange & Act
    render(<MoveEvaluationRanking {...defaultProps} />)

    // Assert
    expect(screen.getByText('詳細: 90.0')).toBeInTheDocument() // 1位の詳細スコア
  })

  it('手選択ハンドラが正しく呼ばれる', () => {
    // Arrange
    const onMoveSelect = vi.fn()
    render(
      <MoveEvaluationRanking {...defaultProps} onMoveSelect={onMoveSelect} />,
    )

    // Act
    fireEvent.click(screen.getByText('列 3 / 0°'))

    // Assert
    expect(onMoveSelect).toHaveBeenCalledWith(
      expect.objectContaining({ x: 2, rotation: 0, score: 85.0 }),
    )
  })

  it('選択された手がハイライト表示される', () => {
    // Arrange
    const selectedMove = createMockMove(2, 0, 85.0)
    render(
      <MoveEvaluationRanking {...defaultProps} selectedMove={selectedMove} />,
    )

    // Act & Assert
    const selectedCard = screen.getByText('列 3 / 0°').closest('.rounded-lg')
    expect(selectedCard).toHaveClass('border-blue-400')
  })

  it('評価中状態が正しく表示される', () => {
    // Arrange & Act
    render(<MoveEvaluationRanking {...defaultProps} isEvaluating={true} />)

    // Assert
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('候補手がない場合の表示', () => {
    // Arrange & Act
    render(<MoveEvaluationRanking {...defaultProps} evaluatedMoves={[]} />)

    // Assert
    expect(screen.getByText('評価済みの候補手がありません')).toBeInTheDocument()
  })

  it('評価中で候補手がない場合の表示', () => {
    // Arrange & Act
    render(
      <MoveEvaluationRanking
        {...defaultProps}
        evaluatedMoves={[]}
        isEvaluating={true}
      />,
    )

    // Assert
    expect(screen.getByText('候補手を評価中...')).toBeInTheDocument()
  })

  it('ソート機能が動作する', () => {
    // Arrange
    render(<MoveEvaluationRanking {...defaultProps} />)

    // Act
    fireEvent.change(screen.getByDisplayValue('総合スコア'), {
      target: { value: 'basic' },
    })

    // Assert
    expect(screen.getByDisplayValue('基本評価')).toBeInTheDocument()
  })

  it('詳細表示の切り替えが動作する', () => {
    // Arrange
    render(<MoveEvaluationRanking {...defaultProps} />)

    // Act - 詳細を展開
    const detailButton = screen.getAllByText('▶')[0]
    fireEvent.click(detailButton)

    // Assert
    const detailSections = screen.getAllByText('基本評価')
    expect(detailSections.length).toBeGreaterThan(1) // 詳細表示で基本評価が表示される
    expect(screen.getByText('連鎖評価')).toBeInTheDocument()
    expect(screen.getByText('戦略評価')).toBeInTheDocument()
    expect(screen.getByText('ポテンシャル80.0')).toBeInTheDocument()
  })

  it('詳細表示で正しい情報が表示される', () => {
    // Arrange
    render(<MoveEvaluationRanking {...defaultProps} />)

    // Act
    fireEvent.click(screen.getAllByText('▶')[0])

    // Assert
    expect(screen.getByText('タイミング: 75.0')).toBeInTheDocument()
    expect(screen.getByText('キャッシュ: 70%')).toBeInTheDocument()
    expect(screen.getByText('連鎖木あり')).toBeInTheDocument()
  })

  it('最大表示件数が適用される', () => {
    // Arrange
    const manyMoves = Array.from({ length: 15 }, (_, i) =>
      createMockMoveWithEvaluation(i, 0, 100 - i, i + 1),
    )
    render(
      <MoveEvaluationRanking
        {...defaultProps}
        evaluatedMoves={manyMoves}
        maxDisplay={5}
      />,
    )

    // Assert
    expect(screen.getByText('15件の候補手')).toBeInTheDocument()
    expect(screen.getByText('🥇')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // 5位まで表示
    expect(screen.queryByText('6')).not.toBeInTheDocument() // 6位以降は表示されない
  })

  it('ベスト手が特別にハイライトされる', () => {
    // Arrange
    render(<MoveEvaluationRanking {...defaultProps} />)

    // Assert
    const bestMoveCard = screen.getByText('列 3 / 0°').closest('.rounded-lg')
    expect(bestMoveCard).toHaveClass('border-yellow-400')
  })

  it('計算時間が表示される', () => {
    // Arrange & Act
    render(<MoveEvaluationRanking {...defaultProps} />)

    // Assert
    const timeElements = screen.getAllByText('10.0ms')
    expect(timeElements.length).toBeGreaterThan(0) // 計算時間が表示される
  })

  it('評価段階が詳細表示で確認できる', () => {
    // Arrange
    render(<MoveEvaluationRanking {...defaultProps} />)

    // Act
    fireEvent.click(screen.getAllByText('▶')[0])

    // Assert
    expect(
      screen.getByText('basic → chain_analysis → strategy_analysis'),
    ).toBeInTheDocument()
  })
})
