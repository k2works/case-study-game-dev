import { Container } from '../../application/di/Container'
import type { AIPort } from '../../application/ports/AIPort.ts'
import type { GamePort } from '../../application/ports/GamePort'
import type { InputPort } from '../../application/ports/InputPort'
import type { PerformancePort } from '../../application/ports/PerformancePort'
import type { StoragePort } from '../../application/ports/StoragePort'
import type { StrategyPort } from '../../application/ports/StrategyPort'
import type { TimerPort } from '../../application/ports/TimerPort'
import { GameApplicationService } from '../../application/services/GameApplicationService'
import { InputApplicationService } from '../../application/services/InputApplicationService'
import { PerformanceAnalysisService } from '../../application/services/PerformanceAnalysisService'
import { MayahAIService } from '../../application/services/ai/MayahAIService'
import StrategyService from '../../application/services/ai/StrategyService'
import { BatchProcessingService } from '../../application/services/learning/BatchProcessingService'
import { DataCollectionServiceImpl } from '../../application/services/learning/DataCollectionService'
import { DataPreprocessingService } from '../../application/services/learning/DataPreprocessingService'
import { LearningService } from '../../application/services/learning/LearningService'
import * as ChainDetectionService from '../../domain/services/ChainDetectionService'
import { PuyoSpawningService } from '../../domain/services/PuyoSpawningService'
import { FeatureEngineeringService } from '../../domain/services/learning/FeatureEngineeringService'
import { BrowserTimerAdapter } from '../adapters/BrowserTimerAdapter'
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter'
import { PerformanceAdapter } from '../adapters/PerformanceAdapter'
import { StrategyAdapter } from '../adapters/StrategyAdapter'
import { IndexedDBTrainingDataRepository } from '../adapters/learning/IndexedDBRepository'

/**
 * デフォルトの依存性注入コンテナ設定
 * インフラストラクチャ層で具象実装を管理
 */
export class DefaultContainer {
  /**
   * デフォルトのコンテナ設定を作成
   * @returns 設定済みのContainer
   */
  static create(): Container {
    const container = new Container()

    // インフラストラクチャ層のアダプター
    container.register<StoragePort>(
      'StoragePort',
      () => new LocalStorageAdapter(),
      true, // シングルトン
    )

    container.register<TimerPort>(
      'TimerPort',
      () => new BrowserTimerAdapter(),
      true, // シングルトン
    )

    // ドメインサービス（関数型API）
    container.register<typeof ChainDetectionService>(
      'ChainDetectionService',
      () => ChainDetectionService,
      true,
    )

    container.register<PuyoSpawningService>(
      'PuyoSpawningService',
      () => new PuyoSpawningService(),
      true,
    )

    // アプリケーションサービス
    container.register<GamePort>(
      'GamePort',
      () =>
        new GameApplicationService(
          container.resolve<StoragePort>('StoragePort'),
          container.resolve<TimerPort>('TimerPort'),
        ),
      true,
    )

    container.register<InputPort>(
      'InputPort',
      () => new InputApplicationService(),
      true,
    )

    // AI Service: MayahAIService（mayah型評価システム Phase 4a-4c）を使用
    container.register<AIPort>('AIPort', () => new MayahAIService(), true)

    // パフォーマンス分析
    container.register<PerformancePort>(
      'PerformancePort',
      () => new PerformanceAdapter(),
      true,
    )

    container.register<PerformanceAnalysisService>(
      'PerformanceAnalysisService',
      () =>
        new PerformanceAnalysisService(
          container.resolve<PerformancePort>('PerformancePort'),
        ),
      true,
    )

    // 戦略設定システム
    container.register<StrategyPort>(
      'StrategyPort',
      () => new StrategyAdapter(container.resolve<StoragePort>('StoragePort')),
      true,
    )

    container.register<StrategyService>(
      'StrategyService',
      () =>
        new StrategyService(container.resolve<StrategyPort>('StrategyPort')),
      true,
    )

    // 学習システム
    container.register<IndexedDBTrainingDataRepository>(
      'IndexedDBRepository',
      () => new IndexedDBTrainingDataRepository(),
      true,
    )

    container.register<DataCollectionServiceImpl>(
      'DataCollectionService',
      () =>
        new DataCollectionServiceImpl(
          container.resolve<IndexedDBTrainingDataRepository>(
            'IndexedDBRepository',
          ),
        ),
      true,
    )

    container.register<FeatureEngineeringService>(
      'FeatureEngineeringService',
      () => new FeatureEngineeringService(),
      true,
    )

    container.register<DataPreprocessingService>(
      'DataPreprocessingService',
      () =>
        new DataPreprocessingService(
          container.resolve<FeatureEngineeringService>(
            'FeatureEngineeringService',
          ),
        ),
      true,
    )

    container.register<BatchProcessingService>(
      'BatchProcessingService',
      () =>
        new BatchProcessingService(
          container.resolve<DataCollectionServiceImpl>('DataCollectionService'),
          container.resolve<DataPreprocessingService>(
            'DataPreprocessingService',
          ),
        ),
      true,
    )

    container.register<LearningService>(
      'LearningService',
      () =>
        new LearningService(
          container.resolve<DataCollectionServiceImpl>('DataCollectionService'),
          container.resolve<BatchProcessingService>('BatchProcessingService'),
        ),
      true,
    )

    return container
  }
}

/**
 * グローバルコンテナインスタンス
 * アプリケーション全体で共有される依存性注入コンテナ
 */
class DefaultContainerWrapper {
  private container: Container

  constructor() {
    this.container = DefaultContainer.create()
  }

  getGameService(): GamePort {
    return this.container.resolve<GamePort>('GamePort')
  }

  getInputService(): InputPort {
    return this.container.resolve<InputPort>('InputPort')
  }

  getAIService(): AIPort {
    return this.container.resolve<AIPort>('AIPort')
  }

  getPerformanceAnalysisService(): PerformanceAnalysisService {
    return this.container.resolve<PerformanceAnalysisService>(
      'PerformanceAnalysisService',
    )
  }

  getStrategyService(): StrategyService {
    return this.container.resolve<StrategyService>('StrategyService')
  }

  getLearningService(): LearningService {
    return this.container.resolve<LearningService>('LearningService')
  }

  getDataCollectionService(): DataCollectionServiceImpl {
    return this.container.resolve<DataCollectionServiceImpl>(
      'DataCollectionService',
    )
  }
}

export const defaultContainer = new DefaultContainerWrapper()
