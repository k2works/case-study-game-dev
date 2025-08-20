/**
 * mayah AI評価結果の可視化コンポーネント
 */
import type {
  ChainEvaluation,
  OperationEvaluation,
  RensaHandTree,
  ShapeEvaluation,
  StrategyEvaluation,
} from '../../../domain/models/ai/MayahEvaluation'
import type { OptimizedEvaluationResult } from '../../../domain/services/ai/OptimizedEvaluationService'

interface MayahEvaluationDisplayProps {
  /** 最適化された評価結果 */
  evaluationResult: OptimizedEvaluationResult | null
  /** 連鎖評価詳細 */
  chainEvaluation?: ChainEvaluation
  /** 操作評価詳細 */
  operationEvaluation?: OperationEvaluation
  /** 形評価詳細 */
  shapeEvaluation?: ShapeEvaluation
  /** 戦略評価詳細 */
  strategyEvaluation?: StrategyEvaluation
  /** 評価中フラグ */
  isEvaluating: boolean
}

export const MayahEvaluationDisplay = ({
  evaluationResult,
  chainEvaluation,
  operationEvaluation,
  shapeEvaluation,
  strategyEvaluation,
  isEvaluating,
}: MayahEvaluationDisplayProps) => {
  return (
    <div className="space-y-4">
      <EvaluationHeader isEvaluating={isEvaluating} />

      {evaluationResult && (
        <>
          <BasicEvaluationCard evaluation={evaluationResult.basic} />
          <EvaluationLevelsCard
            levels={[...evaluationResult.evaluationLevels]}
            cacheInfo={evaluationResult.cacheInfo}
          />

          {evaluationResult.detailed && (
            <DetailedEvaluationCard detailed={evaluationResult.detailed} />
          )}
        </>
      )}

      <EvaluationDetailsGrid
        chain={chainEvaluation}
        operation={operationEvaluation}
        shape={shapeEvaluation}
        strategy={strategyEvaluation}
      />
    </div>
  )
}

const EvaluationHeader = ({ isEvaluating }: { isEvaluating: boolean }) => (
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold text-white flex items-center">
      🧮 mayah AI評価
      {isEvaluating && (
        <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
      )}
    </h3>
    {isEvaluating && (
      <span className="text-sm text-blue-300">評価計算中...</span>
    )}
  </div>
)

interface BasicEvaluationCardProps {
  evaluation: {
    score: number
    computeTime: number
  }
}

const BasicEvaluationCard = ({ evaluation }: BasicEvaluationCardProps) => (
  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4">
    <h4 className="text-white font-medium mb-3">基本評価</h4>
    <div className="grid grid-cols-2 gap-4">
      <ScoreDisplay
        label="総合スコア"
        value={evaluation.score}
        format="decimal"
        color="text-blue-300"
      />
      <ScoreDisplay
        label="計算時間"
        value={evaluation.computeTime}
        format="time"
        color="text-green-300"
      />
    </div>
  </div>
)

interface EvaluationLevelsCardProps {
  levels: string[]
  cacheInfo: {
    hits: number
    misses: number
    hitRate: number
  }
}

