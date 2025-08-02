import { describe, it, expect, beforeEach } from 'vitest'
import { Game } from './Game'
import { GameState } from './GameState'
import { PuyoColor } from './Puyo'

describe('Game - ゲームオーバー判定', () => {
  let game: Game

  beforeEach(() => {
    game = new Game()
    game.start()
  })

  describe('ゲームオーバー判定', () => {
    it('新しいぷよが配置できない場合はゲームオーバーになる', () => {
      const field = game.getField()

      // フィールドの上部（初期ぷよ生成位置）にぷよを配置
      // PuyoPair.create()のデフォルト位置は(2, 0)と(2, -1)
      field.setCell(2, 0, PuyoColor.RED)
      field.setCell(2, -1, PuyoColor.BLUE) // y=-1はフィールド外だが、ゲームオーバー判定に使用

      // 新しいぷよ生成を試行
      game.checkGameOver()

      expect(game.getState()).toBe(GameState.GAME_OVER)
    })

    it('新しいぷよが配置できる場合はゲーム継続', () => {
      const field = game.getField()

      // フィールドの下部にのみぷよを配置
      field.setCell(0, 10, PuyoColor.RED)
      field.setCell(1, 10, PuyoColor.BLUE)

      // ゲーム状態をチェック
      game.checkGameOver()

      expect(game.getState()).toBe(GameState.PLAYING)
    })

    it('フィールドが満杯に近い状態でゲームオーバーになる', () => {
      const field = game.getField()

      // フィールドを上まで積み上げる（x=2の列を満杯にする）
      for (let y = 10; y >= 0; y--) {
        field.setCell(2, y, PuyoColor.RED)
      }

      // ゲームオーバー判定
      game.checkGameOver()

      expect(game.getState()).toBe(GameState.GAME_OVER)
    })

    it('ゲームオーバー後は操作を受け付けない', () => {
      // ゲームオーバー状態にする
      game.setGameState(GameState.GAME_OVER)

      // 操作を試行
      const result = game.movePuyo(1, 0)

      expect(result).toBe(false)
      expect(game.getState()).toBe(GameState.GAME_OVER)
    })

    it('ゲームオーバー後は回転操作を受け付けない', () => {
      // ゲームオーバー状態にする
      game.setGameState(GameState.GAME_OVER)

      // 回転操作を試行
      const result = game.rotatePuyo()

      expect(result).toBe(false)
      expect(game.getState()).toBe(GameState.GAME_OVER)
    })
  })

  describe('リスタート機能', () => {
    it('restart()でゲームを初期状態にリセットできる', () => {
      const field = game.getField()

      // フィールドにぷよを配置
      field.setCell(0, 10, PuyoColor.RED)
      field.setCell(1, 10, PuyoColor.BLUE)

      // スコアを変更
      field.setCell(0, 9, PuyoColor.RED)
      field.setCell(1, 9, PuyoColor.RED)
      field.setCell(0, 8, PuyoColor.RED)
      field.setCell(1, 8, PuyoColor.RED)
      game.processClearAndGravity()

      const scoreBeforeRestart = game.getScore()
      expect(scoreBeforeRestart).toBeGreaterThan(0)

      // リスタート
      game.restart()

      // 初期状態に戻ったかチェック
      expect(game.getState()).toBe(GameState.PLAYING)
      expect(game.getScore()).toBe(0)
      expect(game.getChainCount()).toBe(0)
      expect(game.getCurrentPuyo()).not.toBeNull()

      // リスタート後の新しいフィールドを取得
      const newField = game.getField()

      // フィールドが空になったかチェック（新しいぷよの位置以外）
      for (let x = 0; x < newField.getWidth(); x++) {
        for (let y = 0; y < newField.getHeight(); y++) {
          const cell = newField.getCell(x, y)
          if (cell !== null) {
            console.log(`Non-null cell found at (${x}, ${y}): ${cell}`)
          }
          // 新しいぷよが配置されている位置(2, 0)はスキップ
          if (x === 2 && y === 0) continue
          expect(newField.getCell(x, y)).toBeNull()
        }
      }
    })

    it('ゲームオーバー状態からリスタートできる', () => {
      // ゲームオーバー状態にする
      game.setGameState(GameState.GAME_OVER)

      // リスタート
      game.restart()

      expect(game.getState()).toBe(GameState.PLAYING)
      expect(game.getCurrentPuyo()).not.toBeNull()
    })
  })
})
