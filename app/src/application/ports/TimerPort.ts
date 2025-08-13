/**
 * タイマー機能のためのポートインターフェース
 * ヘキサゴナルアーキテクチャにおける外向きのポート
 */
export interface TimerPort {
  /**
   * インターバルタイマーを開始する
   * @param callback 実行するコールバック関数
   * @param intervalMs 実行間隔（ミリ秒）
   * @returns タイマーID
   */
  startInterval(callback: () => void, intervalMs: number): TimerId

  /**
   * タイムアウトタイマーを開始する
   * @param callback 実行するコールバック関数
   * @param delayMs 遅延時間（ミリ秒）
   * @returns タイマーID
   */
  startTimeout(callback: () => void, delayMs: number): TimerId

  /**
   * タイマーを停止する
   * @param timerId 停止するタイマーのID
   */
  stopTimer(timerId: TimerId): void

  /**
   * すべてのタイマーを停止する
   */
  stopAllTimers(): void

  /**
   * 現在時刻を取得する
   * @returns 現在のタイムスタンプ（ミリ秒）
   */
  getCurrentTime(): number

  /**
   * 高精度タイマーが利用可能かチェックする
   * @returns 利用可能な場合true
   */
  isHighResolutionAvailable(): boolean
}

/**
 * タイマーIDの型定義
 */
export type TimerId = number | string

/**
 * タイマー設定オプション
 */
export interface TimerOptions {
  readonly immediate?: boolean // 即座に実行するか
  readonly maxExecutions?: number // 最大実行回数
  readonly highResolution?: boolean // 高精度タイマーを使用するか
}
