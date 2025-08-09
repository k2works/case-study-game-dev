import { GameUseCase } from '../../application/GameUseCase'

/**
 * DIコンテナで管理するサービスの型定義
 */
export interface SoundEffectService {
  play(soundType: string): void
}

export interface BackgroundMusicService {
  play(musicType: string): void
  fadeOut(duration: number): Promise<void>
  stop(): void
}

export interface HighScoreService {
  getHighScores(): Array<{ score: number; date: string }>
  isHighScore(score: number): boolean
  addScore(score: number): Array<{ score: number; date: string }>
}

export interface GameSettingsService {
  getSetting(key: string): unknown
}

/**
 * DIコンテナの型マッピング
 */
export interface ServiceMap {
  GameUseCase: GameUseCase
  SoundEffectService: SoundEffectService
  BackgroundMusicService: BackgroundMusicService
  HighScoreService: HighScoreService
  GameSettingsService: GameSettingsService
}
