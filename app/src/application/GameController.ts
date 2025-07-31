import { Game } from '../domain/model/Game'
import { GameRenderer } from '../infrastructure/rendering/GameRenderer'

export class GameController {
  private game: Game
  private renderer: GameRenderer
  private gameLoopId: number | null = null
  private readonly targetFPS = 60
  private readonly frameTime = 1000 / this.targetFPS
  private lastFrameTime = 0

  constructor(canvas: HTMLCanvasElement) {
    this.game = new Game()
    this.renderer = new GameRenderer(canvas)
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
    // ゲームロジックの更新はここで行う
    // 現在はレンダリングのみ
  }

  private render(): void {
    this.renderer.render(this.game)
  }

  getGame(): Game {
    return this.game
  }
}