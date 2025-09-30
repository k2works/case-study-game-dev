import { Config } from './config'
import { PuyoImage } from './puyoimage'

// ゲームのステージ（盤面）を管理するクラス
export class Stage {
  private _config: Config
  private _puyoImage: PuyoImage

  constructor(config: Config, puyoImage: PuyoImage) {
    this._config = config
    this._puyoImage = puyoImage
  }

  // ステージを初期化する
  initialize(): void {
    // TODO: ステージの初期化処理
  }
}
