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
  private frame: number = 0;

  initialize(): void {
    // コンポーネントの初期化
    this.config = new Config();
    this.puyoImage = new PuyoImage(this.config);
    this.stage = new Stage(this.config, this.puyoImage);
    this.player = new Player(this.config);
    this.score = new Score();

    // PlayerにStageへの参照を設定
    this.player.setStage(this.stage);

    // ゲームモードを初期化
    this.mode = 'newPuyo';
  }

  private update(): void {
    this.frame++;

    // モードに応じた処理
    switch (this.mode) {
      case 'newPuyo':
        // 新しいぷよを作成
        this.player.createNewPuyo();
        this.mode = 'playing';
        break;

      case 'playing':
        // プレイ中の処理（キー入力に応じた移動）
        this.player.update();
        break;
    }
  }

  private draw(): void {
    // ステージを描画
    this.stage.draw();

    // プレイヤーのぷよを描画
    if (this.mode === 'playing') {
      this.player.draw();
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
