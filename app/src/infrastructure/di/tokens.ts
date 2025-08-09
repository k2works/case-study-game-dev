/**
 * 依存性注入で使用するサービストークン
 * Symbolを使用してタイプセーフな識別子を提供
 */

// アプリケーション層のトークン
export const GAME_USE_CASE = Symbol.for('GameUseCase')

// サービス層のトークン
export const SOUND_EFFECT_SERVICE = Symbol.for('SoundEffectService')
export const BACKGROUND_MUSIC_SERVICE = Symbol.for('BackgroundMusicService')
export const HIGH_SCORE_SERVICE = Symbol.for('HighScoreService')
export const GAME_SETTINGS_SERVICE = Symbol.for('GameSettingsService')

// インフラストラクチャ層のトークン
export const LOCAL_STORAGE_ADAPTER = Symbol('LocalStorageAdapter')
export const AUDIO_ADAPTER = Symbol('AudioAdapter')
