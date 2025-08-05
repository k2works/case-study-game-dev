import { GameField } from './GameField'
import { GameLogic } from './GameLogic'
import { PuyoPair } from './Puyo'
import { GameState } from './GameState'
import { ScoreCalculator } from './ScoreCalculator'

export class Game {
  private gameField: GameField
  private gameLogic: GameLogic
  private currentPuyoPair: PuyoPair | null = null
  private gameState = GameState.PLAYING
  private dropTimer = 0
  private dropInterval = 1000 // 1秒ごとに落下
  private puyoLanded = false
  private keysPressed: Set<string> = new Set() // 押されているキー
  private fastDropTimer = 0
  private fastDropInterval = 50 // 高速落下は50msごと
  private chainCount = 0 // 連鎖数
  private score = 0 // 現在のスコア
  private gameOverCallback: (() => void) | null = null // ゲームオーバー演出コールバック

  constructor() {
    this.gameField = new GameField()
    this.gameLogic = new GameLogic(
      this.gameField,
      (score) => this.addScore(score),
      this.triggerZenkeshiCallback.bind(this)
    )
    this.generateNewPuyoPair()
  }

  isGameOver(): boolean {
    return this.gameState === GameState.GAME_OVER
  }

  getState(): GameState {
    return this.gameState
  }

  getField(): number[][] {
    return this.gameField.getField()
  }

  getCurrentPuyoPair(): PuyoPair | null {
    return this.currentPuyoPair
  }

  isPuyoLanded(): boolean {
    return this.puyoLanded
  }

  update(deltaTime?: number): void {
    if (!this.currentPuyoPair || this.gameState === GameState.GAME_OVER) return

    // 着地済みのぷよを処理
    if (this.puyoLanded) {
      this.handleLandedPuyo()
      return
    }

    // 即座に落下する場合
    if (deltaTime === undefined) {
      this.immediateDropUpdate()
      return
    }

    // 時間経過による落下処理
    this.timedDropUpdate(deltaTime)
  }

  private handleLandedPuyo(): void {
    this.fixPuyoPair()
    // 着地直後に重力処理を実行（横向きぷよなどが適切に落下するように）
    this.gameField.applyGravity()
    this.resetChainCount()
    const chainResult = this.gameLogic.processChain()
    this.chainCount = chainResult.chainCount
    this.generateNewPuyoPair()
    this.puyoLanded = false
    this.dropTimer = 0
    this.fastDropTimer = 0
  }

  private immediateDropUpdate(): void {
    if (!this.currentPuyoPair) return

    // 着地判定
    if (!this.canPuyoPairMoveTo(this.currentPuyoPair.axis.x, this.currentPuyoPair.axis.y + 1)) {
      this.puyoLanded = true
      return
    }
    this.dropPuyoPair()
  }

  private timedDropUpdate(deltaTime: number): void {
    if (!this.currentPuyoPair) return

    // 高速落下処理
    if (this.keysPressed.has('ArrowDown')) {
      this.fastDropTimer += deltaTime
      if (this.fastDropTimer >= this.fastDropInterval) {
        // 着地判定
        if (!this.canPuyoPairMoveTo(this.currentPuyoPair.axis.x, this.currentPuyoPair.axis.y + 1)) {
          this.puyoLanded = true
          return
        }
        this.dropPuyoPair()
        this.fastDropTimer = 0
      }
      return
    }

    // 通常の落下処理
    this.dropTimer += deltaTime
    if (this.dropTimer >= this.dropInterval) {
      // 着地判定
      if (!this.canPuyoPairMoveTo(this.currentPuyoPair.axis.x, this.currentPuyoPair.axis.y + 1)) {
        this.puyoLanded = true
        return
      }
      this.dropPuyoPair()
      this.dropTimer = 0
    }
  }

  handleInput(key: string): void {
    if (!this.currentPuyoPair || this.gameState === GameState.GAME_OVER) return

    switch (key) {
      case 'ArrowLeft':
        this.movePuyoPair(-1, 0)
        break
      case 'ArrowRight':
        this.movePuyoPair(1, 0)
        break
      case 'ArrowDown':
        this.dropPuyoPair()
        break
      case 'ArrowUp':
        this.rotatePuyoPair()
        break
    }
  }

