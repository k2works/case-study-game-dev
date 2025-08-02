import { Game } from '../domain/model/Game'
import { GameState } from '../domain/model/GameState'
import { GameRenderer } from '../infrastructure/rendering/GameRenderer'
import { InputHandler } from '../infrastructure/input/InputHandler'

export class GameController {
  private game: Game
  private renderer: GameRenderer
  private inputHandler: InputHandler
  private gameLoopId: number | null = null
  private readonly targetFPS = 60
  private readonly frameTime = 1000 / this.targetFPS
  private lastFrameTime = 0

  constructor(canvas: HTMLCanvasElement) {
    this.game = new Game()
    this.renderer = new GameRenderer(canvas)
    this.inputHandler = new InputHandler()
  }

  start(): void {
    this.game.start()
    this.startGameLoop()
  }

  stop(): void {
    this.stopGameLoop()
  }

  private startGameLoop(): void {
    if (this.gameLoopId !== null) {
      this.stopGameLoop()
    }

    const gameLoop = (currentTime: number) => {
      if (currentTime - this.lastFrameTime >= this.frameTime) {
        this.update()
        this.render()
        this.lastFrameTime = currentTime
      }

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

  private update(): void {
    // 入力処理
    this.handleInput()

    // ゲームロジックの更新
    this.game.update()

    // 入力ハンドラーの更新（JustPressedをクリア）
    this.inputHandler.update()
  }

  private handleInput(): void {
    // Rキーでリスタート（ゲームオーバー時のみ）
    if (
      this.inputHandler.isKeyJustPressed('KeyR') &&
      this.game.getState() === GameState.GAME_OVER
    ) {
      this.game.restart()
      return
    }

    // 通常のゲーム操作（プレイ中のみ）
    if (this.game.getState() === GameState.PLAYING) {
      if (this.inputHandler.isKeyJustPressed('ArrowLeft')) {
        this.game.movePuyo(-1, 0)
      }
      if (this.inputHandler.isKeyJustPressed('ArrowRight')) {
        this.game.movePuyo(1, 0)
      }
      if (this.inputHandler.isKeyPressed('ArrowDown')) {
        this.game.movePuyo(0, 1)
      }
      if (this.inputHandler.isKeyJustPressed('ArrowUp')) {
        this.game.rotatePuyo()
      }
    }
  }

  private render(): void {
    this.renderer.render(this.game)
  }

  getGame(): Game {
    return this.game
  }

  reset(): void {
    this.stop()
    this.game = new Game()
    this.start()
  }
}
