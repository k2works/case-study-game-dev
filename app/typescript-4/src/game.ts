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
  private mode:
    | 'newPuyo'
    | 'playing'
    | 'checkFall'
    | 'falling'
    | 'checkErase'
    | 'erasing'
    | 'gameOver' = 'newPuyo';
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
      this.mode = 'checkFall';
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

        // ゲームオーバー判定
        if (this.player.checkGameOver()) {
          this.mode = 'gameOver';
        } else {
          this.mode = 'playing';
        }
        break;

      case 'playing':
        // プレイ中の処理（キー入力に応じた移動と落下）
        this.player.update(deltaTime);
        break;

      case 'checkFall':
        // 重力を適用
        const hasFallen = this.stage.applyGravity();
        if (hasFallen) {
          // ぷよが落下した場合、falling モードへ
          this.mode = 'falling';
        } else {
          // 落下するぷよがない場合、消去チェックへ
          this.mode = 'checkErase';
        }
        break;

      case 'falling':
        // 落下アニメーション用（一定フレーム待機）
        // 簡略化のため、すぐに checkFall に戻る
        this.mode = 'checkFall';
        break;

      case 'checkErase':
        // 消去判定
        const eraseInfo = this.stage.checkErase();
        if (eraseInfo.erasePuyoCount > 0) {
          // 消去対象がある場合、消去処理へ
          this.stage.eraseBoards(eraseInfo.eraseInfo);
          this.mode = 'erasing';
        } else {
          // 消去対象がない場合、全消し判定
          if (this.stage.checkZenkeshi()) {
            // 全消しボーナスを加算
            this.score.addZenkeshiBonus();
          }
          // 次のぷよを出す
          this.mode = 'newPuyo';
        }
        break;

      case 'erasing':
        // 消去アニメーション用（一定フレーム待機）
        // 簡略化のため、すぐに checkFall に戻る（消去後の重力適用）
        this.mode = 'checkFall';
        break;

      case 'gameOver':
        // ゲームオーバー時は何もしない
        break;
    }
  }

  private draw(): void {
    // ステージを描画
    this.stage.draw();

    // プレイヤーのぷよを描画（playingモード時のみ）
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
