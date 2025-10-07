import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from '../src/player';
import { Config } from '../src/config';
import { Stage } from '../src/stage';
import { PuyoImage } from '../src/puyoimage';

describe('プレイヤー', () => {
  let config: Config;
  let puyoImage: PuyoImage;
  let stage: Stage;
  let player: Player;

  beforeEach(() => {
    // DOMの準備
    document.body.innerHTML = `
            <div id="app">
                <div id="stage"></div>
            </div>
        `;
    config = new Config();
    puyoImage = new PuyoImage(config);
    stage = new Stage(config, puyoImage);
    player = new Player(config);
  });

  describe('キー入力', () => {
    it('左キーが押されると、左向きの移動フラグが立つ', () => {
      // キーダウンイベントをシミュレート（左キー）
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      document.dispatchEvent(event);

      expect(player['inputKeyLeft']).toBe(true);
    });

    it('右キーが押されると、右向きの移動フラグが立つ', () => {
      // キーダウンイベントをシミュレート（右キー）
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      document.dispatchEvent(event);

      expect(player['inputKeyRight']).toBe(true);
    });

    it('キーが離されると、対応する移動フラグが下がる', () => {
      // まず左キーを押す
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(player['inputKeyLeft']).toBe(true);

      // 次に左キーを離す
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
      expect(player['inputKeyLeft']).toBe(false);
    });
  });

  describe('ぷよの移動', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo();
    });

    it('左に移動できる場合、左に移動する', () => {
      // 初期位置を記録
      const initialX = player['puyoX'];

      // 左に移動
      player.moveLeft();

      // 位置が1つ左に移動していることを確認
      expect(player['puyoX']).toBe(initialX - 1);
    });

    it('右に移動できる場合、右に移動する', () => {
      // 初期位置を記録
      const initialX = player['puyoX'];

      // 右に移動
      player.moveRight();

      // 位置が1つ右に移動していることを確認
      expect(player['puyoX']).toBe(initialX + 1);
    });

    it('左端にいる場合、左に移動できない', () => {
      // 左端に移動
      player['puyoX'] = 0;

      // 左に移動を試みる
      player.moveLeft();

      // 位置が変わっていないことを確認
      expect(player['puyoX']).toBe(0);
    });

    it('右端にいる場合、右に移動できない', () => {
      // 右端に移動（ステージの幅 - 1）
      player['puyoX'] = config.stageCols - 1;

      // 右に移動を試みる
      player.moveRight();

      // 位置が変わっていないことを確認
      expect(player['puyoX']).toBe(config.stageCols - 1);
    });
  });
});
