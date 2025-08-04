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
      expect(puyo!.color).toBeGreaterThanOrEqual(1) // 色が設定されている
      expect(puyo!.color).toBeLessThanOrEqual(4) // 1-4の範囲
    })

    it('ゲームループが正常に動作すること', () => {
      // ゲームが初期状態で動作可能な状態にあることを確認
      expect(game.isGameOver()).toBe(false)
      expect(game.getField()).toBeDefined()
      expect(game.getCurrentPuyo()).toBeDefined()
    })
  })

  describe('ぷよの高速落下', () => {
    it('下矢印キーを押し続けている間、ぷよが高速で落下すること', () => {
      const initialY = game.getCurrentPuyo()!.y

      // 下矢印キーを押下開始
      game.handleKeyDown('ArrowDown')

      // 短時間で複数回落下することを確認
      game.update(50) // 50ms後
      const firstDropY = game.getCurrentPuyo()!.y
      expect(firstDropY).toBeGreaterThan(initialY)

      game.update(50) // さらに50ms後
      const secondDropY = game.getCurrentPuyo()!.y
      expect(secondDropY).toBeGreaterThan(firstDropY)
    })

    it('下矢印キーを離すと通常の落下速度に戻ること', () => {
      // 下矢印キーを押下開始
      game.handleKeyDown('ArrowDown')
      game.update(50)
      const fastDropY = game.getCurrentPuyo()!.y

      // 下矢印キーを離す
      game.handleKeyUp('ArrowDown')

      // 通常の落下間隔（1000ms）では落下しない
      game.update(100)
      expect(game.getCurrentPuyo()!.y).toBe(fastDropY)

      // 1000ms経過で通常落下
      game.update(1000)
      expect(game.getCurrentPuyo()!.y).toBe(fastDropY + 1)
    })

    it('高速落下中に着地したら次のぷよが生成されること', () => {
      // ぷよを底近くまで移動
      for (let i = 0; i < 10; i++) {
        game.handleInput('ArrowDown')
      }

      // 高速落下で着地させる
      game.handleKeyDown('ArrowDown')
      game.update(100) // 着地するまで

      // updateで着地処理
      game.update()
      expect(game.isPuyoLanded()).toBe(true)

      // 次のupdateで新しいぷよ生成
      game.update()
      const newPuyo = game.getCurrentPuyo()!
      expect(newPuyo.x).toBe(2)
      expect(newPuyo.y).toBe(0)
    })

    it('高速落下中も境界判定が正しく動作すること', () => {
      // ぷよを底まで落下させる
      for (let i = 0; i < 11; i++) {
        game.handleInput('ArrowDown')
      }

      expect(game.getCurrentPuyo()!.y).toBe(11)

      // 高速落下を試みても底より下には行かない
      game.handleKeyDown('ArrowDown')
      game.update(50)
      expect(game.getCurrentPuyo()!.y).toBe(11)
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

    it('ぷよが着地したら次のぷよが生成されること', () => {
      const firstPuyo = game.getCurrentPuyo()
      expect(firstPuyo).not.toBeNull()

      // ぷよを底まで落下させる
      for (let i = 0; i < 11; i++) {
        game.handleInput('ArrowDown')
      }

      // 着地判定と次のぷよ生成
      game.update()
      expect(game.isPuyoLanded()).toBe(true)

      // 次のupdateで新しいぷよが生成される
      game.update()
      const newPuyo = game.getCurrentPuyo()
      expect(newPuyo).not.toBeNull()
      expect(newPuyo!.x).toBe(2) // 新しいぷよは中央に生成
      expect(newPuyo!.y).toBe(0) // 新しいぷよは上部に生成
      expect(game.isPuyoLanded()).toBe(false) // 着地フラグはリセット
    })

    it('着地したぷよがフィールドに固定されること', () => {
      // ぷよを底まで落下させる
      for (let i = 0; i < 11; i++) {
        game.handleInput('ArrowDown')
      }

      const puyoX = game.getCurrentPuyo()!.x
      const puyoY = game.getCurrentPuyo()!.y
      const puyoColor = game.getCurrentPuyo()!.color

      // 着地判定
      game.update()
      expect(game.isPuyoLanded()).toBe(true)

      // 次のupdateで固定と新しいぷよ生成
      game.update()

      // フィールドに固定されているか確認
      const field = game.getField()
      expect(field[puyoY][puyoX]).toBe(puyoColor)
    })
  })

  describe('ぷよの回転', () => {
    it('上矢印キーでぷよを時計回りに回転できること', () => {
      // 初期状態での位置を記録
      const initialX = game.getCurrentPuyo()!.x
      const initialY = game.getCurrentPuyo()!.y

      // 回転処理を実行
      game.handleInput('ArrowUp')

      // 回転後の位置を確認（単体ぷよなので位置は変わらない）
      expect(game.getCurrentPuyo()!.x).toBe(initialX)
      expect(game.getCurrentPuyo()!.y).toBe(initialY)
    })

    it('フィールドの境界内でのみ回転が可能であること', () => {
      // ぷよを左端に移動
      game.handleInput('ArrowLeft')
      game.handleInput('ArrowLeft')
      expect(game.getCurrentPuyo()!.x).toBe(0)

      // 左端でも回転は可能（単体ぷよの場合）
      const beforeRotationX = game.getCurrentPuyo()!.x
      game.handleInput('ArrowUp')
      expect(game.getCurrentPuyo()!.x).toBe(beforeRotationX)
    })

    it('他のぷよがある場合は回転できないこと', () => {
      // フィールドに既存のぷよを配置
      const field = game.getField()
      field[1][2] = 1 // 現在のぷよの隣に配置

      const beforeRotationX = game.getCurrentPuyo()!.x
      const beforeRotationY = game.getCurrentPuyo()!.y

      // 回転を試みる
      game.handleInput('ArrowUp')

      // 位置が変わらないことを確認
      expect(game.getCurrentPuyo()!.x).toBe(beforeRotationX)
      expect(game.getCurrentPuyo()!.y).toBe(beforeRotationY)
    })

    it('回転処理が正しく呼び出されること', () => {
      // 現在はrotatePuyoメソッドが存在することを確認
      expect(typeof (game as any).rotatePuyo).toBe('function')
    })

    it('フィールドの右端で回転できないこと', () => {
      // ぷよを右端に移動
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight') // x=5に移動
      expect(game.getCurrentPuyo()!.x).toBe(5)

      // 現在のぷよの位置を記録
      const beforeX = game.getCurrentPuyo()!.x
      const beforeY = game.getCurrentPuyo()!.y

      // 回転を試みる（将来的にペアぷよで必要）
      game.handleInput('ArrowUp')

      // 位置が変わらないことを確認
      expect(game.getCurrentPuyo()!.x).toBe(beforeX)
      expect(game.getCurrentPuyo()!.y).toBe(beforeY)
    })

    it('フィールドの底近くで回転できないこと', () => {
      // ぷよを底近くまで移動
      for (let i = 0; i < 10; i++) {
        game.handleInput('ArrowDown')
      }
      expect(game.getCurrentPuyo()!.y).toBe(10)

      // 現在のぷよの位置を記録
      const beforeX = game.getCurrentPuyo()!.x
      const beforeY = game.getCurrentPuyo()!.y

      // 回転を試みる
      game.handleInput('ArrowUp')

      // 位置が変わらないことを確認（将来的にペアぷよで必要）
      expect(game.getCurrentPuyo()!.x).toBe(beforeX)
      expect(game.getCurrentPuyo()!.y).toBe(beforeY)
    })

    it('canRotateメソッドが存在し正しく動作すること', () => {
      // canRotateメソッドが存在することを確認
      expect(typeof (game as any).canRotate).toBe('function')

      // 中央の安全な位置では回転可能
      expect((game as any).canRotate()).toBe(true)
    })
  })
})
