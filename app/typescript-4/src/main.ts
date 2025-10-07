// ぷよぷよゲーム - メインエントリーポイント
import { Game } from './game';

// DOMが読み込まれたらゲームを開始
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.start();
});
