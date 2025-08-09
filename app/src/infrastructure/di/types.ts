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
  getHighScores(): Array<{ score: number; date: string; rank: number }>
  isHighScore(score: number): boolean
  addScore(score: number): Array<{ score: number; date: string; rank: number }>
}

export interface GameSettingsService {
  getSetting(key: 'autoDropSpeed'): number
  getSetting(key: 'showShadow'): boolean
  getSetting(key: string): unknown
}

