import { Config } from './config'
import { Stage } from './stage'
import { PuyoImage } from './puyoimage'

// プレイヤーの入力と操作を管理するクラス
export class Player {
  private _config: Config
  private _stage: Stage
  private _puyoImage: PuyoImage

  constructor(config: Config, stage: Stage, puyoImage: PuyoImage) {
    this._config = config
    this._stage = stage
    this._puyoImage = puyoImage
  }

  // プレイヤー操作を初期化する
  initialize(): void {
    // TODO: プレイヤー操作の初期化処理
  }
}
