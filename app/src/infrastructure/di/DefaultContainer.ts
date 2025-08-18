import { Container } from '../../application/di/Container'
import type { AIPort } from '../../application/ports/AIPort.ts'
import type { GamePort } from '../../application/ports/GamePort'
import type { InputPort } from '../../application/ports/InputPort'
import type { StoragePort } from '../../application/ports/StoragePort'
import type { TimerPort } from '../../application/ports/TimerPort'
import { AIService } from '../../application/services/AIService.ts'
import { GameApplicationService } from '../../application/services/GameApplicationService'
import { InputApplicationService } from '../../application/services/InputApplicationService'
import { ChainDetectionService } from '../../domain/services/ChainDetectionService'
import { CollisionService } from '../../domain/services/CollisionService'
import { PuyoSpawningService } from '../../domain/services/PuyoSpawningService'
import { BrowserTimerAdapter } from '../adapters/BrowserTimerAdapter'
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter'

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

    // ドメインサービス
    container.register<ChainDetectionService>(
      'ChainDetectionService',
      () => new ChainDetectionService(),
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

    container.register<AIPort>('AIPort', () => new AIService(), true)

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
}

export const defaultContainer = new DefaultContainerWrapper()