const EvaluationLevelsCard = ({
  levels,
  cacheInfo,
}: EvaluationLevelsCardProps) => (
  <div className="bg-gray-800/50 rounded-lg p-4">
    <h4 className="text-white font-medium mb-3">評価詳細</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <div className="text-sm text-gray-300 mb-2">実行された評価段階</div>
        <div className="flex flex-wrap gap-1">
          {levels.map((level, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 bg-blue-600/30 text-blue-200 text-xs rounded"
            >
              {level}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-300 mb-2">キャッシュ効率</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">ヒット率</span>
            <span className="text-green-300">
              {(cacheInfo.hitRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">ヒット/ミス</span>
            <span className="text-gray-300">
              {cacheInfo.hits}/{cacheInfo.misses}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

interface DetailedEvaluationCardProps {
  detailed: {
    chainEvaluation: ChainEvaluation
    strategyEvaluation: StrategyEvaluation
    rensaHandTree?: RensaHandTree
    computeTime: number
  }
}

const DetailedEvaluationCard = ({ detailed }: DetailedEvaluationCardProps) => (
  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4">
    <h4 className="text-white font-medium mb-3">詳細評価</h4>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ScoreDisplay
        label="連鎖スコア"
        value={detailed.chainEvaluation.totalScore}
        format="decimal"
        color="text-purple-300"
      />
      <ScoreDisplay
        label="戦略スコア"
        value={detailed.strategyEvaluation.totalScore}
        format="decimal"
        color="text-pink-300"
      />
      <ScoreDisplay
        label="計算時間"
        value={detailed.computeTime}
        format="time"
        color="text-green-300"
      />
      <ScoreDisplay
        label="連鎖木"
        value={detailed.rensaHandTree ? 1 : 0}
        format="boolean"
        color="text-yellow-300"
      />
    </div>
  </div>
)

interface EvaluationDetailsGridProps {
  chain?: ChainEvaluation
  operation?: OperationEvaluation
  shape?: ShapeEvaluation
  strategy?: StrategyEvaluation
}

const EvaluationDetailsGrid = ({
  chain,
  operation,
  shape,
  strategy,
}: EvaluationDetailsGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {chain && <ChainEvaluationCard evaluation={chain} />}
    {operation && <OperationEvaluationCard evaluation={operation} />}
    {shape && <ShapeEvaluationCard evaluation={shape} />}
    {strategy && <StrategyEvaluationCard evaluation={strategy} />}
  </div>
)

const ChainEvaluationCard = ({
  evaluation,
}: {
  evaluation: ChainEvaluation
}) => (
  <div className="bg-red-900/20 rounded-lg p-4">
    <h5 className="text-red-300 font-medium mb-3">🔗 連鎖評価</h5>
    <div className="space-y-2">
      <ScoreDisplay
        label="パターン数"
        value={evaluation.patterns.length}
        format="integer"
        color="text-red-200"
      />
      <ScoreDisplay
        label="連鎖ポテンシャル"
        value={evaluation.chainPotential}
        format="decimal"
        color="text-red-200"
      />
      <ScoreDisplay
        label="多様性"
        value={evaluation.diversityScore}
        format="decimal"
        color="text-red-200"
      />
      <ScoreDisplay
        label="総合スコア"
        value={evaluation.totalScore}
        format="decimal"
        color="text-red-300"
      />
    </div>
  </div>
)

const OperationEvaluationCard = ({
  evaluation,
}: {
  evaluation: OperationEvaluation
}) => (
  <div className="bg-blue-900/20 rounded-lg p-4">
    <h5 className="text-blue-300 font-medium mb-3">⚡ 操作評価</h5>
    <div className="space-y-2">
      <ScoreDisplay
        label="フレーム数"
        value={evaluation.frameCount}
        format="integer"
        color="text-blue-200"
      />
      <ScoreDisplay
        label="ちぎり数"
        value={evaluation.chigiriCount}
        format="integer"
        color="text-blue-200"
      />
      <ScoreDisplay
        label="効率性"
        value={evaluation.efficiencyScore}
        format="decimal"
        color="text-blue-200"
      />
      <ScoreDisplay
        label="総合スコア"
        value={evaluation.totalScore}
        format="decimal"
        color="text-blue-300"
      />
    </div>
  </div>
)

const ShapeEvaluationCard = ({
  evaluation,
}: {
  evaluation: ShapeEvaluation
}) => (
  <div className="bg-green-900/20 rounded-lg p-4">
    <h5 className="text-green-300 font-medium mb-3">🏗️ 形評価</h5>
    <div className="space-y-2">
      <ScoreDisplay
        label="U字型"
        value={evaluation.uShapeScore}
        format="decimal"
        color="text-green-200"
      />
      <ScoreDisplay
        label="連結性"
        value={evaluation.connectivityScore}
        format="decimal"
        color="text-green-200"
      />
      <ScoreDisplay
        label="山谷バランス"
        value={evaluation.valleyScore}
        format="decimal"
        color="text-green-200"
      />
      <ScoreDisplay
        label="総合スコア"
        value={evaluation.totalScore}
        format="decimal"
        color="text-green-300"
      />
    </div>
  </div>
)

const StrategyEvaluationCard = ({
  evaluation,
}: {
  evaluation: StrategyEvaluation
}) => (
  <div className="bg-yellow-900/20 rounded-lg p-4">
    <h5 className="text-yellow-300 font-medium mb-3">🎯 戦略評価</h5>
    <div className="space-y-2">
      <ScoreDisplay
        label="タイミング"
        value={evaluation.timingScore}
        format="decimal"
        color="text-yellow-200"
      />
      <ScoreDisplay
        label="凝視"
        value={evaluation.gazeScore}
        format="decimal"
        color="text-yellow-200"
      />
      <ScoreDisplay
        label="リスク"
        value={evaluation.riskScore}
        format="decimal"
        color="text-yellow-200"
      />
      <ScoreDisplay
        label="総合スコア"
        value={evaluation.totalScore}
        format="decimal"
        color="text-yellow-300"
      />
    </div>
  </div>
)

interface ScoreDisplayProps {
  label: string
  value: number
  format: 'integer' | 'decimal' | 'time' | 'boolean'
  color: string
}

const ScoreDisplay = ({ label, value, format, color }: ScoreDisplayProps) => {
  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case 'integer':
        return Math.round(val).toString()
      case 'decimal':
        return val.toFixed(1)
      case 'time':
        return `${val.toFixed(1)}ms`
      case 'boolean':
        return val > 0 ? '有' : '無'
      default:
        return val.toString()
    }
  }

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-300">{label}</span>
      <span className={`text-sm font-mono ${color}`}>
        {formatValue(value, format)}
      </span>
    </div>
  )
}
