/**
 * AI判断詳細表示コンポーネント
 */
import type { AIMove, MoveEvaluation } from '../../../domain/models/ai'

interface AIInsightsProps {
  /** 最後のAI判断 */
  lastAIMove: AIMove | null
  /** AI思考中フラグ */
  isThinking: boolean
}

export const AIInsights = ({ lastAIMove, isThinking }: AIInsightsProps) => {
  return (
    <div className="mt-4 p-4 bg-black/20 dark:bg-purple-800/50 rounded-lg border border-white/10 dark:border-purple-600">
      <AIThinkingHeader isThinking={isThinking} />
      <AIContentArea lastAIMove={lastAIMove} isThinking={isThinking} />
    </div>
  )
}

const AIThinkingHeader = ({ isThinking }: { isThinking: boolean }) => (
  <h4 className="text-white dark:text-purple-100 font-semibold mb-2 flex items-center">
    🧠 AI思考状況
    {isThinking && (
      <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-yellow-400 dark:bg-purple-400 animate-pulse"></span>
    )}
  </h4>
)

const AIContentArea = ({
  lastAIMove,
  isThinking,
}: {
  lastAIMove: AIMove | null
  isThinking: boolean
}) => {
  if (isThinking) {
    return (
      <div className="text-yellow-300 dark:text-purple-300 text-sm">
        🤔 AIが次の手を考え中...
      </div>
    )
  }

  if (lastAIMove && lastAIMove.evaluation) {
    return (
      <AIEvaluationDetails
        evaluation={lastAIMove.evaluation}
        move={lastAIMove}
      />
    )
  }

  return (
    <div className="text-white/60 dark:text-purple-400 text-sm">
      まだAIの判断履歴がありません
    </div>
  )
}

interface AIEvaluationDetailsProps {
  evaluation: MoveEvaluation
  move: AIMove
}

const AIEvaluationDetails = ({
  evaluation,
  move,
}: AIEvaluationDetailsProps) => {
  return (
    <div className="space-y-2">
      <div className="text-white/90 dark:text-purple-200 text-sm">
        <div className="font-medium mb-1">最後の判断:</div>
        <div className="text-xs text-white/80 dark:text-purple-300">
          {evaluation.reason}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/10 dark:bg-purple-700/50 rounded p-2">
          <div className="text-white/60 dark:text-purple-400">配置位置</div>
          <div className="text-white dark:text-purple-100 font-mono">
            列{move.x} / {move.rotation}°
          </div>
        </div>

        <div className="bg-white/10 dark:bg-purple-700/50 rounded p-2">
          <div className="text-white/60 dark:text-gray-400">総合スコア</div>
          <div className="text-white dark:text-purple-100 font-mono">
            {Math.round(evaluation.totalScore)}
          </div>
        </div>

        <div className="bg-white/10 dark:bg-purple-700/50 rounded p-2">
          <div className="text-white/60 dark:text-gray-400">高さ評価</div>
          <div className="text-white dark:text-purple-100 font-mono">
            {Math.round(evaluation.heightScore)}
          </div>
        </div>

        <div className="bg-white/10 dark:bg-purple-700/50 rounded p-2">
          <div className="text-white/60 dark:text-gray-400">中央度評価</div>
          <div className="text-white dark:text-purple-100 font-mono">
            {Math.round(evaluation.centerScore)}
          </div>
        </div>
      </div>

      {evaluation.modeScore !== 0 && (
        <div className="bg-blue-900/30 dark:bg-purple-800/30 rounded p-2">
          <div className="text-blue-200 dark:text-purple-300 text-xs">
            モード補正: +{Math.round(evaluation.modeScore)}
          </div>
        </div>
      )}
    </div>
  )
}
