import { Config } from './config';
import { PuyoImage } from './puyoimage';
import { Stage } from './stage';
import { Player } from './player';
import { Score } from './score';

export class Game {
  private config!: Config;
  private puyoImage!: PuyoImage;
  private stage!: Stage;
  private player!: Player;
  private score!: Score;
  private mode: 'newPuyo' | 'playing' = 'newPuyo';
  private animationId: number = 0;

  initialize(): void {
    // コンポーネントの初期化
    this.config = new Config();
    this.puyoImage = new PuyoImage(this.config);
    this.stage = new Stage(this.config, this.puyoImage);
    this.player = new Player(this.config);
    this.score = new Score();

    // ゲームモードを初期化
    this.mode = 'newPuyo';
  }

  update(): void {
    if (this.mode === 'newPuyo') {
      // 新しいぷよを生成
      this.player.newPuyo();
      this.mode = 'playing';
    }
  }

  draw(): void {
    // ステージを描画
    this.stage.draw();

    // プレイヤーのぷよを描画
    if (this.mode === 'playing') {
      // 軸ぷよを描画
      this.stage.drawPuyo(this.player.x, this.player.y, this.player.type);
      // 子ぷよを描画（y座標が0以上の場合のみ）
      if (this.player.childY >= 0) {
        this.stage.drawPuyo(
          this.player.childX,
          this.player.childY,
          this.player.childType
        );
      }
    }
  }

  loop(): void {
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  start(): void {
    this.initialize();
    this.loop();
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }
}
