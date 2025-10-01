// ぷよぷよゲームのエントリーポイント
import { Game } from './game'

console.log('ぷよぷよゲーム起動！')

// ゲームの初期化と開始
const game = new Game()
game.initialize()
game.loop()
