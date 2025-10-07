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

  constructor(private config: Config) {
    // キーボードイベントの登録
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  setStage(stage: Stage): void {
    this.stage = stage;
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
    // 左端でなければ左に移動
    if (this.puyoX > 0) {
      this.puyoX--;
    }
  }

  moveRight(): void {
    // 右端でなければ右に移動
    if (this.puyoX < this.config.stageCols - 1) {
      this.puyoX++;
    }
  }

  draw(): void {
    // 現在のぷよを描画
    if (this.stage) {
      this.stage.drawPuyo(this.puyoX, this.puyoY, this.puyoType);
    }
  }

  update(): void {
    // キー入力に応じて移動
    if (this.inputKeyLeft) {
      this.moveLeft();
      this.inputKeyLeft = false; // 移動後フラグをクリア
    }
    if (this.inputKeyRight) {
      this.moveRight();
      this.inputKeyRight = false; // 移動後フラグをクリア
    }
  }
}
