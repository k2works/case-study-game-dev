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
  private mode: 'newPuyo' | 'playing' | 'applyingGravity' = 'newPuyo';
  private animationId: number = 0;
  private frame: number = 0;
  private lastTime: number = 0;

  initialize(): void {
    // コンポーネントの初期化
    this.config = new Config();
    this.puyoImage = new PuyoImage(this.config);
    this.stage = new Stage(this.config, this.puyoImage);
    this.player = new Player(this.config);
    this.score = new Score();

    // PlayerにStageへの参照を設定
    this.player.setStage(this.stage);

    // Player の着地コールバックを設定
    this.player.setOnLandedCallback(() => {
      this.mode = 'applyingGravity';
    });

    // ゲームモードを初期化
    this.mode = 'newPuyo';
  }

  private update(deltaTime: number): void {
    this.frame++;

    // モードに応じた処理
    switch (this.mode) {
      case 'newPuyo':
        // 新しいぷよを作成
        this.player.createNewPuyo();
        this.mode = 'playing';
        break;

      case 'playing':
        // プレイ中の処理（キー入力に応じた移動と落下）
        this.player.update(deltaTime);
        break;

      case 'applyingGravity':
        // フィールド上のぷよに重力を適用
        const hasFallen = this.stage.applyGravity();
        if (!hasFallen) {
          // 落下が完了したら次のぷよを生成
          this.mode = 'newPuyo';
        }
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

  loop(currentTime: number = 0): void {
    // deltaTime を計算（ミリ秒）
    const deltaTime = this.lastTime === 0 ? 16 : currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();
    this.animationId = requestAnimationFrame((time) => this.loop(time));
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
