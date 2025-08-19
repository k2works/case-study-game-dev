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
import StrategyService from '../../application/services/StrategyService'
import { MLAIService } from '../../application/services/ai/MLAIService'
import * as ChainDetectionService from '../../domain/services/ChainDetectionService'
import { CollisionService } from '../../domain/services/CollisionService'
import { PuyoSpawningService } from '../../domain/services/PuyoSpawningService'
import { BrowserTimerAdapter } from '../adapters/BrowserTimerAdapter'
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter'
import { PerformanceAdapter } from '../adapters/PerformanceAdapter'
import { StrategyAdapter } from '../adapters/StrategyAdapter'

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

    container.register<CollisionService>(
      'CollisionService',
      () => new CollisionService(),
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

    // AI Service: MLAIService（戦略統合 + TensorFlow.js）を使用
    container.register<AIPort>(
      'AIPort',
      () => new MLAIService(container.resolve<StrategyPort>('StrategyPort')),
      true,
    )

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
}

export const defaultContainer = new DefaultContainerWrapper()
