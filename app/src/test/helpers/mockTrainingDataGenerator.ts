import type { PuyoColor } from '../../domain/models/Puyo'
import type {
  AIAction,
  GameState,
  TrainingData,
  TrainingMetadata,
} from '../../domain/models/training/TrainingData'
import { createTrainingData } from '../../domain/models/training/TrainingData'

/**
 * 学習用モックデータ生成ヘルパー
 */
export class MockTrainingDataGenerator {
  private static readonly COLORS: PuyoColor[] = [
    'red',
    'blue',
    'green',
    'yellow',
  ]

  /**
   * ランダムなゲーム状態を生成
   */
  static generateRandomGameState(): GameState {
    const field: (PuyoColor | null)[][] = []

    // 6x12のフィールドを生成
    for (let y = 0; y < 12; y++) {
      const row: (PuyoColor | null)[] = []
      for (let x = 0; x < 6; x++) {
        // 下の方により多くのぷよを配置（重力を考慮）
        const fillProbability = Math.max(0, (12 - y) / 12 - 0.3)
        if (Math.random() < fillProbability) {
          row.push(this.COLORS[Math.floor(Math.random() * this.COLORS.length)])
        } else {
          row.push(null)
        }
      }
      field.push(row)
    }

    // 現在のぷよペアを生成
    const currentPuyo = {
      puyo1: {
        color: this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
        x: Math.floor(Math.random() * 6),
        y: 0,
      },
      puyo2: {
        color: this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
        x: Math.floor(Math.random() * 6),
        y: 1,
      },
    }

    // 次のぷよペアを生成
    const nextPuyo = {
      puyo1: {
        color: this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
        x: 2,
        y: 0,
      },
      puyo2: {
        color: this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
        x: 2,
        y: 1,
      },
    }

    return {
      field,
      currentPuyo,
      nextPuyo,
      score: Math.floor(Math.random() * 10000),
      chainCount: Math.floor(Math.random() * 5),
      turn: Math.floor(Math.random() * 100) + 1,
    }
  }

  /**
   * ランダムなAIアクションを生成
   */
  static generateRandomAction(): AIAction {
    return {
      x: Math.floor(Math.random() * 6),
      rotation: Math.floor(Math.random() * 4),
      evaluationScore: Math.random() * 100,
      features: {
        height: Math.random() * 12,
        holes: Math.random() * 5,
        bumpiness: Math.random() * 10,
        completedLines: Math.random() * 4,
      },
    }
  }

  /**
   * ランダムな報酬を生成
   */
  static generateRandomReward(): number {
    // -1.0 から 1.0 の範囲で生成、良い手ほど高い報酬
    const baseReward = (Math.random() - 0.5) * 2

    // チェイン数に基づく報酬調整
    const chainBonus = Math.random() < 0.3 ? Math.random() * 5 : 0

    return Math.round((baseReward + chainBonus) * 100) / 100
  }

  /**
   * ランダムなメタデータを生成
   */
  static generateRandomMetadata(): TrainingMetadata {
    const gameIds = ['game-001', 'game-002', 'game-003', 'game-004', 'game-005']
    const playerIds = ['player-ai', 'player-human', 'player-test']
    const difficulties: ('easy' | 'normal' | 'hard')[] = [
      'easy',
      'normal',
      'hard',
    ]

    return {
      gameId: gameIds[Math.floor(Math.random() * gameIds.length)],
      playerId: playerIds[Math.floor(Math.random() * playerIds.length)],
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      version: '1.0.0',
    }
  }

  /**
   * 単一の学習データを生成
   */
  static generateSingleTrainingData(customTimestamp?: Date): TrainingData {
    const gameState = this.generateRandomGameState()
    const action = this.generateRandomAction()
    const reward = this.generateRandomReward()
    const metadata = this.generateRandomMetadata()

    const trainingData = createTrainingData(gameState, action, reward, metadata)

    // カスタムタイムスタンプが指定されている場合は上書き
    if (customTimestamp) {
      return {
        ...trainingData,
        timestamp: customTimestamp,
      }
    }

    return trainingData
  }

  /**
   * 複数の学習データを生成
   */
  static generateBatchTrainingData(
    count: number,
    dateRange?: { start: Date; end: Date },
  ): TrainingData[] {
    const data: TrainingData[] = []

    for (let i = 0; i < count; i++) {
      let timestamp: Date | undefined = undefined

      // 日付範囲が指定されている場合は、その範囲内でランダムな日時を生成
      if (dateRange) {
        const timeDiff = dateRange.end.getTime() - dateRange.start.getTime()
        const randomTime = dateRange.start.getTime() + Math.random() * timeDiff
        timestamp = new Date(randomTime)
      }

      data.push(this.generateSingleTrainingData(timestamp))
    }

    return data
  }

  /**
   * 特定の日付範囲の学習データを生成
   */
  static generateDataForDateRange(
    startDate: Date,
    endDate: Date,
    samplesPerDay: number = 10,
  ): TrainingData[] {
    const data: TrainingData[] = []
    const dayMillis = 24 * 60 * 60 * 1000
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / dayMillis,
    )

    for (let day = 0; day < totalDays; day++) {
      const currentDate = new Date(startDate.getTime() + day * dayMillis)
      const dayData = this.generateBatchTrainingData(samplesPerDay, {
        start: currentDate,
        end: new Date(currentDate.getTime() + dayMillis),
      })
      data.push(...dayData)
    }

    return data
  }

  /**
   * 現実的なゲーム進行を模した学習データを生成
   */
  static generateRealisticGameSequence(
    gameLength: number = 20,
  ): TrainingData[] {
    const data: TrainingData[] = []
    let currentScore = 0
    let currentChain = 0
    let turn = 1
    const gameId = `game-${Date.now()}`

    for (let i = 0; i < gameLength; i++) {
      // スコアとチェーン数を現実的に更新
      if (Math.random() < 0.2) {
        // 20%の確率でチェーン発生
        currentChain = Math.floor(Math.random() * 4) + 1
        currentScore += currentChain * currentChain * 100
      } else {
        currentChain = 0
      }

      const gameState = {
        ...this.generateRandomGameState(),
        score: currentScore,
        chainCount: currentChain,
        turn: turn++,
      }

      const action = this.generateRandomAction()

      // チェーン数に基づいて報酬を調整
      let reward = this.generateRandomReward()
      if (currentChain > 0) {
        reward += currentChain * 0.5 // チェーンボーナス
      }

      const metadata: TrainingMetadata = {
        gameId,
        playerId: 'player-ai',
        difficulty: 'normal',
        version: '1.0.0',
        strategy: 'adaptive',
      }

      data.push(createTrainingData(gameState, action, reward, metadata))

      // 少し時間を進める（1-10秒）
      const lastTimestamp = data[data.length - 1].timestamp
      data[data.length - 1] = {
        ...data[data.length - 1],
        timestamp: new Date(
          lastTimestamp.getTime() + Math.random() * 10000 + 1000,
        ),
      }
    }

    return data
  }
}
