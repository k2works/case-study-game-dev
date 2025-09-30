import { Game } from './game'

// ゲームを初期化して開始
const game = new Game()

window.addEventListener('DOMContentLoaded', () => {
  console.log('Puyo Puyo Game Starting...')
  game.initialize()
  game.start()
})
