// メインエントリポイント
console.log('ぷよぷよゲーム開始準備中...')

// ゲーム開始ボタンのイベントリスナー
const startButton = document.getElementById('start-button')
const resetButton = document.getElementById('reset-button')
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')

if (!ctx) {
  throw new Error('Canvas context is not available')
}

startButton?.addEventListener('click', () => {
  console.log('ゲーム開始')
  // TODO: ゲーム開始処理を実装
})

resetButton?.addEventListener('click', () => {
  console.log('ゲームリセット')
  // TODO: ゲームリセット処理を実装
})

// Canvas の初期化
ctx.fillStyle = '#000000'
ctx.fillRect(0, 0, canvas.width, canvas.height)

// テスト用のテキスト表示
ctx.fillStyle = '#ffffff'
ctx.font = '24px Arial'
ctx.fillText('ぷよぷよゲーム', 100, 300)
