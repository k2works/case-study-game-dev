import './style.css'
import { GameController } from './application/GameController'

// メインエントリポイント
console.log('ぷよぷよゲーム開始準備中...')

// DOM要素の取得
const startButton = document.getElementById('start-button')
const resetButton = document.getElementById('reset-button')
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement

if (!canvas) {
  throw new Error('Canvas element not found')
}

// ゲームコントローラーの初期化
const gameController = new GameController(canvas)

// イベントリスナーの設定
startButton?.addEventListener('click', () => {
  console.log('ゲーム開始')
  gameController.start()
})

resetButton?.addEventListener('click', () => {
  console.log('ゲームリセット')
  gameController.reset()
})

console.log('ぷよぷよゲーム準備完了')
