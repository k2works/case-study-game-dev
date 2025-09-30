import { Config } from './config'

// ぷよの画像を管理するクラス
export class PuyoImage {
  private _config: Config

  constructor(config: Config) {
    this._config = config
  }

  // ぷよの画像を読み込む（実装は後で）
  load(): void {
    // TODO: 画像読み込み処理
  }
}
