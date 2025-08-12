import { container } from '../infrastructure/di/Container'
import {
  GAME_USE_CASE,
  SOUND_EFFECT_SERVICE,
  BACKGROUND_MUSIC_SERVICE,
  HIGH_SCORE_SERVICE,
  GAME_SETTINGS_SERVICE,
} from '../infrastructure/di/tokens'
import { GameUseCase } from './GameUseCase'
import { soundEffect } from '../services/SoundEffect'
import { backgroundMusic } from '../services/BackgroundMusic'
import { highScoreService } from '../services/HighScoreService'
import { gameSettingsService } from '../services/GameSettingsService'

/**
 * アプリケーション層でのDI設定
 * Clean Architectureに準拠し、上位層が下位層への依存を設定
 */
export class DIConfiguration {
  /**
   * DIコンテナにサービスを登録
   */
  public static setupContainer(): void {
    // アプリケーション層のサービス
    container.registerFactory(GAME_USE_CASE, () => new GameUseCase())

    // サービス層のサービス（シングルトン）
    container.registerSingleton(SOUND_EFFECT_SERVICE, soundEffect)
    container.registerSingleton(BACKGROUND_MUSIC_SERVICE, backgroundMusic)
    container.registerSingleton(HIGH_SCORE_SERVICE, highScoreService)
    container.registerSingleton(GAME_SETTINGS_SERVICE, gameSettingsService)
  }

  /**
   * アプリケーション初期化
   */
  public static initializeApplication(): void {
    this.setupContainer()
  }
}
