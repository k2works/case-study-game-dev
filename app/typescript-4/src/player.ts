import { Config } from './config';

export class Player {
  x: number = 2; // 軸ぷよのx座標
  y: number = 0; // 軸ぷよのy座標
  type: number = 0; // 軸ぷよの種類
  childX: number = 2; // 子ぷよのx座標
  childY: number = -1; // 子ぷよのy座標
  childType: number = 0; // 子ぷよの種類

  constructor(private config: Config) {}

  newPuyo(): void {
    // 新しいぷよペアを生成
    this.x = 2;
    this.y = 0;
    this.childX = 2;
    this.childY = -1;

    // ぷよの種類をランダムに決定（1-4）
    this.type = Math.floor(Math.random() * 4) + 1;
    this.childType = Math.floor(Math.random() * 4) + 1;
  }
}
