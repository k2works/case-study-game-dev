import './style.css'
import { GameController } from './presentation/GameController'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>ぷよぷよゲーム</h1>
    <div class="game-container">
      <canvas id="game-canvas" width="240" height="480"></canvas>
      <div class="game-info">
        <div class="score-display">
          <h3>スコア</h3>
          <div id="score-value">0</div>
        </div>
        <div class="chain-display">
          <h3>連鎖数</h3>
          <div id="chain-value">0</div>
        </div>
      </div>
    </div>
    <div id="zenkeshi-overlay" class="zenkeshi-overlay hidden">
      <div class="zenkeshi-message">
        <h2>全消し！</h2>
        <p>+2000点</p>
      </div>
    </div>
    <div id="gameover-overlay" class="gameover-overlay hidden">
      <div class="gameover-message">
        <h2>ゲームオーバー</h2>
        <p>最終スコア: <span id="final-score">0</span>点</p>
        <button id="restart-gameover-btn" class="restart-btn">リスタート</button>
      </div>
    </div>
    <div class="controls">
      <p>操作方法:</p>
      <p>←→: 移動, ↑: 回転, ↓: 高速落下</p>
      <button id="restart-btn">リスタート</button>
    </div>
  </div>
`

// GameControllerを初期化（全ての処理を委譲）
new GameController()
