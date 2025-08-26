import type { PuyoColor } from '../Puyo'

/**
 * ゲーム状態を表すインターフェース
 */
export interface GameState {
  field: (PuyoColor | null)[][]
  currentPuyo: {
    puyo1: { color: PuyoColor; x: number; y: number }
    puyo2: { color: PuyoColor; x: number; y: number }
  }
  nextPuyo: {
    puyo1: { color: PuyoColor; x: number; y: number }
    puyo2: { color: PuyoColor; x: number; y: number }
  }
  score: number
  chainCount: number
  turn: number
}

/**
 * AIのアクションを表すインターフェース
 */
export interface AIAction {
  x: number
  rotation: number
  evaluationScore: number
  features: Record<string, number>
}

/**
 * 学習データのメタデータ
 */
export interface TrainingMetadata {
  gameId: string
  playerId: string
  difficulty: 'easy' | 'normal' | 'hard'
  version: string
  [key: string]: unknown // 拡張可能
}

/**
 * 学習用データモデル
 */
export interface TrainingData {
  readonly id: string
  readonly timestamp: Date
  readonly gameState: Readonly<GameState>
  readonly action: Readonly<AIAction>
  readonly reward: number
  readonly metadata: Readonly<TrainingMetadata>
}

/**
 * ユニークなIDを生成
 */
const generateId = (): string => {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 9)
  return `training_${timestamp}_${randomPart}`
}

/**
 * TrainingDataを作成するファクトリ関数
 */
export const createTrainingData = (
  gameState: GameState,
  action: AIAction,
  reward: number,
  metadata: TrainingMetadata,
): TrainingData => {
  const trainingData: TrainingData = Object.freeze({
    id: generateId(),
    timestamp: new Date(),
    gameState: Object.freeze({ ...gameState }),
    action: Object.freeze({ ...action }),
    reward,
    metadata: Object.freeze({ ...metadata }),
  })

  return trainingData
}

/**
 * TrainingDataのバッチを表すインターフェース
 */
export interface TrainingBatch {
  readonly id: string
  readonly startTime: Date
  readonly endTime: Date
  readonly data: readonly TrainingData[]
  readonly size: number
}

/**
 * TrainingBatchを作成するファクトリ関数
 */
export const createTrainingBatch = (data: TrainingData[]): TrainingBatch => {
  if (data.length === 0) {
    throw new Error('Training batch cannot be empty')
  }

  const sortedData = [...data].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  )

  return Object.freeze({
    id: `batch_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`,
    startTime: sortedData[0].timestamp,
    endTime: sortedData[sortedData.length - 1].timestamp,
    data: Object.freeze(sortedData),
    size: data.length,
  })
}

/**
 * 学習データの統計情報
 */
export interface TrainingStatistics {
  readonly totalSamples: number
  readonly averageReward: number
  readonly minReward: number
  readonly maxReward: number
  readonly standardDeviation: number
  readonly timeRange: {
    readonly start: Date
    readonly end: Date
  }
}

/**
 * 学習データから統計を計算
 */
export const calculateStatistics = (
  data: TrainingData[],
): TrainingStatistics => {
  if (data.length === 0) {
    throw new Error('Cannot calculate statistics for empty data')
  }

  const rewards = data.map((d) => d.reward)
  const totalSamples = data.length
  const averageReward = rewards.reduce((sum, r) => sum + r, 0) / totalSamples
  const minReward = Math.min(...rewards)
  const maxReward = Math.max(...rewards)

  // 標準偏差の計算
  const variance =
    rewards.reduce((sum, r) => sum + Math.pow(r - averageReward, 2), 0) /
    totalSamples
  const standardDeviation = Math.sqrt(variance)

  // 時間範囲の計算
  const timestamps = data.map((d) => d.timestamp.getTime())
  const timeRange = {
    start: new Date(Math.min(...timestamps)),
    end: new Date(Math.max(...timestamps)),
  }

  return Object.freeze({
    totalSamples,
    averageReward,
    minReward,
    maxReward,
    standardDeviation,
    timeRange: Object.freeze(timeRange),
  })
}
