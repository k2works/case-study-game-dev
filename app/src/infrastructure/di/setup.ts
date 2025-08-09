import { container } from './Container'
import {
  GAME_USE_CASE,
  SOUND_EFFECT_SERVICE,
  BACKGROUND_MUSIC_SERVICE,
  HIGH_SCORE_SERVICE,
  GAME_SETTINGS_SERVICE,
} from './tokens'
import { GameUseCase } from '../../application/GameUseCase'
import { soundEffect } from '../../services/SoundEffect'
import { backgroundMusic } from '../../services/BackgroundMusic'
import { highScoreService } from '../../services/HighScoreService'
import { gameSettingsService } from '../../services/GameSettingsService'

/**
 * DIコンテナにサービスを登録
 */
export function setupContainer(): void {
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
export function initializeApplication(): void {
  setupContainer()
}
