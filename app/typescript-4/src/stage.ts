import { Config } from './config';
import { PuyoImage } from './puyoimage';

export class Stage {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private field: number[][] = [];

  constructor(
    private config: Config,
    private puyoImage: PuyoImage
  ) {
    this.initializeCanvas();
    this.initializeField();
  }

  private initializeCanvas(): void {
    // canvas要素を作成
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.config.stageCols * this.config.puyoSize;
    this.canvas.height = this.config.stageRows * this.config.puyoSize;
    this.canvas.style.border = `2px solid ${this.config.stageBorderColor}`;
    this.canvas.style.backgroundColor = this.config.stageBackgroundColor;

    // ステージ要素に追加
    const stageElement = document.getElementById('stage');
    if (stageElement) {
      stageElement.appendChild(this.canvas);
    }

    // 描画コンテキストを取得（テスト環境では取得できない可能性がある）
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      this.ctx = ctx;
    }
  }

  private initializeField(): void {
    // フィールドを初期化（全て0=空）
    this.field = [];
    for (let y = 0; y < this.config.stageRows; y++) {
      this.field[y] = [];
      for (let x = 0; x < this.config.stageCols; x++) {
        this.field[y][x] = 0;
      }
    }
  }

  draw(): void {
    if (!this.ctx) return; // テスト環境対応

    // キャンバスをクリア
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // フィールドのぷよを描画
    for (let y = 0; y < this.config.stageRows; y++) {
      for (let x = 0; x < this.config.stageCols; x++) {
        const puyoType = this.field[y][x];
        if (puyoType > 0) {
          this.puyoImage.draw(this.ctx, puyoType, x, y);
        }
      }
    }
  }

  drawPuyo(x: number, y: number, type: number): void {
    if (!this.ctx) return; // テスト環境対応

    // 指定位置にぷよを描画
    this.puyoImage.draw(this.ctx, type, x, y);
  }

  setPuyo(x: number, y: number, type: number): void {
    // フィールドにぷよを配置
    if (
      y >= 0 &&
      y < this.config.stageRows &&
      x >= 0 &&
      x < this.config.stageCols
    ) {
      this.field[y][x] = type;
    }
  }

  getPuyo(x: number, y: number): number {
    // フィールドからぷよの種類を取得
    if (
      y < 0 ||
      y >= this.config.stageRows ||
      x < 0 ||
      x >= this.config.stageCols
    ) {
      return -1; // 範囲外
    }
    return this.field[y][x];
  }
}