  handleKeyDown(key: string): void {
    if (!this.currentPuyoPair || this.gameState === GameState.GAME_OVER) return

    this.keysPressed.add(key)

    // 非高速落下キーは即座に処理
    switch (key) {
      case 'ArrowLeft':
        this.movePuyoPair(-1, 0)
        break
      case 'ArrowRight':
        this.movePuyoPair(1, 0)
        break
      case 'ArrowUp':
        this.rotatePuyoPair()
        break
    }
  }

  handleKeyUp(key: string): void {
    this.keysPressed.delete(key)

    // 高速落下キーが離された場合はタイマーをリセット
    if (key === 'ArrowDown') {
      this.fastDropTimer = 0
    }
  }

  private movePuyoPair(dx: number, dy: number): void {
    if (!this.currentPuyoPair) return

    const newX = this.currentPuyoPair.axis.x + dx
    const newY = this.currentPuyoPair.axis.y + dy

    if (this.canPuyoPairMoveTo(newX, newY)) {
      this.currentPuyoPair.moveTo(newX, newY)
    }
  }

  private dropPuyoPair(): void {
    if (!this.currentPuyoPair) return

    // 下に移動できるかチェック
    if (this.canPuyoPairMoveTo(this.currentPuyoPair.axis.x, this.currentPuyoPair.axis.y + 1)) {
      this.currentPuyoPair.moveTo(this.currentPuyoPair.axis.x, this.currentPuyoPair.axis.y + 1)
    }
  }

  private canMoveTo(x: number, y: number): boolean {
    return this.gameField.canMoveTo(x, y)
  }

  private canPuyoPairMoveTo(axisX: number, axisY: number): boolean {
    if (!this.currentPuyoPair) return false

    // 新しい軸の位置で衛星の位置を計算
    const tempPair = new PuyoPair(axisX, axisY)
    tempPair.rotation = this.currentPuyoPair.rotation
    tempPair.updateSatellitePosition() // 現在の回転状態で衛星位置を更新

    const positions = tempPair.getPositions()

    // 軸と衛星の両方が移動可能かチェック
    for (const pos of positions) {
      if (!this.canMoveTo(pos.x, pos.y)) {
        return false
      }
    }

    return true
  }

  private fixPuyoPair(): void {
    if (!this.currentPuyoPair) return

    // ペアぷよの両方をフィールドに固定
    const positions = this.currentPuyoPair.getPositions()
    for (const pos of positions) {
      this.gameField.setPuyo(pos.x, pos.y, pos.color)
    }
  }

  private rotatePuyoPair(): void {
    if (!this.currentPuyoPair) return

    // 回転可能かチェック
    if (!this.canRotatePuyoPair()) return

    // 回転を実行
    this.currentPuyoPair.rotate()
  }

  private canRotatePuyoPair(): boolean {
    if (!this.currentPuyoPair) return false

    // 回転後の位置をテスト
    const tempPair = new PuyoPair(this.currentPuyoPair.axis.x, this.currentPuyoPair.axis.y)
    tempPair.rotation = (this.currentPuyoPair.rotation + 1) % 4
    tempPair.updateSatellitePosition() // 回転後の正しい位置を計算

    const positions = tempPair.getPositions()

    // 回転後の両方の位置が有効かチェック
    for (const pos of positions) {
      if (!this.canMoveTo(pos.x, pos.y)) {
        // 通常の回転が不可能な場合は壁キックを試す
        return this.tryWallKickPuyoPair()
      }
    }

    return true
  }

  private tryWallKickPuyoPair(): boolean {
    if (!this.currentPuyoPair) return false

    // 壁キックのオフセットパターン（左右に1マス移動を試す）
    const wallKickOffsets = [
      { x: -1, y: 0 }, // 左に1マス
      { x: 1, y: 0 }, // 右に1マス
      { x: 0, y: -1 }, // 上に1マス
    ]

    for (const offset of wallKickOffsets) {
      const testX = this.currentPuyoPair.axis.x + offset.x
      const testY = this.currentPuyoPair.axis.y + offset.y

      // 移動先で回転可能かテスト
      const tempPair = new PuyoPair(testX, testY)
      tempPair.rotation = (this.currentPuyoPair.rotation + 1) % 4
      tempPair.updateSatellitePosition() // 回転後の正しい位置を計算

      const positions = tempPair.getPositions()
      let canRotateHere = true

      for (const pos of positions) {
        if (!this.canMoveTo(pos.x, pos.y)) {
          canRotateHere = false
          break
        }
      }

      if (canRotateHere) {
        // 壁キック成功：位置を移動してから回転
        this.currentPuyoPair.moveTo(testX, testY)
        return true
      }
    }

    return false
  }

