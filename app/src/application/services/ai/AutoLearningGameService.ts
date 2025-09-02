/**
 * 完全なAI自動学習システム
 * ゲーム実行とTensorFlow.js学習を統合した自動学習サービス
 */
import type { PuyoColor } from '../../../domain/models/Puyo'
import type { AIGameState, AIMove } from '../../../domain/models/ai/index'
import { TensorFlowTrainer } from '../../../domain/services/learning/TensorFlowTrainer'
import type { AIPort } from '../../ports/AIPort'
import type { GameAction, GamePort } from '../../ports/GamePort'
import type { BatchProcessingService } from '../learning/BatchProcessingService'
import type { DataCollectionService } from '../learning/DataCollectionService'

/**
 * 自動学習ゲーム設定
 */
export interface AutoLearningGameConfig {
  // ゲーム実行設定
  gamesPerSession: number // セッションあたりのゲーム数
  maxGameDuration: number // 最大ゲーム時間（秒）
  thinkingSpeed: number // AI思考速度（ミリ秒）

  // 学習データ収集設定
  collectTrainingData: boolean // 学習データ収集の有効化
  minTrainingDataSize: number // 学習開始に必要な最小データサイズ

  // TensorFlow学習設定
  modelArchitecture: 'dense' | 'cnn'
  epochs: number
  batchSize: number
  learningRate: number
  validationSplit: number

  // 自動実行制御
  pauseBetweenGames: number // ゲーム間の休憩時間（秒）
  learningInterval: number // 学習実行間隔（ミリ秒）
  performanceThreshold: number // モデル更新の閾値
  autoRestart: boolean // 自動再開
  maxConcurrentGames: number // 最大同時実行ゲーム数
}

/**
 * 学習プロセス状態
 */
export interface LearningGameProcess {
  id: string
  status:
    | 'idle'
    | 'playing'
    | 'collecting'
    | 'training'
    | 'evaluating'
    | 'completed'
    | 'error'
  progress: number
  startTime: Date
  endTime?: Date

  // ゲーム実行状況
  currentGame: number
  totalGames: number
  gameStats: {
    completedGames: number
    averageScore: number
    bestScore: number
    averageChainLength: number
    collectedDataPoints: number
    successRate: number
  }

  // 学習状況
  modelId?: string
  learningStats?: {
    accuracy: number
    loss: number
    trainingDataSize: number
  }

  currentGameState?: AIGameState
  lastMove?: AIMove
  error?: string
}

/**
 * ゲーム実行結果
 */
export interface GameResult {
  gameId: string
  score: number
  moves: number
  maxChainLength: number
  duration: number
  completed: boolean
  dataPoints: number
}

/**
 * ゲーム移動結果
 */
export interface MoveResult {
  score: number
  chainLength: number
  gameOver: boolean
  fieldFull: boolean
}

/**
 * ゲームコンテキスト
 */
interface GameContext {
  totalMoves: number
  totalScore: number
  maxChainLength: number
  gameCompleted: boolean
  gameData: Array<{ state: AIGameState; move: AIMove; result: MoveResult }>
}

/**
 * 完全なAI自動学習システム
 */
export class AutoLearningGameService {
  private gameService: GamePort
  private aiService: AIPort
  private dataCollectionService: DataCollectionService
  private batchProcessingService: BatchProcessingService
  private tensorFlowTrainer: TensorFlowTrainer
  private config: AutoLearningGameConfig

  private isRunning = false
  private currentProcess: LearningGameProcess | null = null
  private processHistory: LearningGameProcess[] = []

  // ゲーム実行制御
  private gameLoopInterval: NodeJS.Timeout | null = null
  private learningInterval: NodeJS.Timeout | null = null

  constructor(
    gameService: GamePort,
    aiService: AIPort,
    dataCollectionService: DataCollectionService,
    batchProcessingService: BatchProcessingService,
    config: AutoLearningGameConfig,
  ) {
    this.gameService = gameService
    this.aiService = aiService
    this.dataCollectionService = dataCollectionService
    this.batchProcessingService = batchProcessingService
    this.tensorFlowTrainer = new TensorFlowTrainer()
    this.config = config
  }

