import { describe, it, expect, beforeEach } from 'vitest'
import { Game } from './Game'

describe('Game', () => {
  let game: Game

  beforeEach(() => {
    game = new Game()
  })

  describe('新しいゲームを開始', () => {
    it('ゲームの初期化処理を実装する', () => {
      expect(game).toBeDefined()
      expect(game.isGameOver()).toBe(false)
    })

    it('ゲーム画面を表示する', () => {
      expect(game.getField()).toBeDefined()
      const field = game.getField()
      expect(field).toHaveLength(12) // 12行
      expect(field[0]).toHaveLength(6) // 6列
    })

    it('新しいぷよを生成する', () => {
      const puyo = game.getCurrentPuyo()
      expect(puyo).toBeDefined()
      expect(puyo).not.toBeNull()
    })

    it('ぷよが画面に表示されること', () => {
      const puyo = game.getCurrentPuyo()
      expect(puyo).not.toBeNull()
      expect(puyo!.x).toBe(2) // 中央に生成
      expect(puyo!.y).toBe(0) // 上部に生成
      expect(puyo!.color).toBe(1) // 色が設定されている
    })

    it('ゲームループが正常に動作すること', () => {
      // ゲームが初期状態で動作可能な状態にあることを確認
      expect(game.isGameOver()).toBe(false)
      expect(game.getField()).toBeDefined()
      expect(game.getCurrentPuyo()).toBeDefined()
    })
  })

  describe('ぷよの移動', () => {
    it('ぷよが自動的に落下すること', () => {
      const initialY = game.getCurrentPuyo()!.y
      game.update()
      const newY = game.getCurrentPuyo()!.y
      expect(newY).toBe(initialY + 1)
    })

    it('一定時間経過後にぷよが落下すること', () => {
      const initialY = game.getCurrentPuyo()!.y
      // 落下に必要な時間が経過していない場合
      game.update(100) // 100ms
      expect(game.getCurrentPuyo()!.y).toBe(initialY)

      // 落下に必要な時間が経過した場合
      game.update(1000) // 1000ms (1秒)
      expect(game.getCurrentPuyo()!.y).toBe(initialY + 1)
    })

    it('左矢印キーでぷよを左に移動できること', () => {
      const initialX = game.getCurrentPuyo()!.x
      game.handleInput('ArrowLeft')
      const newX = game.getCurrentPuyo()!.x
      expect(newX).toBe(initialX - 1)
    })

    it('右矢印キーでぷよを右に移動できること', () => {
      const initialX = game.getCurrentPuyo()!.x
      game.handleInput('ArrowRight')
      const newX = game.getCurrentPuyo()!.x
      expect(newX).toBe(initialX + 1)
    })

    it('下矢印キーでぷよを高速落下できること', () => {
      const initialY = game.getCurrentPuyo()!.y
      game.handleInput('ArrowDown')
      const newY = game.getCurrentPuyo()!.y
      expect(newY).toBe(initialY + 1)
    })

    it('フィールドの左端で左に移動できないこと', () => {
      // ぷよを左端に移動
      game.handleInput('ArrowLeft')
      game.handleInput('ArrowLeft')
      game.handleInput('ArrowLeft') // x=2から左端(x=0)まで移動

      const currentX = game.getCurrentPuyo()!.x
      expect(currentX).toBe(0)

      // さらに左に移動しようとしても移動しない
      game.handleInput('ArrowLeft')
      expect(game.getCurrentPuyo()!.x).toBe(0)
    })

    it('フィールドの右端で右に移動できないこと', () => {
      // ぷよを右端に移動
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight') // x=2から右端(x=5)まで移動

      const currentX = game.getCurrentPuyo()!.x
      expect(currentX).toBe(5)

      // さらに右に移動しようとしても移動しない
      game.handleInput('ArrowRight')
      expect(game.getCurrentPuyo()!.x).toBe(5)
    })

    it('フィールドの底で下に移動できないこと', () => {
      // ぷよを底まで落下させる
      for (let i = 0; i < 12; i++) {
        game.handleInput('ArrowDown')
      }

      const currentY = game.getCurrentPuyo()!.y
      expect(currentY).toBe(11) // 底はy=11

      // さらに下に移動しようとしても移動しない
      game.handleInput('ArrowDown')
      expect(game.getCurrentPuyo()!.y).toBe(11)
    })

    it('ぷよが底に着地したことを検出できること', () => {
      // ぷよを底まで落下させる
      for (let i = 0; i < 11; i++) {
        game.handleInput('ArrowDown')
      }

      expect(game.getCurrentPuyo()!.y).toBe(11)
      expect(game.isPuyoLanded()).toBe(false) // まだ着地していない

      // updateを呼ぶと着地判定が行われる
      game.update()
      expect(game.isPuyoLanded()).toBe(true)
    })

    it('他のぷよの上に着地したことを検出できること', () => {
      // フィールドの底に既存のぷよを配置
      const field = game.getField()
      field[10][2] = 1 // y=10, x=2に既存のぷよ

      // ぷよを落下させる
      for (let i = 0; i < 9; i++) {
        game.handleInput('ArrowDown')
      }

      expect(game.getCurrentPuyo()!.y).toBe(9)
      expect(game.isPuyoLanded()).toBe(false)

      // updateを呼ぶと着地判定が行われる
      game.update()
      expect(game.isPuyoLanded()).toBe(true)
    })
  })
})
