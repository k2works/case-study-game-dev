import { Game } from '../domain/entities/Game'
import { GameRenderer } from '../infrastructure/GameRenderer'

export class GameController {
  private game: Game
  private renderer: GameRenderer
  private scoreElement: HTMLDivElement
  private chainElement: HTMLDivElement
  private zenkeshiOverlay: HTMLDivElement
  private gameoverOverlay: HTMLDivElement
  private finalScoreElement: HTMLElement
  private lastTime = 0
  private gameLoopId: number | null = null

  constructor() {
    this.game = new Game()
    this.renderer = new GameRenderer('#game-canvas')
    this.initializeDOM()
    this.setupEventListeners()
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
    // キーボード入力の処理
    document.addEventListener('keydown', (event) => this.handleKeyDown(event))
    document.addEventListener('keyup', (event) => this.handleKeyUp(event))

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

  private handleKeyDown(event: KeyboardEvent): void {
    // 既存のhandleInputは一回押し用（左右移動、一回落下）
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      // 左右移動は一回押しで処理
      if (!event.repeat) {
        this.game.handleInput(event.key)
      }
    } else {
      // その他のキーは押下状態を管理
      this.game.handleKeyDown(event.key)
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.game.handleKeyUp(event.key)
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
    // イベントリスナーの削除は省略（通常はメモリリーク対策のため必要）
  }
}