  private generateNewPuyoPair(): void {
    // ゲームオーバー判定：新しいぷよペアが初期位置に配置できるかチェック
    if (!this.canPuyoPairSpawn(2, 1)) {
      this.gameState = GameState.GAME_OVER
      this.currentPuyoPair = null
      // ゲームオーバー演出をトリガー
      if (this.gameOverCallback) {
        this.gameOverCallback()
      }
      return
    }

    this.currentPuyoPair = new PuyoPair(2, 1) // 中央上部に生成（衛星が上に来る場合を考慮してy=1）
  }

  private canPuyoPairSpawn(axisX: number, axisY: number): boolean {
    // 新しいぷよペアが生成される位置をチェック
    const tempPair = new PuyoPair(axisX, axisY)
    const positions = tempPair.getPositions()

    // 軸と衛星の両方が配置可能かチェック
    for (const pos of positions) {
      if (!this.canMoveTo(pos.x, pos.y)) {
        return false
      }
    }

    return true
  }

  public setGameOver(gameOver: boolean): void {
    this.gameState = gameOver ? GameState.GAME_OVER : GameState.PLAYING
  }

  public findConnectedPuyos(x: number, y: number, color: number): Array<{ x: number; y: number }> {
    return this.gameField.findConnectedPuyos(x, y, color)
  }

  public findErasableGroups(): Array<Array<{ x: number; y: number }>> {
    return this.gameField.findErasableGroups()
  }

  public erasePuyos(): number {
    return this.gameField.erasePuyos()
  }

  public applyGravity(): void {
    this.gameField.applyGravity()
  }

  public getChainCount(): number {
    return this.chainCount
  }

  private resetChainCount(): void {
    this.chainCount = 0
  }

  public getScore(): number {
    return this.score
  }

  private addScore(points: number): void {
    this.score += points
  }

  public resetScore(): void {
    this.score = 0
  }

  public isAllClear(): boolean {
    return this.gameField.isAllClear()
  }

  public setZenkeshiCallback(callback: () => void): void {
    this.gameLogic.setZenkeshiCallback(callback)
  }

  private triggerZenkeshiCallback(): void {
    // 全消し演出のトリガー（GameLogicから呼び出される）
  }

  // 後方互換性のためのメソッド
  public getChainBonus(chainCount: number): number {
    return ScoreCalculator.getChainBonus(chainCount)
  }

  public calculateChainScore(baseScore: number, chainCount: number): number {
    return ScoreCalculator.calculateChainScore(baseScore, chainCount)
  }

  public calculateErasureScore(erasedCount: number, chainCount: number): number {
    return ScoreCalculator.calculateErasureScore(erasedCount, chainCount)
  }

  public getZenkeshiBonus(): number {
    return ScoreCalculator.getZenkeshiBonus()
  }

  public calculateZenkeshiScore(): number {
    return ScoreCalculator.calculateZenkeshiScore(this.isAllClear())
  }

  public processChain(): void {
    const chainResult = this.gameLogic.processChain()
    this.chainCount = chainResult.chainCount
  }

  public addErasureScore(erasedCount: number, chainCount: number): void {
    const points = ScoreCalculator.calculateErasureScore(erasedCount, chainCount)
    this.addScore(points)
  }

  public setGameOverCallback(callback: () => void): void {
    this.gameOverCallback = callback
  }

  public restart(): void {
    // フィールドをクリア
    this.gameField.clear()

    // ゲーム状態をリセット
    this.gameState = GameState.PLAYING
    this.score = 0
    this.chainCount = 0
    this.puyoLanded = false

    // タイマーをリセット
    this.dropTimer = 0
    this.fastDropTimer = 0

    // キー状態をリセット
    this.keysPressed.clear()

    // 新しいぷよペアを生成
    this.generateNewPuyoPair()
  }
}
