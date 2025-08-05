import { Game } from '../domain/entities/Game'
import { GameRenderer } from '../infrastructure/GameRenderer'
import { InputHandler } from '../infrastructure/InputHandler'

export class GameController {
  private game: Game
  private renderer: GameRenderer
  private inputHandler: InputHandler
  private scoreElement!: HTMLDivElement
  private chainElement!: HTMLDivElement
  private zenkeshiOverlay!: HTMLDivElement
  private gameoverOverlay!: HTMLDivElement
  private finalScoreElement!: HTMLElement
  private lastTime = 0
  private gameLoopId: number | null = null

  constructor() {
    this.game = new Game()
    this.renderer = new GameRenderer('#game-canvas')
    this.inputHandler = new InputHandler()
    this.initializeDOM()
    this.setupEventListeners()
    this.setupInputHandlers()
    this.setupGameCallbacks()
    this.startGameLoop()
  }

  private initializeDOM(): void {
    this.scoreElement = document.querySelector<HTMLDivElement>('#score-value')!
    this.chainElement = document.querySelector<HTMLDivElement>('#chain-value')!
    this.zenkeshiOverlay = document.querySelector<HTMLDivElement>('#zenkeshi-overlay')!
    this.gameoverOverlay = document.querySelector<HTMLDivElement>('#gameover-overlay')!
    this.finalScoreElement = document.querySelector('#final-score')!
  }

  private setupEventListeners(): void {
    // リスタートボタンの処理
    document.querySelector<HTMLButtonElement>('#restart-btn')!.addEventListener('click', () => {
      this.restartGame()
    })

    // ゲームオーバー画面のリスタートボタンの処理
    document
      .querySelector<HTMLButtonElement>('#restart-gameover-btn')!
      .addEventListener('click', () => {
        this.hideGameOverAnimation()
        this.restartGame()
      })
  }

  private setupInputHandlers(): void {
    // 左右移動
    this.inputHandler.setKeyHandler('ArrowLeft', () => {
      this.game.handleInput('ArrowLeft')
    })
    this.inputHandler.setKeyHandler('ArrowRight', () => {
      this.game.handleInput('ArrowRight')
    })

    // 回転
    this.inputHandler.setKeyHandler('ArrowUp', () => {
      this.game.handleInput('ArrowUp')
    })

    // 高速落下は特別な処理（押下状態を確認）
    // ゲームループでinputHandler.isKeyPressed('ArrowDown')を使用
  }

  private handleFastDrop(): void {
    if (this.inputHandler.isKeyPressed('ArrowDown')) {
      this.game.handleKeyDown('ArrowDown')
    } else {
      this.game.handleKeyUp('ArrowDown')
    }
  }

  private setupGameCallbacks(): void {
    // 全消し演出コールバックを設定
    this.game.setZenkeshiCallback(() => {
      this.showZenkeshiAnimation()
    })

    // ゲームオーバー演出コールバックを設定
    this.game.setGameOverCallback(() => {
      this.showGameOverAnimation()
    })
  }

  private updateUI(): void {
    // スコアを更新
    this.scoreElement.textContent = this.game.getScore().toString()

    // 連鎖数を更新
    this.chainElement.textContent = this.game.getChainCount().toString()
  }

  private showZenkeshiAnimation(): void {
    this.zenkeshiOverlay.classList.remove('hidden')
    this.zenkeshiOverlay.classList.add('show')

    // 3秒後に演出を非表示にする
    window.setTimeout(() => {
      this.hideZenkeshiAnimation()
    }, 3000)
  }

  private hideZenkeshiAnimation(): void {
    this.zenkeshiOverlay.classList.remove('show')
    this.zenkeshiOverlay.classList.add('hidden')
  }

  private showGameOverAnimation(): void {
    // 最終スコアを表示
    this.finalScoreElement.textContent = this.game.getScore().toString()

    this.gameoverOverlay.classList.remove('hidden')
    this.gameoverOverlay.classList.add('show')
  }

  private hideGameOverAnimation(): void {
    this.gameoverOverlay.classList.remove('show')
    this.gameoverOverlay.classList.add('hidden')
  }

  private startGameLoop(): void {
    const gameLoop = (currentTime: number) => {
      // デルタタイムを計算
      const deltaTime = currentTime - this.lastTime
      this.lastTime = currentTime

      // 高速落下処理
      this.handleFastDrop()

      // ゲームの更新
      this.game.update(deltaTime)

      // レンダリング
      this.renderer.render(this.game)

      // UIを更新
      this.updateUI()

      this.gameLoopId = requestAnimationFrame(gameLoop)
    }

    this.gameLoopId = requestAnimationFrame(gameLoop)
  }

  private stopGameLoop(): void {
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId)
      this.gameLoopId = null
    }
  }

  public restartGame(): void {
    this.game.restart()
    console.log('Game restarted')
  }

  public getGame(): Game {
    return this.game
  }

  public destroy(): void {
    this.stopGameLoop()
    this.inputHandler.destroy()
    // イベントリスナーの削除は省略（通常はメモリリーク対策のため必要）
  }
}
