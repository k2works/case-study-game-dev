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
});
