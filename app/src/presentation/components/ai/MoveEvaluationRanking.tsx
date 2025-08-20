/**
 * AI候補手の評価ランキング表示コンポーネント
 */
import { useState } from 'react'

import type { AIMove } from '../../../domain/models/ai/MoveTypes'
import type { OptimizedEvaluationResult } from '../../../domain/services/ai/OptimizedEvaluationService'

interface MoveWithEvaluation {
  move: AIMove
  evaluation: OptimizedEvaluationResult
  rank: number
}

interface MoveEvaluationRankingProps {
  /** 評価済み候補手 */
  evaluatedMoves: MoveWithEvaluation[]
  /** 選択された手 */
  selectedMove: AIMove | null
  /** 評価中フラグ */
  isEvaluating: boolean
  /** 手選択ハンドラ */
  onMoveSelect?: (move: AIMove) => void
  /** 最大表示件数 */
  maxDisplay?: number
}

export const MoveEvaluationRanking = ({
  evaluatedMoves,
  selectedMove,
  isEvaluating,
  onMoveSelect,
  maxDisplay = 10,
}: MoveEvaluationRankingProps) => {
  const [sortBy, setSortBy] = useState<'total' | 'basic' | 'detailed'>('total')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  // ソート関数を分離
  const getSortScore = (moveWithEval: MoveWithEvaluation) => {
    switch (sortBy) {
      case 'basic':
        return moveWithEval.evaluation.basic.score
      case 'detailed':
        return (
          moveWithEval.evaluation.detailed?.strategyEvaluation.totalScore ??
          moveWithEval.evaluation.basic.score
        )
      case 'total':
      default:
        return moveWithEval.move.score
    }
  }

  // ソート済みの候補手
  const sortedMoves = [...evaluatedMoves]
    .sort((a, b) => getSortScore(b) - getSortScore(a))
    .slice(0, maxDisplay)

  const getBestScore = () => {
    if (sortedMoves.length === 0) return 0
    return sortedMoves[0].move.score
  }

  return (
    <div className="space-y-4">
      <RankingHeader
        isEvaluating={isEvaluating}
        moveCount={evaluatedMoves.length}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {sortedMoves.length === 0 ? (
        <EmptyState isEvaluating={isEvaluating} />
      ) : (
        <div className="space-y-2">
          {sortedMoves.map((moveWithEval) => (
            <MoveRankingCard
              key={`${moveWithEval.move.x}-${moveWithEval.move.rotation}`}
              moveWithEvaluation={moveWithEval}
              isSelected={
                selectedMove?.x === moveWithEval.move.x &&
                selectedMove?.rotation === moveWithEval.move.rotation
              }
              isBest={moveWithEval.move.score === getBestScore()}
              showDetails={
                showDetails ===
                `${moveWithEval.move.x}-${moveWithEval.move.rotation}`
              }
              onSelect={() => onMoveSelect?.(moveWithEval.move)}
              onToggleDetails={() => {
                const key = `${moveWithEval.move.x}-${moveWithEval.move.rotation}`
                setShowDetails(showDetails === key ? null : key)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface RankingHeaderProps {
  isEvaluating: boolean
  moveCount: number
  sortBy: string
  onSortChange: (sortBy: 'total' | 'basic' | 'detailed') => void
}

const RankingHeader = ({
  isEvaluating,
  moveCount,
  sortBy,
  onSortChange,
}: RankingHeaderProps) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <h3 className="text-lg font-semibold text-white flex items-center">
        🏆 候補手ランキング
        {isEvaluating && (
          <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-orange-400 animate-pulse"></span>
        )}
      </h3>
      <span className="text-sm text-gray-400">{moveCount}件の候補手</span>
    </div>

    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-400">ソート:</span>
      <select
        value={sortBy}
        onChange={(e) =>
          onSortChange(e.target.value as 'total' | 'basic' | 'detailed')
        }
        className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
      >
        <option value="total">総合スコア</option>
        <option value="basic">基本評価</option>
        <option value="detailed">詳細評価</option>
      </select>
    </div>
  </div>
)

const EmptyState = ({ isEvaluating }: { isEvaluating: boolean }) => (
  <div className="text-center text-gray-400 py-8 bg-gray-800/30 rounded-lg">
    {isEvaluating ? (
      <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400"></div>
        <span>候補手を評価中...</span>
      </div>
    ) : (
      <div>
        <div className="text-2xl mb-2">🤔</div>
        <div>評価済みの候補手がありません</div>
      </div>
    )}
  </div>
)

interface MoveRankingCardProps {
  moveWithEvaluation: MoveWithEvaluation
  isSelected: boolean
  isBest: boolean
  showDetails: boolean
  onSelect: () => void
  onToggleDetails: () => void
}

const MoveRankingCard = ({
  moveWithEvaluation,
  isSelected,
  isBest,
  showDetails,
  onSelect,
  onToggleDetails,
}: MoveRankingCardProps) => {
  const { move, evaluation, rank } = moveWithEvaluation

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `${rank}`
    }
  }

  const getCardClasses = () => {
    let classes =
      'rounded-lg p-3 border transition-all cursor-pointer hover:shadow-lg '

    if (isSelected) {
      classes += 'border-blue-400 bg-blue-900/30 '
    } else if (isBest) {
      classes += 'border-yellow-400 bg-yellow-900/20 '
    } else {
      classes += 'border-gray-600 bg-gray-800/50 hover:border-gray-500 '
    }

    return classes
  }

  return (
    <div className={getCardClasses()}>
      <div className="flex items-center justify-between" onClick={onSelect}>
        <div className="flex items-center space-x-3">
          <div className="text-lg font-bold text-white min-w-[40px]">
            {getRankIcon(rank)}
          </div>

          <div className="flex-1">
            <MoveInfo move={move} />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ScoreDisplay evaluation={evaluation} />

          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleDetails()
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {showDetails ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <MoveDetailedEvaluation evaluation={evaluation} />
        </div>
      )}
    </div>
  )
}

const MoveInfo = ({ move }: { move: AIMove }) => (
  <div>
    <div className="text-white font-medium">
      列 {move.x + 1} / {move.rotation}°
    </div>
    <div className="text-sm text-gray-400">
      配置位置: ({move.x}, 回転{move.rotation}°)
    </div>
  </div>
)

const ScoreDisplay = ({
  evaluation,
}: {
  evaluation: OptimizedEvaluationResult
}) => {
  const detailedScore = evaluation.detailed?.strategyEvaluation.totalScore
  const hasDetailed = evaluation.detailed !== undefined

  return (
    <div className="text-right">
      <div className="text-white font-mono text-lg">
        {evaluation.basic.score.toFixed(1)}
      </div>
      {hasDetailed && (
        <div className="text-sm text-blue-300">
          詳細: {detailedScore?.toFixed(1)}
        </div>
      )}
      <div className="text-xs text-gray-400">
        {evaluation.basic.computeTime.toFixed(1)}ms
      </div>
    </div>
  )
}

const MoveDetailedEvaluation = ({
  evaluation,
}: {
  evaluation: OptimizedEvaluationResult
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
    <div className="bg-gray-700/50 rounded p-2">
      <div className="text-gray-300">基本評価</div>
      <div className="text-white font-mono">
        {evaluation.basic.score.toFixed(1)}
      </div>
      <div className="text-xs text-gray-400">
        {evaluation.basic.computeTime.toFixed(1)}ms
      </div>
    </div>

    {evaluation.detailed && (
      <>
        <div className="bg-red-700/20 rounded p-2">
          <div className="text-red-300">連鎖評価</div>
          <div className="text-white font-mono">
            {evaluation.detailed.chainEvaluation.totalScore.toFixed(1)}
          </div>
          <div className="text-xs text-red-200">
            ポテンシャル
            {evaluation.detailed.chainEvaluation.chainPotential.toFixed(1)}
          </div>
        </div>

        <div className="bg-yellow-700/20 rounded p-2">
          <div className="text-yellow-300">戦略評価</div>
          <div className="text-white font-mono">
            {evaluation.detailed.strategyEvaluation.totalScore.toFixed(1)}
          </div>
          <div className="text-xs text-yellow-200">
            タイミング:{' '}
            {evaluation.detailed.strategyEvaluation.timingScore.toFixed(1)}
          </div>
        </div>

        <div className="bg-green-700/20 rounded p-2">
          <div className="text-green-300">処理詳細</div>
          <div className="text-white font-mono">
            {evaluation.detailed.computeTime.toFixed(1)}ms
          </div>
          <div className="text-xs text-green-200">
            {evaluation.detailed.rensaHandTree ? '連鎖木あり' : '連鎖木なし'}
          </div>
        </div>
      </>
    )}

    <div className="bg-blue-700/20 rounded p-2">
      <div className="text-blue-300">評価段階</div>
      <div className="text-xs text-blue-200">
        {evaluation.evaluationLevels.join(' → ')}
      </div>
      <div className="text-xs text-blue-200 mt-1">
        キャッシュ: {(evaluation.cacheInfo.hitRate * 100).toFixed(0)}%
      </div>
    </div>
  </div>
)
