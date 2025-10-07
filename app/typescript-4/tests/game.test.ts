import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../src/game';
import { Config } from '../src/config';
import { Stage } from '../src/stage';
import { PuyoImage } from '../src/puyoimage';
import { Player } from '../src/player';
import { Score } from '../src/score';

describe('ゲーム', () => {
  let game: Game;

  beforeEach(() => {
    // DOMの準備
    document.body.innerHTML = `
            <div id="app">
                <div id="stage"></div>
            </div>
        `;
    game = new Game();
  });

  describe('ゲームの初期化', () => {
    it('ゲームを初期化すると、必要なコンポーネントが作成される', () => {
      game.initialize();

      expect(game['config']).toBeInstanceOf(Config);
      expect(game['puyoImage']).toBeInstanceOf(PuyoImage);
      expect(game['stage']).toBeInstanceOf(Stage);
      expect(game['player']).toBeInstanceOf(Player);
      expect(game['score']).toBeInstanceOf(Score);
    });

    it('ゲームを初期化すると、ゲームモードがnewPuyoになる', () => {
      game.initialize();

      expect(game['mode']).toEqual('newPuyo');
    });
  });

  describe('連鎖反応', () => {
    beforeEach(() => {
      game.initialize();
    });

    it('ぷよの消去と落下後、新たな消去パターンがあれば連鎖が発生する', () => {
      // ゲームのステージにぷよを配置
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 2 0 0 0
      // 0 0 2 0 0 0
      // 0 0 2 0 0 0
      // 0 1 1 2 0 0
      // 0 1 1 0 0 0
      const stage = game['stage'];
      stage.setPuyo(1, 10, 1); // 赤
      stage.setPuyo(2, 10, 1); // 赤
      stage.setPuyo(1, 11, 1); // 赤
      stage.setPuyo(2, 11, 1); // 赤
      stage.setPuyo(3, 10, 2); // 青（横）
      stage.setPuyo(2, 7, 2); // 青（上）
      stage.setPuyo(2, 8, 2); // 青（上）
      stage.setPuyo(2, 9, 2); // 青（上）

      // checkErase モードに設定
      game['mode'] = 'checkErase';

      // 1回目の消去判定と消去実行
      game['update'](0); // checkErase → erasing
      expect(game['mode']).toBe('erasing');

      // 消去後の重力チェック
      game['update'](0); // erasing → checkFall
      expect(game['mode']).toBe('checkFall');

      // 重力適用（青ぷよが落下）
      game['update'](0); // checkFall → falling（落下あり）
      expect(game['mode']).toBe('falling');

      // 落下アニメーション
      game['update'](0); // falling → checkFall
      expect(game['mode']).toBe('checkFall');

      // 落下完了まで繰り返し
      let iterations = 0;
      while (game['mode'] !== 'checkErase' && iterations < 20) {
        game['update'](0);
        iterations++;
      }

      // checkErase モードに到達している
      expect(game['mode']).toBe('checkErase');

      // 2回目の消去判定（連鎖）
      const chainEraseInfo = stage.checkErase();

      // 連鎖が発生していることを確認（青ぷよが4つつながっている）
      expect(chainEraseInfo.erasePuyoCount).toBeGreaterThan(0);
    });
  });
});
