/**
 * データ永続化のためのポートインターフェース
 * ヘキサゴナルアーキテクチャにおける外向きのポート
 */
export interface StoragePort {
  /**
   * データを保存する
   * @param key 保存キー
   * @param data 保存するデータ
   * @returns 保存成功時true、失敗時false
   */
  save<T>(key: string, data: T): Promise<boolean>

  /**
   * データを読み込む
   * @param key 読み込みキー
   * @returns 保存されていたデータ、存在しない場合null
   */
  load<T>(key: string): Promise<T | null>

  /**
   * データを削除する
   * @param key 削除キー
   * @returns 削除成功時true、失敗時false
   */
  remove(key: string): Promise<boolean>

  /**
   * データが存在するかチェックする
   * @param key チェック対象のキー
   * @returns 存在する場合true
   */
  exists(key: string): Promise<boolean>

  /**
   * すべてのデータをクリアする
   * @returns クリア成功時true、失敗時false
   */
  clear(): Promise<boolean>

  /**
   * ストレージの使用量を取得する（バイト単位）
   * @returns 使用量、取得できない場合null
   */
  getUsage(): Promise<number | null>
}

/**
 * ストレージに保存するゲームデータの形式
 */
export interface GameStorageData {
  readonly highScore: number
  readonly totalPlayTime: number
  readonly gamesPlayed: number
  readonly lastPlayedAt: Date
  readonly settings: GameSettings
}

/**
 * ゲーム設定データ
 */
export interface GameSettings {
  readonly soundEnabled: boolean
  readonly musicEnabled: boolean
  readonly difficulty: 'easy' | 'normal' | 'hard'
  readonly autoSave: boolean
}
