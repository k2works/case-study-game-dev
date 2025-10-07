import { Config } from './config';
import { Stage } from './stage';

export class Player {
  private puyoX: number = 2; // ぷよのX座標（中央に配置）
  private puyoY: number = 0; // ぷよのY座標（一番上）
  private puyoType: number = 0; // 現在のぷよの種類
  private nextPuyoType: number = 0; // 次のぷよの種類
  private rotation: number = 0; // 現在の回転状態

  private inputKeyLeft: boolean = false;
  private inputKeyRight: boolean = false;
  private inputKeyUp: boolean = false;
  private inputKeyDown: boolean = false;

  private stage?: Stage; // Stageへの参照
  private onLandedCallback?: () => void; // 着地時のコールバック

  // 回転状態に応じた2つ目のぷよのオフセット [x, y]
  private readonly offsetX: number[] = [0, 1, 0, -1]; // rotation 0:上, 1:右, 2:下, 3:左
  private readonly offsetY: number[] = [-1, 0, 1, 0];

  // 落下タイマー
  private dropTimer: number = 0;
  private readonly dropInterval: number = 1000; // 1秒ごとに落下

  constructor(private config: Config) {
    // キーボードイベントの登録
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  setStage(stage: Stage): void {
    this.stage = stage;
  }

  setOnLandedCallback(callback: () => void): void {
    this.onLandedCallback = callback;
  }

  private getNextPuyoPosition(): { x: number; y: number } {
    return {
      x: this.puyoX + this.offsetX[this.rotation],
      y: this.puyoY + this.offsetY[this.rotation],
    };
  }

  private onKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowLeft':
        this.inputKeyLeft = true;
        break;
      case 'ArrowRight':
        this.inputKeyRight = true;
        break;
      case 'ArrowUp':
        this.inputKeyUp = true;
        break;
      case 'ArrowDown':
        this.inputKeyDown = true;
        break;
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowLeft':
        this.inputKeyLeft = false;
        break;
      case 'ArrowRight':
        this.inputKeyRight = false;
        break;
      case 'ArrowUp':
        this.inputKeyUp = false;
        break;
      case 'ArrowDown':
        this.inputKeyDown = false;
        break;
    }
  }

  createNewPuyo(): void {
    // 新しいぷよを作成（ここでは簡略化）
    this.puyoX = 2;
    this.puyoY = 0;
    this.puyoType = Math.floor(Math.random() * 4) + 1; // 1～4のランダムな値
    this.nextPuyoType = Math.floor(Math.random() * 4) + 1;
    this.rotation = 0;
  }

  moveLeft(): void {
    // 左に移動できるかチェック（軸ぷよと2つ目のぷよ両方）
    const nextPos = this.getNextPuyoPosition();
    const newPuyoX = this.puyoX - 1;
    const newNextX = nextPos.x - 1;

    // 両方のぷよが範囲内にある場合のみ移動
    if (newPuyoX >= 0 && newNextX >= 0) {
      this.puyoX = newPuyoX;
    }
  }

  moveRight(): void {
    // 右に移動できるかチェック（軸ぷよと2つ目のぷよ両方）
    const nextPos = this.getNextPuyoPosition();
    const newPuyoX = this.puyoX + 1;
    const newNextX = nextPos.x + 1;

    // 両方のぷよが範囲内にある場合のみ移動
    if (
      newPuyoX < this.config.stageCols &&
      newNextX < this.config.stageCols
    ) {
      this.puyoX = newPuyoX;
    }
  }

  draw(): void {
    // 現在のぷよを描画
    if (this.stage) {
      // 軸ぷよを描画
      this.stage.drawPuyo(this.puyoX, this.puyoY, this.puyoType);

      // 2つ目のぷよを描画
      const nextPos = this.getNextPuyoPosition();
      // 画面内にある場合のみ描画
      if (nextPos.y >= 0) {
        this.stage.drawPuyo(nextPos.x, nextPos.y, this.nextPuyoType);
      }
    }
  }

  rotateRight(): void {
    // 時計回りに回転
    this.rotation = (this.rotation + 1) % 4;

    // 壁キック処理
    this.performWallKick();
  }

  rotateLeft(): void {
    // 反時計回りに回転
    this.rotation = (this.rotation + 3) % 4;

    // 壁キック処理
    this.performWallKick();
  }

  private performWallKick(): void {
    // 右端で右回転した場合（2つ目のぷよが右にくる場合）
    if (this.rotation === 1 && this.puyoX === this.config.stageCols - 1) {
      // 左に移動（壁キック）
      this.puyoX--;
    }

    // 左端で左回転した場合（2つ目のぷよが左にくる場合）
    if (this.rotation === 3 && this.puyoX === 0) {
      // 右に移動（壁キック）
      this.puyoX++;
    }
  }

  private canMoveDown(): boolean {
    if (!this.stage) return false;

    // 2つ目のぷよの位置を取得
    const nextPos = this.getNextPuyoPosition();

    // 軸ぷよの下の位置
    const nextY = this.puyoY + 1;
    // 2つ目のぷよの下の位置
    const childNextY = nextPos.y + 1;

    // 範囲外チェック
    if (nextY >= this.config.stageRows || childNextY >= this.config.stageRows) {
      return false;
    }

    // フィールドとの衝突チェック
    if (this.stage.getPuyo(this.puyoX, nextY) !== 0) {
      return false;
    }

    if (this.stage.getPuyo(nextPos.x, childNextY) !== 0) {
      return false;
    }

    return true;
  }

  private applyGravity(): void {
    if (this.canMoveDown()) {
      this.puyoY++;
    } else {
      // 着地処理
      this.onLanded();
    }
  }

  private onLanded(): void {
    if (!this.stage) return;

    // 軸ぷよをフィールドに配置
    this.stage.setPuyo(this.puyoX, this.puyoY, this.puyoType);

    // 2つ目のぷよをフィールドに配置
    const nextPos = this.getNextPuyoPosition();
    this.stage.setPuyo(nextPos.x, nextPos.y, this.nextPuyoType);

    // 着地コールバックを呼び出す
    if (this.onLandedCallback) {
      this.onLandedCallback();
    }

    // 次のぷよを生成
    this.createNewPuyo();
    this.dropTimer = 0;
  }

  private getDropSpeed(): number {
    // 下キーが押されていれば高速落下（10倍速）
    return this.inputKeyDown ? 10 : 1;
  }

  checkGameOver(): boolean {
    if (!this.stage) return false;

    // 新しいぷよの配置位置にすでにぷよがあるかチェック
    const nextPos = this.getNextPuyoPosition();

    // 軸ぷよまたは2つ目のぷよの位置にぷよがあればゲームオーバー
    // getPuyo() は範囲外の場合 -1 を返すので、> 0 でチェック
    return (
      this.stage.getPuyo(this.puyoX, this.puyoY) > 0 ||
      this.stage.getPuyo(nextPos.x, nextPos.y) > 0
    );
  }

  update(deltaTime: number = 0): void {
    // 落下タイマーを進める（高速落下の速度を反映）
    this.dropTimer += deltaTime * this.getDropSpeed();

    // 落下間隔を超えたら落下処理を実行
    if (this.dropTimer >= this.dropInterval) {
      this.applyGravity();
      this.dropTimer = 0;
    }

    // キー入力に応じて移動
    if (this.inputKeyLeft) {
      this.moveLeft();
      this.inputKeyLeft = false; // 移動後フラグをクリア
    }
    if (this.inputKeyRight) {
      this.moveRight();
      this.inputKeyRight = false; // 移動後フラグをクリア
    }
    if (this.inputKeyUp) {
      this.rotateRight();
      this.inputKeyUp = false; // 移動後フラグをクリア
    }
  }
}