  /**
   * 自動学習システムを開始
   */
  async startAutoLearningGame(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Auto learning game is already running')
    }

    console.log('🚀 Starting Complete AI Auto Learning System...')
    this.isRunning = true

    const processId = `auto-learning-${Date.now()}`
    this.currentProcess = {
      id: processId,
      status: 'idle',
      currentGame: 0,
      totalGames: this.config.gamesPerSession,
      progress: 0,
      startTime: new Date(),
      gameStats: {
        completedGames: 0,
        averageScore: 0,
        bestScore: 0,
        averageChainLength: 0,
        collectedDataPoints: 0,
        successRate: 0,
      },
    }

    try {
      // 実際の学習サイクル実行
      await this.runRealLearningCycle()
    } catch (error) {
      console.error('❌ Auto learning game session failed:', error)
      if (this.currentProcess) {
        this.currentProcess.status = 'error'
        this.currentProcess.error = (error as Error).message
        this.currentProcess.endTime = new Date()
      }
    }
  }

  /**
   * 自動学習システムを停止
   */
  stopAutoLearningGame(): void {
    console.log('⏹️ Stopping Complete AI Auto Learning System...')
    this.isRunning = false

    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval)
      this.gameLoopInterval = null
    }

    if (this.learningInterval) {
      clearInterval(this.learningInterval)
      this.learningInterval = null
    }

    if (this.currentProcess) {
      this.currentProcess.status = 'completed'
      this.currentProcess.endTime = new Date()
      this.processHistory.push({ ...this.currentProcess })
    }
  }

  /**
   * 実際の学習サイクル
   */
  private async runRealLearningCycle(): Promise<void> {
    if (!this.currentProcess) return

    console.log('🎮 Starting real game learning cycle...')
    console.debug('Services initialized:', {
      gameService: !!this.gameService,
      aiService: !!this.aiService,
      dataCollectionService: !!this.dataCollectionService,
      batchProcessingService: !!this.batchProcessingService,
      tensorFlowTrainer: !!this.tensorFlowTrainer,
    })

    try {
      // AIサービスを有効化
      console.log('🤖 Enabling AI service...')
      this.aiService.setEnabled(true)
      // 実際のゲーム実行
      this.currentProcess.status = 'playing'
      console.log(`🎯 Playing ${this.config.gamesPerSession} games...`)

      for (let i = 0; i < this.config.gamesPerSession; i++) {
        if (!this.isRunning) break

        this.currentProcess.currentGame = i + 1
        this.currentProcess.progress =
          ((i + 1) / this.config.gamesPerSession) * 60

        console.log(`🎮 Playing game ${i + 1}/${this.config.gamesPerSession}`)

        // 実際のゲームを実行
        const gameResult = await this.runSingleGame()

        // ゲーム統計を更新
        this.updateGameStats(gameResult, i + 1)

        // ゲーム間の休憩
        await this.sleep(this.config.pauseBetweenGames * 1000)
      }

      // データ収集フェーズ
      this.currentProcess.status = 'collecting'
      this.currentProcess.progress = 70
      console.log('📊 Collecting training data...')

      // 収集されたデータ量を確認
      const collectedDataSize =
        this.currentProcess.gameStats.collectedDataPoints
      console.log(`📈 Collected ${collectedDataSize} data points`)

      // 十分なデータがある場合のみ学習実行
      if (collectedDataSize >= this.config.minTrainingDataSize) {
        this.currentProcess.status = 'training'
        this.currentProcess.progress = 80
        console.log('🧠 Training neural network...')

        const learningResult =
          await this.trainWithCollectedData(collectedDataSize)

        this.currentProcess.learningStats = learningResult
        this.currentProcess.modelId = `mayah-ai-${Date.now()}`
      } else {
        console.log(
          `⚠️ Not enough data for training (${collectedDataSize}/${this.config.minTrainingDataSize})`,
        )
        this.currentProcess.learningStats = {
          accuracy: 0,
          loss: 0,
          trainingDataSize: collectedDataSize,
        }
      }

      // モデル評価
      this.currentProcess.status = 'evaluating'
      this.currentProcess.progress = 90
      console.log('🔍 Evaluating model performance...')
      await this.sleep(1000) // 評価時間をシミュレート

      this.currentProcess.status = 'completed'
      this.currentProcess.progress = 100
      this.currentProcess.endTime = new Date()

      this.processHistory.push({ ...this.currentProcess })
      console.log('✅ Real auto learning cycle completed!')
    } catch (error) {
      console.error('❌ Learning cycle failed:', error)
      if (this.currentProcess) {
        this.currentProcess.status = 'error'
        this.currentProcess.error = (error as Error).message
        this.currentProcess.endTime = new Date()
        this.processHistory.push({ ...this.currentProcess })
      }
      throw error
    }
  }

  /**
   * 単一ゲーム実行
   */
  private async runSingleGame(): Promise<GameResult> {
    try {
      console.log('🎮 Initializing new game...')
      const gameId = `game-${Date.now()}`

      // ゲーム状態の初期化
      const currentGameState = this.gameService.startNewGame()

      const gameContext = {
        totalMoves: 0,
        totalScore: 0,
        maxChainLength: 0,
        gameCompleted: false,
        gameData: [] as Array<{
          state: AIGameState
          move: AIMove
          result: MoveResult
        }>,
      }

      const startTime = Date.now()
      const maxGameTime = this.config.maxGameDuration * 1000

      console.log('🕹️ Starting game execution...')

      const finalGameState = await this.executeGameLoop(
        currentGameState,
        gameContext,
        startTime,
        maxGameTime,
      )

      // ゲーム終了後、最終スコアでコンテキストを更新
      const finalVm = finalGameState as { score?: { current: number } }
      gameContext.totalScore = finalVm.score?.current || 0

      const gameDuration = Date.now() - startTime
      console.log(
        `✅ Game completed in ${gameDuration}ms with ${gameContext.totalMoves} moves, final score: ${gameContext.totalScore}`,
      )

      // 学習データを保存
      if (this.config.collectTrainingData && gameContext.gameData.length > 0) {
        await this.saveTrainingData(gameContext.gameData, gameId)
      }

      console.log(
        `🎮 Game completed with final score: ${gameContext.totalScore}, moves: ${gameContext.totalMoves}`,
      )

      return {
        gameId,
        score: gameContext.totalScore, // ゲーム全体の最終スコアを返す
        moves: gameContext.totalMoves,
        maxChainLength: gameContext.maxChainLength,
        duration: gameDuration,
        completed: gameContext.gameCompleted,
        dataPoints: gameContext.gameData.length,
      }
    } catch (error) {
      console.error('❌ Failed to run single game:', error)
      throw error
    }
  }

  /**
   * ゲームループの実行
   */
  private async executeGameLoop(
    currentGameState: unknown,
    gameContext: GameContext,
    startTime: number,
    maxGameTime: number,
  ): Promise<unknown> {
    while (!gameContext.gameCompleted && Date.now() - startTime < maxGameTime) {
      if (!this.isRunning) break

      currentGameState = await this.executeAIMove(currentGameState, gameContext)

      // AI思考速度に合わせて待機
      await this.sleep(this.config.thinkingSpeed)
    }

    return currentGameState
  }

  /**
   * AI手の実行
   */
  private async executeAIMove(
    currentGameState: unknown,
    gameContext: GameContext,
  ): Promise<unknown> {
    // 現在のゲーム状態をAIGameState形式に変換
    const aiGameState = this.convertToAIGameState(currentGameState)

    // プロセス状態更新
    this.updateCurrentProcessState(aiGameState)

    // AIが次の手を決定
    const aiMove = await this.aiService.decideMove(aiGameState)
    console.log(`🤖 AI decided move:`, aiMove)

    // 手を実行
    const { updatedGameState, moveResult } = await this.applyAIMove(
      currentGameState,
      aiMove,
    )

    // データ記録
    gameContext.gameData.push({
      state: aiGameState,
      move: aiMove,
      result: moveResult,
    })

    // 統計更新
    this.updateGameContext(gameContext, moveResult)

    return updatedGameState
  }

  /**
   * プロセス状態更新
   */
  private updateCurrentProcessState(aiGameState: AIGameState): void {
    if (this.currentProcess) {
      this.currentProcess.currentGameState = aiGameState
    }
  }

  /**
   * AI手を適用
   */
  // eslint-disable-next-line complexity
  private async applyAIMove(
    currentGameState: unknown,
    aiMove: AIMove,
  ): Promise<{ updatedGameState: unknown; moveResult: MoveResult }> {
    // 現在のプロセスの最後の手を更新
    if (this.currentProcess) {
      this.currentProcess.lastMove = aiMove
    }

    // AIの手をGameActionに変換して適用
    const gameActions = this.convertAIMoveToGameActions(aiMove)
    let moveScore = 0
    let moveChainLength = 0
    let updatedState = currentGameState

    // 一連のアクションを実行
    for (const action of gameActions) {
      const vm = updatedState as { score?: { current: number } }
      const previousScore = vm.score?.current || 0
      console.log(
        `🕹️ Applying action ${action} - Previous score: ${previousScore}`,
      )

      updatedState = this.gameService.updateGameState(
        updatedState as never,
        action,
      )

      // スコア差分を計算
      const updatedVm = updatedState as {
        score?: { current: number }
        lastChain?: number
      }
      const currentScore = updatedVm.score?.current || 0
      const scoreDelta = currentScore - previousScore
      moveScore += scoreDelta

      console.log(
        `🕹️ Action result - Current score: ${currentScore}, Score delta: ${scoreDelta}`,
      )

      // チェーン数を記録
      if ((updatedVm.lastChain || 0) > moveChainLength) {
        moveChainLength = updatedVm.lastChain || 0
      }

      // 自動落下処理
      updatedState = this.gameService.processAutoFall(updatedState as never)

      // 自動落下後のスコア確認
      const afterAutoFall = updatedState as { score?: { current: number } }
      console.log(
        `🕹️ After auto-fall - Score: ${afterAutoFall.score?.current || 0}`,
      )

      // 短時間待機（アニメーション的な効果）
      await this.sleep(10)
    }

    // 新しいぷよペアを生成（ゲームが継続可能な場合）
    const finalVm = updatedState as { state?: string }
    if (finalVm.state !== 'gameOver') {
      updatedState = this.gameService.spawnNewPuyoPair(updatedState as never)
    }

    const moveResult: MoveResult = {
      score: moveScore,
      chainLength: moveChainLength,
      gameOver: (updatedState as { state?: string }).state === 'gameOver',
      fieldFull: this.isFieldFull(updatedState),
    }

    return { updatedGameState: updatedState, moveResult }
  }

  /**
   * ゲームコンテキスト更新
   */
  private updateGameContext(
    gameContext: GameContext,
    moveResult: MoveResult,
  ): void {
    gameContext.totalMoves++
    gameContext.totalScore += moveResult.score || 0
    gameContext.maxChainLength = Math.max(
      gameContext.maxChainLength,
      moveResult.chainLength || 0,
    )

    // ゲーム終了判定
    if (moveResult.gameOver || moveResult.fieldFull) {
      gameContext.gameCompleted = true
      console.log(
        '🏁 Game completed:',
        moveResult.gameOver ? 'Game Over' : 'Field Full',
      )
    }
  }

  /**
   * ゲーム状態をAIGameState形式に変換
   */
  // eslint-disable-next-line complexity
  private convertToAIGameState(gameViewModel: unknown): AIGameState {
    // GameViewModelをAIGameState形式に変換
    const vm = gameViewModel as {
      field?: { cells?: unknown[][] }
      currentPuyoPair?: { main: { color: number }; sub: { color: number } }
      nextPuyoPair?: { main: { color: number }; sub: { color: number } }
      score?:
        | number
        | {
            current: number
            high: number
            display: number
            chainBonus: number
            colorBonus: number
          }
      lastChain?: number
      state?: string
    }

    // currentPuyoPairが存在しない場合はデフォルト値を設定
    const currentPuyoPair = vm.currentPuyoPair || {
      main: { color: 1 }, // デフォルト: 赤
      sub: { color: 2 }, // デフォルト: 青
    }

    const nextPuyoPair = vm.nextPuyoPair || {
      main: { color: 3 }, // デフォルト: 緑
      sub: { color: 4 }, // デフォルト: 黄
    }

    return {
      field: {
        width: 6,
        height: 13,
        cells:
          vm.field?.cells ||
          Array(13)
            .fill(null)
            .map(() => Array(6).fill(null)),
      },
      currentPuyoPair: {
        primaryColor: this.convertNumberToPuyoColor(currentPuyoPair.main.color),
        secondaryColor: this.convertNumberToPuyoColor(
          currentPuyoPair.sub.color,
        ),
        x: 2,
        y: 0,
        rotation: 0,
      },
      nextPuyoPair: {
        primaryColor: this.convertNumberToPuyoColor(nextPuyoPair.main.color),
        secondaryColor: this.convertNumberToPuyoColor(nextPuyoPair.sub.color),
        x: 2,
        y: 0,
        rotation: 0,
      },
      score:
        typeof vm.score === 'object' &&
        vm.score !== null &&
        'current' in vm.score
          ? (vm.score as { current: number }).current
          : typeof vm.score === 'number'
            ? vm.score
            : 0,
      chainCount: vm.lastChain || 0,
      turn: 0,
      isGameOver: vm.state === 'gameOver' || false,
    }
  }

  /**
   * AIMoveをGameActionの配列に変換
   */
  private convertAIMoveToGameActions(aiMove: AIMove): GameAction[] {
    const actions: GameAction[] = []

    // 位置への移動（x座標）
    const currentX = 2 // 通常は中央からスタート
    const targetX = aiMove.x

    if (targetX < currentX) {
      // 左に移動
      for (let i = 0; i < currentX - targetX; i++) {
        actions.push({ type: 'MOVE_LEFT' })
      }
    } else if (targetX > currentX) {
      // 右に移動
      for (let i = 0; i < targetX - currentX; i++) {
        actions.push({ type: 'MOVE_RIGHT' })
      }
    }

    // 回転
    for (let i = 0; i < aiMove.rotation; i++) {
      actions.push({ type: 'ROTATE_CLOCKWISE' })
    }

    // ハードドロップ
    actions.push({ type: 'HARD_DROP' })

    return actions
  }

  /**
   * フィールドが満杯かどうかを判定
   */
  private isFieldFull(gameViewModel: unknown): boolean {
    const vm = gameViewModel as { fieldViewModel?: { cells?: unknown[][] } }
    const field = vm.fieldViewModel?.cells
    if (!field || !Array.isArray(field)) return false

    // 上端行（y=0）にぷよがあるかチェック
    return field.some(
      (row: unknown[], y: number) =>
        y === 0 &&
        Array.isArray(row) &&
        row.some((cell) => {
          const cellObj = cell as { color?: number }
          return cellObj && cellObj.color !== 0
        }),
    )
  }

  /**
   * 学習データを保存
   */
  private async saveTrainingData(
    gameData: Array<{ state: AIGameState; move: AIMove; result: MoveResult }>,
    gameId: string,
  ): Promise<void> {
    try {
      console.log(
        `💾 Saving ${gameData.length} training data points for game ${gameId}`,
      )

      for (const data of gameData) {
        // AIGameStateをGameStateに変換
        const gameState = this.convertAIGameStateToGameState(data.state)

        await this.dataCollectionService.collectTrainingData(
          gameState as never,
          {
            x: data.move.x,
            rotation: data.move.rotation,
            evaluationScore: data.move.score,
            features: {
              field_height: this.calculateFieldHeight(data.state.field),
              chain_potential: this.calculateChainPotential(data.state.field),
              position_x: data.move.x,
              rotation: data.move.rotation,
            },
          },
          this.calculateReward(data.result),
          {
            gameId,
            playerId: 'auto-ai',
            difficulty: 'normal',
            version: 'mayah-ai-v1',
          },
        )
      }

      console.log('✅ Training data saved successfully')
    } catch (error) {
      console.error('❌ Failed to save training data:', error)
      // データ保存失敗はゲーム実行を止めないように警告のみ
    }
  }

  /**
   * 報酬計算
   */
  private calculateReward(result: MoveResult): number {
    let reward = 0

    // スコアによる報酬
    reward += (result.score || 0) / 1000

    // チェーンによる報酬
    reward += Math.pow(result.chainLength || 0, 2) * 10

    // ゲームオーバーペナルティ
    if (result.gameOver) {
      reward -= 100
    }

    return reward
  }

  /**
   * ゲーム結果の統計更新
   */
  private updateGameStats(gameResult: GameResult, gameNumber: number): void {
    if (!this.currentProcess) return

    const stats = this.currentProcess.gameStats
    stats.completedGames = gameNumber

    // 平均スコア更新
    stats.averageScore =
      (stats.averageScore * (gameNumber - 1) + gameResult.score) / gameNumber

    // 最高スコア更新
    if (gameResult.score > stats.bestScore) {
      stats.bestScore = gameResult.score
    }

    // 平均チェーン長更新
    stats.averageChainLength =
      (stats.averageChainLength * (gameNumber - 1) +
        gameResult.maxChainLength) /
      gameNumber

    // 収集データポイント累計
    stats.collectedDataPoints += gameResult.dataPoints

    // 成功率計算（完了したゲームの割合）
    stats.successRate = gameResult.completed
      ? (stats.successRate * (gameNumber - 1) + 1) / gameNumber
      : (stats.successRate * (gameNumber - 1)) / gameNumber

    console.log(`📊 Game ${gameNumber} stats updated:`, {
      score: gameResult.score,
      avgScore: stats.averageScore.toFixed(0),
      bestScore: stats.bestScore,
      dataPoints: gameResult.dataPoints,
      totalDataPoints: stats.collectedDataPoints,
    })
  }

  /**
   * 収集されたデータで学習実行
   */
  private async trainWithCollectedData(
    dataSize: number,
  ): Promise<{ accuracy: number; loss: number; trainingDataSize: number }> {
    try {
      console.log(`🧠 Starting training with ${dataSize} data points`)

      // データサイズの事前チェック
      const dataSizeResult = this.validateDataSize(dataSize)
      if (dataSizeResult) return dataSizeResult

      // データの準備と検証
      const processedDataset = await this.prepareTrainingDataset(dataSize)
      if (!processedDataset) {
        return { accuracy: 0, loss: 0, trainingDataSize: 0 }
      }

      // 実際の学習実行
      return await this.executeTensorFlowTraining(processedDataset, dataSize)
    } catch (error) {
      console.error('❌ Training failed:', error)
      return {
        accuracy: 0,
        loss: Number.MAX_SAFE_INTEGER,
        trainingDataSize: dataSize,
      }
    }
  }

  /**
   * データサイズの妥当性をチェック
   */
  private validateDataSize(
    dataSize: number,
  ): { accuracy: number; loss: number; trainingDataSize: number } | null {
    if (dataSize < this.config.minTrainingDataSize) {
      console.log(
        `📊 Insufficient data for training: ${dataSize} < ${this.config.minTrainingDataSize} (minimum required)`,
      )
      return {
        accuracy: 0,
        loss: 0,
        trainingDataSize: dataSize,
      }
    }
    return null
  }

  /**
   * 学習用データセットを準備・検証
   */
  private async prepareTrainingDataset(
    dataSize: number,
  ): Promise<{ features: number[][]; rewards: number[] } | null> {
    const batchResult =
      await this.batchProcessingService.processDataFromDateRange(
        new Date(Date.now() - 24 * 60 * 60 * 1000), // 過去24時間
        new Date(),
        {
          batchSize: this.config.batchSize,
          validationSplit: this.config.validationSplit,
          shuffle: true,
          normalizeRewards: true,
          maxSamples: Math.min(dataSize, this.config.batchSize),
        },
      )

    const processedDataset = batchResult.processedDataset as unknown as {
      features: number[][]
      rewards: number[]
    }

    // データの存在チェック
    if (
      !processedDataset.features ||
      !processedDataset.rewards ||
      processedDataset.features.length === 0 ||
      processedDataset.rewards.length === 0
    ) {
      console.log(
        '📊 No processed training data available - this is normal for the first few games',
      )
      return null
    }

    // データ整合性の確認
    if (processedDataset.features.length !== processedDataset.rewards.length) {
      console.warn(
        '⚠️ Features and rewards data length mismatch:',
        processedDataset.features.length,
        'vs',
        processedDataset.rewards.length,
      )
      return null
    }

    console.log(
      `✅ Training data validation passed: ${processedDataset.features.length} samples ready for training`,
    )
    return processedDataset
  }

  /**
   * TensorFlow.js学習を実行
   */
  private async executeTensorFlowTraining(
    processedDataset: { features: number[][]; rewards: number[] },
    dataSize: number,
  ): Promise<{ accuracy: number; loss: number; trainingDataSize: number }> {
    // TensorFlow.jsモデルを作成
    const model = this.tensorFlowTrainer.createModel({
      type: this.config.modelArchitecture,
      inputShape: [processedDataset.features[0].length],
      layers: [
        { type: 'dense', units: 128, activation: 'relu' },
        { type: 'dropout', rate: 0.3 },
        { type: 'dense', units: 64, activation: 'relu' },
        { type: 'dense', units: 1, activation: 'linear' },
      ],
    })

    // 学習データを分割
    const trainSize = Math.floor(
      processedDataset.features.length * (1 - this.config.validationSplit),
    )
    const trainData = {
      features: processedDataset.features.slice(0, trainSize),
      rewards: processedDataset.rewards.slice(0, trainSize),
    }
    const validationData = {
      features: processedDataset.features.slice(trainSize),
      rewards: processedDataset.rewards.slice(trainSize),
    }

    // TensorFlow.jsモデルの学習実行
    const trainingResult = await this.tensorFlowTrainer.trainModel(
      model,
      trainData,
      validationData,
      {
        epochs: this.config.epochs,
        batchSize: this.config.batchSize,
        validationSplit: this.config.validationSplit,
        learningRate: this.config.learningRate,
        verbose: 0,
      },
    )

    console.log('✅ Training completed:', trainingResult)

    return {
      accuracy: trainingResult.validationAccuracy,
      loss: trainingResult.validationLoss,
      trainingDataSize: dataSize,
    }
  }

  /**
   * 数値をPuyoColor文字列に変換
   */
  private convertNumberToPuyoColor(colorNum: number): PuyoColor {
    const colorMap: { [key: number]: PuyoColor } = {
      0: null,
      1: 'red',
      2: 'blue',
      3: 'green',
      4: 'yellow',
      5: 'purple',
    }
    return colorMap[colorNum] || 'red'
  }

  /**
   * AIGameStateをGameStateに変換
   */
  private convertAIGameStateToGameState(aiState: AIGameState): unknown {
    return {
      field: aiState.field.cells,
      currentPuyo: aiState.currentPuyoPair
        ? {
            puyo1: {
              color: aiState.currentPuyoPair.primaryColor,
              x: aiState.currentPuyoPair.x,
              y: aiState.currentPuyoPair.y,
            },
            puyo2: {
              color: aiState.currentPuyoPair.secondaryColor,
              x: aiState.currentPuyoPair.x,
              y: aiState.currentPuyoPair.y + 1,
            },
          }
        : {
            puyo1: { color: 'red', x: 0, y: 0 },
            puyo2: { color: 'red', x: 0, y: 1 },
          },
      nextPuyo: aiState.nextPuyoPair
        ? {
            puyo1: {
              color: aiState.nextPuyoPair.primaryColor,
              x: aiState.nextPuyoPair.x,
              y: aiState.nextPuyoPair.y,
            },
            puyo2: {
              color: aiState.nextPuyoPair.secondaryColor,
              x: aiState.nextPuyoPair.x,
              y: aiState.nextPuyoPair.y + 1,
            },
          }
        : {
            puyo1: { color: 'red', x: 0, y: 0 },
            puyo2: { color: 'red', x: 0, y: 1 },
          },
      score: aiState.score,
      chainCount: aiState.chainCount,
      turn: aiState.turn,
    }
  }

  /**
   * フィールドの高さを計算
   */
  // eslint-disable-next-line complexity
  private calculateFieldHeight(field: unknown): number {
    const f = field as { cells?: unknown[][]; width?: number; height?: number }
    if (!f.cells || !Array.isArray(f.cells)) return 0

    let maxHeight = 0
    for (let x = 0; x < (f.width || 6); x++) {
      let height = 0
      for (let y = 0; y < (f.height || 13); y++) {
        if (
          f.cells[y] &&
          (f.cells[y] as unknown[])[x] &&
          (f.cells[y] as unknown[])[x] !== null
        ) {
          height = (f.height || 13) - y
          break
        }
      }
      maxHeight = Math.max(maxHeight, height)
    }
    return maxHeight
  }

  /**
   * 連鎖可能性を計算
   */
  // eslint-disable-next-line complexity
  private calculateChainPotential(field: unknown): number {
    const f = field as { cells?: unknown[][]; width?: number; height?: number }
    // 簡単な連鎖可能性の計算（隣接する同色ぷよの数）
    if (!f.cells || !Array.isArray(f.cells)) return 0

    let potential = 0
    for (let y = 0; y < (f.height || 13) - 1; y++) {
      for (let x = 0; x < (f.width || 6) - 1; x++) {
        const current = (f.cells[y] as unknown[])?.[x]
        if (current && current !== null) {
          const right = (f.cells[y] as unknown[])?.[x + 1]
          const down = (f.cells[y + 1] as unknown[])?.[x]

          if (right === current) potential++
          if (down === current) potential++
        }
      }
    }
    return potential
  }

  /**
   * 待機
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 現在のプロセス取得
   */
  getCurrentProcess(): LearningGameProcess | null {
    return this.currentProcess
  }

  /**
   * プロセス履歴取得
   */
  getProcessHistory(): readonly LearningGameProcess[] {
    return Object.freeze([...this.processHistory])
  }

  /**
   * 設定更新
   */
  updateConfig(newConfig: Partial<AutoLearningGameConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 実行中かどうか
   */
  isAutoLearningGameRunning(): boolean {
    return this.isRunning
  }
}

/**
 * デフォルト設定
 */
export const DEFAULT_AUTO_LEARNING_GAME_CONFIG: AutoLearningGameConfig = {
  // ゲーム実行設定
  gamesPerSession: 10,
  maxGameDuration: 300,
  thinkingSpeed: 100,

  // 学習データ収集設定
  collectTrainingData: true,
  minTrainingDataSize: 100,

  // TensorFlow学習設定
  modelArchitecture: 'dense',
  epochs: 20,
  batchSize: 32,
  learningRate: 0.001,
  validationSplit: 0.2,

  // 自動実行制御
  pauseBetweenGames: 1,
  learningInterval: 30 * 60 * 1000, // 30分間隔
  performanceThreshold: 0.7,
  autoRestart: false,
  maxConcurrentGames: 1,
}
