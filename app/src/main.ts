import './style.css'
// import { Game } from './Game'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>ぷよぷよゲーム</h1>
    <canvas id="game-canvas" width="240" height="480"></canvas>
    <div class="controls">
      <p>操作方法:</p>
      <p>←→: 移動, ↑: 回転, ↓: 高速落下</p>
      <button id="restart-btn">リスタート</button>
    </div>
  </div>
`

// const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!
// const game = new Game()

// ゲームループを開始
function gameLoop() {
  // ここでゲームの描画処理を実装
  requestAnimationFrame(gameLoop)
}

gameLoop()

// リスタートボタンの処理
document.querySelector<HTMLButtonElement>('#restart-btn')!.addEventListener('click', () => {
  // ここでゲームのリスタート処理を実装
  console.log('Restart game')
})
