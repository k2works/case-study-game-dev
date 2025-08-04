import './style.css'
import { Game } from './Game'

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

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!
const ctx = canvas.getContext('2d')!
const game = new Game()

// セルサイズ（各マスの大きさ）
const CELL_SIZE = 40

// ゲームフィールドを描画する関数
function drawField() {
  const field = game.getField()

  // フィールドの背景を描画
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // グリッドラインを描画
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1

  for (let y = 0; y <= field.length; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * CELL_SIZE)
    ctx.lineTo(canvas.width, y * CELL_SIZE)
    ctx.stroke()
  }

  for (let x = 0; x <= field[0].length; x++) {
    ctx.beginPath()
    ctx.moveTo(x * CELL_SIZE, 0)
    ctx.lineTo(x * CELL_SIZE, canvas.height)
    ctx.stroke()
  }

  // フィールドの各セルを描画
  for (let y = 0; y < field.length; y++) {
    for (let x = 0; x < field[y].length; x++) {
      if (field[y][x] !== 0) {
        drawPuyoCell(x, y, field[y][x])
      }
    }
  }
}

// 現在のぷよを描画する関数
function drawCurrentPuyo() {
  const puyo = game.getCurrentPuyo()
  if (puyo) {
    drawPuyoCell(puyo.x, puyo.y, puyo.color)
  }
}

// ぷよセルを描画する関数
function drawPuyoCell(x: number, y: number, color: number) {
  const colors = ['', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7']

  ctx.fillStyle = colors[color] || '#999'
  ctx.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4)

  // ぷよの境界線を描画
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.strokeRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4)
}

// ゲームを描画する関数
function draw() {
  drawField()
  drawCurrentPuyo()
}

// ゲームループ用の変数
let lastTime = 0

// ゲームループ
function gameLoop(currentTime: number) {
  // デルタタイムを計算
  const deltaTime = currentTime - lastTime
  lastTime = currentTime

  // ゲームの更新
  game.update(deltaTime)

  // 描画
  draw()

  requestAnimationFrame(gameLoop)
}

// ゲームループを開始
requestAnimationFrame(gameLoop)

// キーボード入力の処理
document.addEventListener('keydown', (event) => {
  // 既存のhandleInputは一回押し用（左右移動、一回落下）
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    // 左右移動は一回押しで処理
    if (!event.repeat) {
      game.handleInput(event.key)
    }
  } else {
    // その他のキーは押下状態を管理
    game.handleKeyDown(event.key)
  }
})

document.addEventListener('keyup', (event) => {
  game.handleKeyUp(event.key)
})

// リスタートボタンの処理
document.querySelector<HTMLButtonElement>('#restart-btn')!.addEventListener('click', () => {
  // ここでゲームのリスタート処理を実装
  console.log('Restart game')
})
