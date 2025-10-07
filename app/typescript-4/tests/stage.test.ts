import { describe, it, expect, beforeEach } from 'vitest';
import { Stage } from '../src/stage';
import { Config } from '../src/config';
import { PuyoImage } from '../src/puyoimage';

describe('ステージ', () => {
  let config: Config;
  let puyoImage: PuyoImage;
  let stage: Stage;

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
  });

  describe('ぷよの接続判定', () => {
    it('同じ色のぷよが4つつながっていると、消去対象になる', () => {
      // ステージにぷよを配置（1は赤ぷよ）
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 1 1 0 0 0
      // 0 1 1 0 0 0
      stage.setPuyo(1, 10, 1);
      stage.setPuyo(2, 10, 1);
      stage.setPuyo(1, 11, 1);
      stage.setPuyo(2, 11, 1);

      // 消去判定
      const eraseInfo = stage.checkErase();

      // 4つのぷよが消去対象になっていることを確認
      expect(eraseInfo.erasePuyoCount).toBe(4);
      expect(eraseInfo.eraseInfo.length).toBeGreaterThan(0);
    });

    it('異なる色のぷよは消去対象にならない', () => {
      // ステージにぷよを配置（1は赤ぷよ、2は青ぷよ）
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 1 2 0 0 0
      // 0 2 1 0 0 0
      stage.setPuyo(1, 10, 1);
      stage.setPuyo(2, 10, 2);
      stage.setPuyo(1, 11, 2);
      stage.setPuyo(2, 11, 1);

      // 消去判定
      const eraseInfo = stage.checkErase();

      // 消去対象がないことを確認
      expect(eraseInfo.erasePuyoCount).toBe(0);
      expect(eraseInfo.eraseInfo.length).toBe(0);
    });
  });

  describe('ぷよの消去と落下', () => {
    it('消去対象のぷよを消去する', () => {
      // ステージにぷよを配置
      stage.setPuyo(1, 10, 1);
      stage.setPuyo(2, 10, 1);
      stage.setPuyo(1, 11, 1);
      stage.setPuyo(2, 11, 1);

      // 消去判定
      const eraseInfo = stage.checkErase();

      // 消去実行
      stage.eraseBoards(eraseInfo.eraseInfo);

      // ぷよが消去されていることを確認
      expect(stage.getPuyo(1, 10)).toBe(0);
      expect(stage.getPuyo(2, 10)).toBe(0);
      expect(stage.getPuyo(1, 11)).toBe(0);
      expect(stage.getPuyo(2, 11)).toBe(0);
    });

    it('消去後、上にあるぷよが落下する', () => {
      // ステージにぷよを配置
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 0 0 0 0
      // 0 0 2 0 0 0
      // 0 0 2 0 0 0
      // 0 1 1 0 0 0
      // 0 1 1 0 0 0
      stage.setPuyo(1, 10, 1);
      stage.setPuyo(2, 10, 1);
      stage.setPuyo(1, 11, 1);
      stage.setPuyo(2, 11, 1);
      stage.setPuyo(2, 8, 2);
      stage.setPuyo(2, 9, 2);

      // 消去判定と実行
      const eraseInfo = stage.checkErase();
      stage.eraseBoards(eraseInfo.eraseInfo);

      // 落下処理
      stage.fall();

      // 上にあったぷよが落下していることを確認
      expect(stage.getPuyo(2, 10)).toBe(2);
      expect(stage.getPuyo(2, 11)).toBe(2);
    });
  });
});
