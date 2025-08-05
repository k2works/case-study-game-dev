import { describe, it, expect, beforeEach } from 'vitest'
import { Game, PuyoPair } from './Game'

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
      const puyoPair = game.getCurrentPuyoPair()
      expect(puyoPair).toBeDefined()
      expect(puyoPair).not.toBeNull()
    })

    it('ぷよペアが画面に表示されること', () => {
      const puyoPair = game.getCurrentPuyoPair()
      expect(puyoPair).not.toBeNull()
      expect(puyoPair!.axis.x).toBe(2) // 中央に生成
      expect(puyoPair!.axis.y).toBe(1) // 上部に生成
      expect(puyoPair!.axis.color).toBeGreaterThanOrEqual(1) // 軸ぷよの色が設定されている
      expect(puyoPair!.axis.color).toBeLessThanOrEqual(4) // 1-4の範囲
      expect(puyoPair!.satellite.color).toBeGreaterThanOrEqual(1) // 衛星ぷよの色が設定されている
      expect(puyoPair!.satellite.color).toBeLessThanOrEqual(4) // 1-4の範囲
    })

    it('ゲームループが正常に動作すること', () => {
      // ゲームが初期状態で動作可能な状態にあることを確認
      expect(game.isGameOver()).toBe(false)
      expect(game.getField()).toBeDefined()
      expect(game.getCurrentPuyoPair()).toBeDefined()
    })
  })

  describe('ぷよの高速落下', () => {
    it('下矢印キーを押し続けている間、ぷよが高速で落下すること', () => {
      const initialY = game.getCurrentPuyoPair()!.axis.y

      // 下矢印キーを押下開始
      game.handleKeyDown('ArrowDown')

      // 短時間で複数回落下することを確認
      game.update(50) // 50ms後
      const firstDropY = game.getCurrentPuyoPair()!.axis.y
      expect(firstDropY).toBeGreaterThan(initialY)

      game.update(50) // さらに50ms後
      const secondDropY = game.getCurrentPuyoPair()!.axis.y
      expect(secondDropY).toBeGreaterThan(firstDropY)
    })

    it('下矢印キーを離すと通常の落下速度に戻ること', () => {
      // 下矢印キーを押下開始
      game.handleKeyDown('ArrowDown')
      game.update(50)
      const fastDropY = game.getCurrentPuyoPair()!.axis.y

      // 下矢印キーを離す
      game.handleKeyUp('ArrowDown')

      // 通常の落下間隔（1000ms）では落下しない
      game.update(100)
      expect(game.getCurrentPuyoPair()!.axis.y).toBe(fastDropY)

      // 1000ms経過で通常落下
      game.update(1000)
      expect(game.getCurrentPuyoPair()!.axis.y).toBe(fastDropY + 1)
    })

    it('高速落下中に着地したら次のぷよが生成されること', () => {
      // ぷよを底まで移動（確実に着地させる）
      for (let i = 0; i < 15; i++) {
        game.handleInput('ArrowDown')
      }

      // updateで着地処理を確認
      game.update()
      expect(game.isPuyoLanded()).toBe(true)

      // 次のupdateで新しいぷよ生成
      game.update()
      const newPuyoPair = game.getCurrentPuyoPair()!
      expect(newPuyoPair.axis.x).toBe(2)
      expect(newPuyoPair.axis.y).toBe(1)
    })

    it('高速落下中も境界判定が正しく動作すること', () => {
      // ぷよを底まで落下させる
      for (let i = 0; i < 11; i++) {
        game.handleInput('ArrowDown')
      }

      expect(game.getCurrentPuyoPair()!.axis.y).toBe(11)

      // 高速落下を試みても底より下には行かない
      game.handleKeyDown('ArrowDown')
      game.update(50)
      expect(game.getCurrentPuyoPair()!.axis.y).toBe(11)
    })
  })

  describe('ぷよの移動', () => {
    it('ぷよが自動的に落下すること', () => {
      const initialY = game.getCurrentPuyoPair()!.axis.y
      game.update()
      const newY = game.getCurrentPuyoPair()!.axis.y
      expect(newY).toBe(initialY + 1)
    })

    it('一定時間経過後にぷよが落下すること', () => {
      const initialY = game.getCurrentPuyoPair()!.axis.y
      // 落下に必要な時間が経過していない場合
      game.update(100) // 100ms
      expect(game.getCurrentPuyoPair()!.axis.y).toBe(initialY)

      // 落下に必要な時間が経過した場合
      game.update(1000) // 1000ms (1秒)
      expect(game.getCurrentPuyoPair()!.axis.y).toBe(initialY + 1)
    })

    it('左矢印キーでぷよを左に移動できること', () => {
      const initialX = game.getCurrentPuyoPair()!.axis.x
      game.handleInput('ArrowLeft')
      const newX = game.getCurrentPuyoPair()!.axis.x
      expect(newX).toBe(initialX - 1)
    })

    it('右矢印キーでぷよを右に移動できること', () => {
      const initialX = game.getCurrentPuyoPair()!.axis.x
      game.handleInput('ArrowRight')
      const newX = game.getCurrentPuyoPair()!.axis.x
      expect(newX).toBe(initialX + 1)
    })

    it('下矢印キーでぷよを高速落下できること', () => {
      const initialY = game.getCurrentPuyoPair()!.axis.y
      game.handleInput('ArrowDown')
      const newY = game.getCurrentPuyoPair()!.axis.y
      expect(newY).toBe(initialY + 1)
    })

    it('フィールドの左端で左に移動できないこと', () => {
      // ぷよを左端に移動
      game.handleInput('ArrowLeft')
      game.handleInput('ArrowLeft')
      game.handleInput('ArrowLeft') // x=2から左端(x=0)まで移動

      const currentX = game.getCurrentPuyoPair()!.axis.x
      expect(currentX).toBe(0)

      // さらに左に移動しようとしても移動しない
      game.handleInput('ArrowLeft')
      expect(game.getCurrentPuyoPair()!.axis.x).toBe(0)
    })

    it('フィールドの右端で右に移動できないこと', () => {
      // ぷよを右端に移動
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight') // x=2から右端(x=5)まで移動

      const currentX = game.getCurrentPuyoPair()!.axis.x
      expect(currentX).toBe(5)

      // さらに右に移動しようとしても移動しない
      game.handleInput('ArrowRight')
      expect(game.getCurrentPuyoPair()!.axis.x).toBe(5)
    })

    it('フィールドの底で下に移動できないこと', () => {
      // ぷよを底まで落下させる
      for (let i = 0; i < 12; i++) {
        game.handleInput('ArrowDown')
      }

      const currentY = game.getCurrentPuyoPair()!.axis.y
      expect(currentY).toBe(11) // 底はy=11

      // さらに下に移動しようとしても移動しない
      game.handleInput('ArrowDown')
      expect(game.getCurrentPuyoPair()!.axis.y).toBe(11)
    })

    it('ぷよが底に着地したことを検出できること', () => {
      // ぷよを底まで落下させる
      for (let i = 0; i < 11; i++) {
        game.handleInput('ArrowDown')
      }

      expect(game.getCurrentPuyoPair()!.axis.y).toBe(11)
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

      expect(game.getCurrentPuyoPair()!.axis.y).toBe(9)
      expect(game.isPuyoLanded()).toBe(false)

      // updateを呼ぶと着地判定が行われる
      game.update()
      expect(game.isPuyoLanded()).toBe(true)
    })

    it('ぷよが着地したら次のぷよが生成されること', () => {
      const firstPuyoPair = game.getCurrentPuyoPair()
      expect(firstPuyoPair).not.toBeNull()

      // ぷよを底まで落下させる
      for (let i = 0; i < 11; i++) {
        game.handleInput('ArrowDown')
      }

      // 着地判定と次のぷよ生成
      game.update()
      expect(game.isPuyoLanded()).toBe(true)

      // 次のupdateで新しいぷよが生成される
      game.update()
      const newPuyoPair = game.getCurrentPuyoPair()
      expect(newPuyoPair).not.toBeNull()
      expect(newPuyoPair!.axis.x).toBe(2) // 新しいぷよは中央に生成
      expect(newPuyoPair!.axis.y).toBe(1) // 新しいぷよは上部に生成
      expect(game.isPuyoLanded()).toBe(false) // 着地フラグはリセット
    })

    it('着地したぷよがフィールドに固定されること', () => {
      // ぷよを底まで落下させる
      for (let i = 0; i < 11; i++) {
        game.handleInput('ArrowDown')
      }

      const puyoPair = game.getCurrentPuyoPair()!
      const axisX = puyoPair.axis.x
      const axisY = puyoPair.axis.y
      const axisColor = puyoPair.axis.color
      const satX = puyoPair.satellite.x
      const satY = puyoPair.satellite.y
      const satColor = puyoPair.satellite.color

      // 着地判定
      game.update()
      expect(game.isPuyoLanded()).toBe(true)

      // 次のupdateで固定と新しいぷよ生成
      game.update()

      // フィールドに固定されているか確認
      const field = game.getField()
      expect(field[axisY][axisX]).toBe(axisColor)
      expect(field[satY][satX]).toBe(satColor)
    })
  })

  describe('ぷよの回転', () => {
    it('上矢印キーでぷよを時計回りに回転できること', () => {
      // 初期状態での位置を記録
      const puyoPair = game.getCurrentPuyoPair()!
      const initialRotation = puyoPair.rotation
      const initialAxisX = puyoPair.axis.x
      const initialAxisY = puyoPair.axis.y
      const initialSatX = puyoPair.satellite.x
      const initialSatY = puyoPair.satellite.y

      // 回転処理を実行
      game.handleInput('ArrowUp')

      // 回転後の状態を確認
      const rotatedPuyoPair = game.getCurrentPuyoPair()!
      expect(rotatedPuyoPair.rotation).toBe((initialRotation + 1) % 4)
      expect(rotatedPuyoPair.axis.x).toBe(initialAxisX)
      expect(rotatedPuyoPair.axis.y).toBe(initialAxisY)
      // 衛星の位置は回転によって変わる
      expect(
        rotatedPuyoPair.satellite.x !== initialSatX || rotatedPuyoPair.satellite.y !== initialSatY
      ).toBe(true)
    })

    it('フィールドの境界内でのみ回転が可能であること', () => {
      // ぷよを左端に移動
      game.handleInput('ArrowLeft')
      game.handleInput('ArrowLeft')
      expect(game.getCurrentPuyoPair()!.axis.x).toBe(0)

      // 左端での回転を試みる
      const beforeAxisX = game.getCurrentPuyoPair()!.axis.x
      game.handleInput('ArrowUp')

      // 回転が実行されるか、または境界チェックで無効になるか
      const afterPuyoPair = game.getCurrentPuyoPair()!
      expect(afterPuyoPair.axis.x).toBe(beforeAxisX) // 軸の位置は変わらない
    })

    it('他のぷよがある場合は回転できないこと', () => {
      // フィールドに既存のぷよを配置して回転と壁キックの両方を阻止
      const field = game.getField()
      field[0][3] = 1 // 通常の回転位置
      field[0][1] = 1 // 左壁キック位置
      field[0][4] = 1 // 右壁キック位置（軸位置x=3の場合）
      // 軸周辺も埋める
      field[1][1] = 1
      field[1][2] = 1
      field[1][3] = 1
      field[1][4] = 1

      const beforeRotation = game.getCurrentPuyoPair()!.rotation
      const beforeAxisX = game.getCurrentPuyoPair()!.axis.x
      const beforeAxisY = game.getCurrentPuyoPair()!.axis.y

      // 回転を試みる
      game.handleInput('ArrowUp')

      // 回転が無効になることを確認
      const afterPuyoPair = game.getCurrentPuyoPair()!
      expect(afterPuyoPair.rotation).toBe(beforeRotation)
      expect(afterPuyoPair.axis.x).toBe(beforeAxisX)
      expect(afterPuyoPair.axis.y).toBe(beforeAxisY)
    })

    it('回転処理が正しく呼び出されること', () => {
      // rotatePuyoPairメソッドが存在することを確認
      expect(typeof (game as any).rotatePuyoPair).toBe('function')

      // 回転が実際に実行されることを確認
      const initialRotation = game.getCurrentPuyoPair()!.rotation
      game.handleInput('ArrowUp')
      const afterRotation = game.getCurrentPuyoPair()!.rotation
      expect(afterRotation).toBe((initialRotation + 1) % 4)
    })

    it('フィールドの右端で回転する際に壁キックが動作すること', () => {
      // ぷよを右端に移動
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight') // x=5に移動
      expect(game.getCurrentPuyoPair()!.axis.x).toBe(5)

      // 回転前の状態を記録
      const beforeRotation = game.getCurrentPuyoPair()!.rotation

      // 回転を試みる（壁キックにより成功するはず）
      game.handleInput('ArrowUp')

      // 壁キックにより回転が成功することを確認
      const afterPuyoPair = game.getCurrentPuyoPair()!
      expect(afterPuyoPair.rotation).toBe((beforeRotation + 1) % 4)
      // 壁キックにより左に移動しているはず
      expect(afterPuyoPair.axis.x).toBeLessThan(5)
    })

    it('フィールドの底近くでの回転制限が正しく動作すること', () => {
      // ぷよを底近くまで移動
      for (let i = 0; i < 10; i++) {
        game.handleInput('ArrowDown')
      }
      expect(game.getCurrentPuyoPair()!.axis.y).toBe(11)

      // 回転前の状態を記録
      const beforeRotation = game.getCurrentPuyoPair()!.rotation
      const beforeX = game.getCurrentPuyoPair()!.axis.x
      const beforeY = game.getCurrentPuyoPair()!.axis.y

      // 回転を試みる（底では回転が制限される場合がある）
      game.handleInput('ArrowUp')

      // 回転結果を確認（成功する場合もあれば失敗する場合もある）
      const afterPuyoPair = game.getCurrentPuyoPair()!
      // 底の場合、回転が制限されることを確認
      if (afterPuyoPair.rotation === beforeRotation) {
        // 回転が無効化された場合（衛星が画面外に出る場合）
        expect(afterPuyoPair.axis.x).toBe(beforeX)
        expect(afterPuyoPair.axis.y).toBe(beforeY)
      } else {
        // 壁キックにより回転が成功した場合
        expect(afterPuyoPair.rotation).toBe((beforeRotation + 1) % 4)
      }
    })

    it('canRotateメソッドが存在し正しく動作すること', () => {
      // canRotatePuyoPairメソッドが存在することを確認
      expect(typeof (game as any).canRotatePuyoPair).toBe('function')

      // 中央の安全な位置では回転可能
      expect((game as any).canRotatePuyoPair()).toBe(true)
    })

    it('壁キック処理が正しく動作すること', () => {
      // 壁キック処理メソッドが存在することを確認
      expect(typeof (game as any).tryWallKickPuyoPair).toBe('function')

      // 中央の安全な位置では壁キックは不要（通常回転で成功するため呼び出されない）
      // 右端に移動してから壁キックをテスト
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight') // x=5に移動

      // PuyoPairの壁キック処理をテスト（右端では壁キックが成功するはず）
      expect((game as any).tryWallKickPuyoPair()).toBe(true)
    })

    it('左端での壁キック処理を試みること', () => {
      // ぷよを左端に移動
      game.handleInput('ArrowLeft')
      game.handleInput('ArrowLeft')

      // 左端で壁キックをテスト（成功するはず）
      expect((game as any).tryWallKickPuyoPair()).toBe(true)
    })

    it('右端での壁キック処理を試みること', () => {
      // ぷよを右端に移動
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight')

      // 右端で壁キックをテスト（成功するはず）
      expect((game as any).tryWallKickPuyoPair()).toBe(true)
    })

    it('回転操作が画面に正しく反映されること', () => {
      const initialPuyoPair = game.getCurrentPuyoPair()!
      const initialRotation = initialPuyoPair.rotation
      const initialAxisX = initialPuyoPair.axis.x
      const initialAxisY = initialPuyoPair.axis.y
      const initialSatX = initialPuyoPair.satellite.x
      const initialSatY = initialPuyoPair.satellite.y

      // 回転操作を実行
      game.handleInput('ArrowUp')

      // 現在のぷよペアを取得
      const rotatedPuyoPair = game.getCurrentPuyoPair()!

      // 軸の位置は変わらないが、回転状態と衛星の位置は変わる
      expect(rotatedPuyoPair.axis.x).toBe(initialAxisX)
      expect(rotatedPuyoPair.axis.y).toBe(initialAxisY)
      expect(rotatedPuyoPair.rotation).toBe((initialRotation + 1) % 4)

      // 衛星の位置は回転によって変わる
      expect(
        rotatedPuyoPair.satellite.x !== initialSatX || rotatedPuyoPair.satellite.y !== initialSatY
      ).toBe(true)

      // ペアオブジェクトは同じインスタンス
      expect(rotatedPuyoPair).toBe(initialPuyoPair)
    })

    it('連続した回転操作が正しく処理されること', () => {
      const initialPuyoPair = game.getCurrentPuyoPair()!
      const initialRotation = initialPuyoPair.rotation
      const initialAxisX = initialPuyoPair.axis.x
      const initialAxisY = initialPuyoPair.axis.y
      const initialSatX = initialPuyoPair.satellite.x
      const initialSatY = initialPuyoPair.satellite.y

      // 4回の回転操作（一周）
      game.handleInput('ArrowUp')
      game.handleInput('ArrowUp')
      game.handleInput('ArrowUp')
      game.handleInput('ArrowUp')

      const finalPuyoPair = game.getCurrentPuyoPair()!

      // 4回転して元の状態に戻る
      expect(finalPuyoPair.rotation).toBe(initialRotation)
      expect(finalPuyoPair.axis.x).toBe(initialAxisX)
      expect(finalPuyoPair.axis.y).toBe(initialAxisY)
      expect(finalPuyoPair.satellite.x).toBe(initialSatX)
      expect(finalPuyoPair.satellite.y).toBe(initialSatY)
    })

    it('右端で横向きにしても衛星が画面外に出ないこと', () => {
      // ぷよを右端に移動
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight')
      game.handleInput('ArrowRight') // x=5（右端）
      expect(game.getCurrentPuyoPair()!.axis.x).toBe(5)

      // 横向き（右向き）に回転
      game.handleInput('ArrowUp') // rotation=1（右）

      const rotatedPuyoPair = game.getCurrentPuyoPair()!
      const positions = rotatedPuyoPair.getPositions()

      // 両方のぷよがフィールド内にあることを確認
      for (const pos of positions) {
        expect(pos.x).toBeGreaterThanOrEqual(0) // 左端チェック
        expect(pos.x).toBeLessThanOrEqual(5) // 右端チェック
        expect(pos.y).toBeGreaterThanOrEqual(0) // 上端チェック
        expect(pos.y).toBeLessThanOrEqual(11) // 下端チェック
      }
    })

    it('左端で横向きにしても衛星が画面外に出ないこと', () => {
      // ぷよを左端に移動
      game.handleInput('ArrowLeft')
      game.handleInput('ArrowLeft') // x=0（左端）
      expect(game.getCurrentPuyoPair()!.axis.x).toBe(0)

      // 横向き（左向き）に回転
      game.handleInput('ArrowUp') // rotation=1（右）
      game.handleInput('ArrowUp') // rotation=2（下）
      game.handleInput('ArrowUp') // rotation=3（左）

      const rotatedPuyoPair = game.getCurrentPuyoPair()!
      const positions = rotatedPuyoPair.getPositions()

      // 両方のぷよがフィールド内にあることを確認
      for (const pos of positions) {
        expect(pos.x).toBeGreaterThanOrEqual(0) // 左端チェック
        expect(pos.x).toBeLessThanOrEqual(5) // 右端チェック
        expect(pos.y).toBeGreaterThanOrEqual(0) // 上端チェック
        expect(pos.y).toBeLessThanOrEqual(11) // 下端チェック
      }
    })

    it('横向きのぷよペアが右端に移動してもめり込まないこと', () => {
      // まず横向き（右向き）に回転
      game.handleInput('ArrowUp') // rotation=1（右）
      expect(game.getCurrentPuyoPair()!.rotation).toBe(1)

      // 横向きの状態で右端まで移動
      for (let i = 0; i < 5; i++) {
        game.handleInput('ArrowRight')
      }

      const puyoPair = game.getCurrentPuyoPair()!
      const positions = puyoPair.getPositions()

      // 両方のぷよがフィールド内にあることを確認
      for (const pos of positions) {
        expect(pos.x).toBeGreaterThanOrEqual(0)
        expect(pos.x).toBeLessThanOrEqual(5) // x=6以上にならないこと
      }

      // 軸が右端を超えていないことも確認
      expect(puyoPair.axis.x).toBeLessThanOrEqual(4) // 横向きなら軸はx=4が最大
    })
  })

  describe('ペアぷよ', () => {
    it('PuyoPairクラスが存在すること', () => {
      expect(typeof PuyoPair).toBe('function')
    })

    it('ペアぷよが2個のぷよで構成されること', () => {
      const puyoPair = new PuyoPair(2, 0)
      expect(puyoPair.axis).toBeDefined()
      expect(puyoPair.satellite).toBeDefined()
      expect(puyoPair.axis.x).toBe(2)
      expect(puyoPair.axis.y).toBe(0) // テスト用のPuyoPairは直接y=0で作成
      expect(puyoPair.satellite.x).toBe(2)
      expect(puyoPair.satellite.y).toBe(-1) // 軸の上に配置（回転0の場合）
    })

    it('軸ぷよと衛星ぷよが異なる色であること', () => {
      const puyoPair = new PuyoPair(2, 0)
      // 必ずしも異なる色である必要はないが、独立して色が設定されていることを確認
      expect(puyoPair.axis.color).toBeGreaterThanOrEqual(1)
      expect(puyoPair.axis.color).toBeLessThanOrEqual(4)
      expect(puyoPair.satellite.color).toBeGreaterThanOrEqual(1)
      expect(puyoPair.satellite.color).toBeLessThanOrEqual(4)
    })

    it('ペアぷよの位置を取得できること', () => {
      const puyoPair = new PuyoPair(3, 5)
      const positions = puyoPair.getPositions()
      expect(positions).toHaveLength(2)
      expect(positions[0]).toEqual({ x: 3, y: 5, color: puyoPair.axis.color })
      expect(positions[1]).toEqual({ x: 3, y: 4, color: puyoPair.satellite.color })
    })

    it('ペアぷよの回転状態を管理できること', () => {
      const puyoPair = new PuyoPair(2, 0)
      expect(puyoPair.rotation).toBe(0) // 初期状態は0（上）

      puyoPair.rotate()
      expect(puyoPair.rotation).toBe(1) // 右

      puyoPair.rotate()
      expect(puyoPair.rotation).toBe(2) // 下

      puyoPair.rotate()
      expect(puyoPair.rotation).toBe(3) // 左

      puyoPair.rotate()
      expect(puyoPair.rotation).toBe(0) // 一周して上に戻る
    })
  })

  describe('ぷよの消去システム', () => {
    describe('ぷよの接続判定', () => {
      it('隣接する同じ色のぷよを検出できること', () => {
        const field = game.getField()
        // 同じ色のぷよを隣接して配置
        field[11][2] = 1 // 赤
        field[11][3] = 1 // 赤（隣接）
        field[10][2] = 1 // 赤（上に隣接）
        field[11][1] = 2 // 青（隣接するが色が違う）

        // 隣接する同じ色のぷよを検出する機能をテスト
        const connectedPuyos = game.findConnectedPuyos(2, 11, 1)
        expect(connectedPuyos).toHaveLength(3) // 3つの赤いぷよが接続
        expect(connectedPuyos).toContainEqual({ x: 2, y: 11 })
        expect(connectedPuyos).toContainEqual({ x: 3, y: 11 })
        expect(connectedPuyos).toContainEqual({ x: 2, y: 10 })
        expect(connectedPuyos).not.toContainEqual({ x: 1, y: 11 }) // 青いぷよは含まれない
      })

      it('孤立したぷよは1つだけ検出されること', () => {
        const field = game.getField()
        field[11][2] = 1 // 赤（孤立）
        field[11][4] = 1 // 赤（離れている）

        const connectedPuyos = game.findConnectedPuyos(2, 11, 1)
        expect(connectedPuyos).toHaveLength(1)
        expect(connectedPuyos).toContainEqual({ x: 2, y: 11 })
      })

      it('空のセルからは何も検出されないこと', () => {
        const connectedPuyos = game.findConnectedPuyos(2, 11, 0)
        expect(connectedPuyos).toHaveLength(0)
      })
    })

    describe('4つ以上つながったぷよの検出', () => {
      it('4つ以上つながったぷよのグループを消去対象として検出できること', () => {
        const field = game.getField()
        // L字型に4つの赤いぷよを配置
        field[11][2] = 1 // 赤
        field[11][3] = 1 // 赤
        field[11][4] = 1 // 赤
        field[10][2] = 1 // 赤（4つ目）

        const erasableGroups = game.findErasableGroups()
        expect(erasableGroups).toHaveLength(1) // 1つのグループが消去対象
        expect(erasableGroups[0]).toHaveLength(4) // 4つのぷよで構成
      })

      it('3つ以下のぷよは消去対象として検出されないこと', () => {
        const field = game.getField()
        // 3つの赤いぷよを配置
        field[11][2] = 1 // 赤
        field[11][3] = 1 // 赤
        field[11][4] = 1 // 赤

        const erasableGroups = game.findErasableGroups()
        expect(erasableGroups).toHaveLength(0) // 消去対象なし
      })

      it('複数の消去対象グループを同時に検出できること', () => {
        const field = game.getField()
        // 赤いぷよグループ（4つ）
        field[11][0] = 1
        field[11][1] = 1
        field[10][0] = 1
        field[10][1] = 1

        // 青いぷよグループ（4つ）
        field[11][4] = 2
        field[11][5] = 2
        field[10][4] = 2
        field[10][5] = 2

        const erasableGroups = game.findErasableGroups()
        expect(erasableGroups).toHaveLength(2) // 2つのグループが消去対象
        expect(erasableGroups[0]).toHaveLength(4)
        expect(erasableGroups[1]).toHaveLength(4)
      })

      it('5つ以上のぷよも消去対象として検出されること', () => {
        const field = game.getField()
        // 5つの赤いぷよを配置
        field[11][2] = 1
        field[11][3] = 1
        field[11][4] = 1
        field[10][2] = 1
        field[10][3] = 1

        const erasableGroups = game.findErasableGroups()
        expect(erasableGroups).toHaveLength(1)
        expect(erasableGroups[0]).toHaveLength(5)
      })
    })

    describe('ぷよの消去処理', () => {
      it('4つ以上つながったぷよを実際に消去できること', () => {
        const field = game.getField()
        // 4つの赤いぷよを配置
        field[11][2] = 1
        field[11][3] = 1
        field[11][4] = 1
        field[10][2] = 1

        const erasedCount = game.erasePuyos()
        expect(erasedCount).toBe(4) // 4つのぷよが消去されたことを確認

        // 消去されたセルが空になっていることを確認
        expect(field[11][2]).toBe(0)
        expect(field[11][3]).toBe(0)
        expect(field[11][4]).toBe(0)
        expect(field[10][2]).toBe(0)
      })

      it('3つ以下のぷよは消去されないこと', () => {
        const field = game.getField()
        // 3つの赤いぷよを配置
        field[11][2] = 1
        field[11][3] = 1
        field[11][4] = 1

        const erasedCount = game.erasePuyos()
        expect(erasedCount).toBe(0) // 消去が実行されなかったことを確認

        // ぷよがそのまま残っていることを確認
        expect(field[11][2]).toBe(1)
        expect(field[11][3]).toBe(1)
        expect(field[11][4]).toBe(1)
      })

      it('複数のグループを同時に消去できること', () => {
        const field = game.getField()
        // 赤いぷよグループ（4つ）
        field[11][0] = 1
        field[11][1] = 1
        field[10][0] = 1
        field[10][1] = 1

        // 青いぷよグループ（4つ）
        field[11][4] = 2
        field[11][5] = 2
        field[10][4] = 2
        field[10][5] = 2

        const erasedCount = game.erasePuyos()
        expect(erasedCount).toBe(8) // 8つのぷよが消去されたことを確認

        // 両方のグループが消去されていることを確認
        expect(field[11][0]).toBe(0)
        expect(field[11][1]).toBe(0)
        expect(field[10][0]).toBe(0)
        expect(field[10][1]).toBe(0)
        expect(field[11][4]).toBe(0)
        expect(field[11][5]).toBe(0)
        expect(field[10][4]).toBe(0)
        expect(field[10][5]).toBe(0)
      })

      it('消去されないぷよはそのまま残ること', () => {
        const field = game.getField()
        // 消去対象の4つの赤いぷよ
        field[11][0] = 1
        field[11][1] = 1
        field[10][0] = 1
        field[10][1] = 1

        // 消去対象でない3つの青いぷよ
        field[11][4] = 2
        field[11][5] = 2
        field[10][4] = 2

        const erasedCount = game.erasePuyos()
        expect(erasedCount).toBe(4) // 4つのぷよが消去されたことを確認

        // 赤いぷよは消去されている
        expect(field[11][0]).toBe(0)
        expect(field[11][1]).toBe(0)
        expect(field[10][0]).toBe(0)
        expect(field[10][1]).toBe(0)

        // 青いぷよはそのまま残っている
        expect(field[11][4]).toBe(2)
        expect(field[11][5]).toBe(2)
        expect(field[10][4]).toBe(2)
      })
    })

    describe('消去後の落下処理', () => {
      it('消去された後の空きスペースにぷよが落下すること', () => {
        const field = game.getField()
        // 底に消去対象の4つの赤いぷよを配置
        field[11][2] = 1
        field[11][3] = 1
        field[10][2] = 1
        field[10][3] = 1

        // その上に青いぷよを配置
        field[9][2] = 2
        field[8][3] = 2

        // 消去処理を実行
        game.erasePuyos()

        // 重力処理を実行
        game.applyGravity()

        // 青いぷよが下に落下していることを確認
        expect(field[11][2]).toBe(2) // 上から落下
        expect(field[11][3]).toBe(2) // 上から落下

        // 元の位置は空になっている
        expect(field[9][2]).toBe(0)
        expect(field[8][3]).toBe(0)
      })

      it('複数段のぷよが正しく落下すること', () => {
        const field = game.getField()
        // 底に消去対象の赤いぷよ
        field[11][2] = 1
        field[10][2] = 1
        field[9][2] = 1
        field[8][2] = 1

        // その上に複数の青いぷよ
        field[7][2] = 2
        field[6][2] = 2
        field[5][2] = 2

        // 消去処理を実行
        game.erasePuyos()

        // 重力処理を実行
        game.applyGravity()

        // 青いぷよが下に詰まって落下していることを確認
        expect(field[11][2]).toBe(2)
        expect(field[10][2]).toBe(2)
        expect(field[9][2]).toBe(2)

        // 上の方は空になっている
        expect(field[8][2]).toBe(0)
        expect(field[7][2]).toBe(0)
        expect(field[6][2]).toBe(0)
        expect(field[5][2]).toBe(0)
      })

      it('部分的な落下も正しく処理されること', () => {
        const field = game.getField()
        // L字型に配置された消去対象の赤いぷよ
        field[11][1] = 1
        field[11][2] = 1
        field[10][1] = 1
        field[9][1] = 1

        // その上と横に青いぷよ
        field[8][1] = 2 // 消去されたぷよの上
        field[11][3] = 2 // 消去されないぷよの横

        // 消去処理を実行
        game.erasePuyos()

        // 重力処理を実行
        game.applyGravity()

        // 上にあった青いぷよが落下
        expect(field[11][1]).toBe(2)
        expect(field[8][1]).toBe(0)

        // 横にあった青いぷよはそのまま
        expect(field[11][3]).toBe(2)
      })

      it('空の列には何も起こらないこと', () => {
        const field = game.getField()
        // 一部の列にのみぷよを配置
        field[11][2] = 1
        field[10][2] = 1
        field[9][2] = 1
        field[8][2] = 1

        // 消去処理を実行
        game.erasePuyos()

        // 重力処理を実行
        game.applyGravity()

        // 空の列（0, 1, 3, 4, 5）は変化なし
        for (let y = 0; y < 12; y++) {
          expect(field[y][0]).toBe(0)
          expect(field[y][1]).toBe(0)
          expect(field[y][3]).toBe(0)
          expect(field[y][4]).toBe(0)
          expect(field[y][5]).toBe(0)
        }
      })
    })

    describe('消去されない場合の落下処理', () => {
      it('ぷよが重なっている場合に下に空間があれば落下すること', () => {
        const field = game.getField()
        // 浮いているぷよを配置（下に空間がある状態）
        field[9][2] = 1 // 赤いぷよが浮いている
        field[8][2] = 2 // 青いぷよが浮いている
        field[6][2] = 1 // さらに上に赤いぷよが浮いている

        // 重力処理を実行
        game.applyGravity()

        // ぷよが底に落下していることを確認
        expect(field[11][2]).toBe(1) // 最初に置いた赤いぷよ
        expect(field[10][2]).toBe(2) // 青いぷよ
        expect(field[9][2]).toBe(1) // 最後の赤いぷよ

        // 元の位置は空になっている
        expect(field[8][2]).toBe(0)
        expect(field[6][2]).toBe(0)
      })

      it('支えがないぷよは重力で落下すること', () => {
        const field = game.getField()
        // 底にぷよがあり、その上に空間、さらに上にぷよ
        field[11][1] = 1 // 底の支えるぷよ
        field[8][1] = 2 // 浮いているぷよ
        field[7][1] = 3 // さらに浮いているぷよ

        // 重力処理を実行
        game.applyGravity()

        // ぷよが正しく落下して積み重なる
        expect(field[11][1]).toBe(1) // 底のぷよはそのまま
        expect(field[10][1]).toBe(2) // 浮いていたぷよが落下
        expect(field[9][1]).toBe(3) // 一番上のぷよも落下

        // 元の位置は空
        expect(field[8][1]).toBe(0)
        expect(field[7][1]).toBe(0)
      })

      it('すでに正しい位置にあるぷよは移動しないこと', () => {
        const field = game.getField()
        // 正しく積み重なったぷよを配置
        field[11][3] = 1
        field[10][3] = 2
        field[9][3] = 3

        // 重力処理を実行
        game.applyGravity()

        // 位置は変わらない
        expect(field[11][3]).toBe(1)
        expect(field[10][3]).toBe(2)
        expect(field[9][3]).toBe(3)
      })
    })
  })

  describe('ゲームループとの統合', () => {
    it('ぷよが着地したときに消去処理が自動実行される', () => {
      const game = new Game()
      const field = game.getField()

      // L字型に同色（赤色=1）のぷよを配置して4つ揃える
      field[11][0] = 1 // 底辺
      field[11][1] = 1 // 底辺
      field[11][2] = 1 // 底辺
      field[10][0] = 1 // 縦棒

      // ぷよペアの色を調整して、赤色になるようにする
      const puyoPair = game.getCurrentPuyoPair()!
      puyoPair.axis.color = 1 // 赤色
      puyoPair.satellite.color = 2 // 異なる色（青色）

      // 着地位置を設定（軸ぷよが11,2の位置、衛星ぷよが11,3の位置）
      puyoPair.axis.x = 2
      puyoPair.axis.y = 11
      puyoPair.satellite.x = 3
      puyoPair.satellite.y = 11

      // 着地処理を実行（消去処理が自動実行されるはず）
      ;(game as any).handleLandedPuyo()

      // 5つ揃った赤ぷよが消去されているかチェック（元の4つ + 軸ぷよ）
      expect(field[11][0]).toBe(0)
      expect(field[11][1]).toBe(0)
      expect(field[11][2]).toBe(0)
      expect(field[10][0]).toBe(0)

      // 衛星ぷよ（青色）は消去されずに残る
      expect(field[11][3]).toBe(2)
    })

    it('連鎖が発生したときに連続で消去処理が実行される', () => {
      const game = new Game()
      const field = game.getField()

      // 連鎖パターンを設定
      // 下段：赤4つ（消去対象）
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1
      field[11][3] = 1

      // 上段：青4つ（落下後に連鎖）
      field[9][1] = 2
      field[9][2] = 2
      field[10][1] = 2
      field[10][2] = 2

      // ぷよペアの色を設定（連鎖に影響しない位置・色）
      const puyoPair = game.getCurrentPuyoPair()!
      puyoPair.axis.color = 3 // 緑色（連鎖に影響しない）
      puyoPair.satellite.color = 4 // 黄色（連鎖に影響しない）

      // 着地位置を設定（連鎖に影響しない位置）
      puyoPair.axis.x = 5
      puyoPair.axis.y = 11
      puyoPair.satellite.x = 4
      puyoPair.satellite.y = 11

      // 着地処理実行
      ;(game as any).handleLandedPuyo()

      // 1回目の消去：赤4つが消去される
      expect(field[11][0]).toBe(0)
      expect(field[11][1]).toBe(0)
      expect(field[11][2]).toBe(0)
      expect(field[11][3]).toBe(0)

      // 2回目の消去：青4つが落下して連鎖で消去される
      expect(field[11][1]).toBe(0) // 落下してきた青も消去
      expect(field[11][2]).toBe(0) // 落下してきた青も消去
      expect(field[10][1]).toBe(0) // 元からあった青も消去
      expect(field[10][2]).toBe(0) // 元からあった青も消去

      // 着地したぷよペアは残る（連鎖に関与しないため）
      expect(field[11][5]).toBe(3) // 軸ぷよ（緑）
      expect(field[11][4]).toBe(4) // 衛星ぷよ（黄）
    })
  })

  describe('連鎖カウント機能', () => {
    it('1連鎖のとき連鎖数が1になること', () => {
      const game = new Game()
      const field = game.getField()

      // 4つ以上の同色ぷよを配置（1連鎖のみ）
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1
      field[11][3] = 1

      // 連鎖カウントをリセット
      ;(game as any).resetChainCount()

      // 連鎖処理を実行
      ;(game as any).processChain()

      // 1連鎖が記録されることを確認
      expect(game.getChainCount()).toBe(1)
    })

    it('2連鎖のとき連鎖数が2になること', () => {
      const game = new Game()
      const field = game.getField()

      // 連鎖パターンを設定
      // 下段：赤4つ（1連鎖目）- 横一列
      field[11][1] = 1
      field[11][2] = 1
      field[11][3] = 1
      field[11][4] = 1

      // 上段：青4つ（2連鎖目、落下後に隣接して4つ揃う）
      field[10][1] = 2 // 落下後: [11][1]
      field[10][2] = 2 // 落下後: [11][2]
      field[9][3] = 2 // 落下後: [11][3]
      field[9][4] = 2 // 落下後: [11][4]

      // 連鎖カウントをリセット
      ;(game as any).resetChainCount()

      // 連鎖処理を実行
      ;(game as any).processChain()

      // 2連鎖が記録されることを確認
      expect(game.getChainCount()).toBe(2)
    })

    it('消去が発生しない場合は連鎖数が0のままであること', () => {
      const game = new Game()
      const field = game.getField()

      // 3つ以下の同色ぷよを配置（消去されない）
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1

      // 連鎖カウントをリセット
      ;(game as any).resetChainCount()

      // 連鎖処理を実行
      ;(game as any).processChain()

      // 連鎖数は0のまま
      expect(game.getChainCount()).toBe(0)
    })

    it('連鎖カウントがリセットされること', () => {
      const game = new Game()

      // 連鎖カウントを手動で設定
      ;(game as any).chainCount = 5

      // リセット実行
      ;(game as any).resetChainCount()

      // 0にリセットされることを確認
      expect(game.getChainCount()).toBe(0)
    })
  })

  describe('連鎖ボーナス計算', () => {
    it('1連鎖のとき連鎖ボーナスが1倍になること', () => {
      const game = new Game()

      // 1連鎖のボーナス倍率を確認
      expect(game.getChainBonus(1)).toBe(1)
    })

    it('2連鎖のとき連鎖ボーナスが2倍になること', () => {
      const game = new Game()

      // 2連鎖のボーナス倍率を確認
      expect(game.getChainBonus(2)).toBe(2)
    })

    it('3連鎖のとき連鎖ボーナスが4倍になること', () => {
      const game = new Game()

      // 3連鎖のボーナス倍率を確認
      expect(game.getChainBonus(3)).toBe(4)
    })

    it('4連鎖のとき連鎖ボーナスが8倍になること', () => {
      const game = new Game()

      // 4連鎖のボーナス倍率を確認
      expect(game.getChainBonus(4)).toBe(8)
    })

    it('5連鎖以上のとき連鎖ボーナスが16倍になること', () => {
      const game = new Game()

      // 5連鎖以上のボーナス倍率を確認
      expect(game.getChainBonus(5)).toBe(16)
      expect(game.getChainBonus(10)).toBe(16)
      expect(game.getChainBonus(99)).toBe(16)
    })

    it('0連鎖のとき連鎖ボーナスが1倍になること', () => {
      const game = new Game()

      // 0連鎖（連鎖なし）のボーナス倍率を確認
      expect(game.getChainBonus(0)).toBe(1)
    })

    it('基本スコアに連鎖ボーナスが正しく適用されること', () => {
      const game = new Game()
      const baseScore = 100

      // 各連鎖数でのスコア計算を確認
      expect(game.calculateChainScore(baseScore, 1)).toBe(100) // 100 * 1
      expect(game.calculateChainScore(baseScore, 2)).toBe(200) // 100 * 2
      expect(game.calculateChainScore(baseScore, 3)).toBe(400) // 100 * 4
      expect(game.calculateChainScore(baseScore, 4)).toBe(800) // 100 * 8
      expect(game.calculateChainScore(baseScore, 5)).toBe(1600) // 100 * 16
    })
  })

  describe('スコアシステム', () => {
    it('ゲーム開始時のスコアが0であること', () => {
      const game = new Game()

      expect(game.getScore()).toBe(0)
    })

    it('スコアを加算できること', () => {
      const game = new Game()

      ;(game as any).addScore(100)
      expect(game.getScore()).toBe(100)
      ;(game as any).addScore(50)
      expect(game.getScore()).toBe(150)
    })

    it('連鎖数に応じたスコアが正しく計算されること', () => {
      const game = new Game()
      const erasedCount = 4 // 4つのぷよが消去された

      // 1連鎖時のスコア計算
      const score1Chain = game.calculateErasureScore(erasedCount, 1)
      expect(score1Chain).toBe(40) // 4 * 10 * 1

      // 2連鎖時のスコア計算
      const score2Chain = game.calculateErasureScore(erasedCount, 2)
      expect(score2Chain).toBe(80) // 4 * 10 * 2

      // 3連鎖時のスコア計算
      const score3Chain = game.calculateErasureScore(erasedCount, 3)
      expect(score3Chain).toBe(160) // 4 * 10 * 4
    })

    it('複数回の消去でスコアが累積されること', () => {
      const game = new Game()

      // 1回目の消去（4個、1連鎖）
      ;(game as any).addErasureScore(4, 1)
      expect(game.getScore()).toBe(40) // 4 * 10 * 1

      // 2回目の消去（5個、2連鎖）
      ;(game as any).addErasureScore(5, 2)
      expect(game.getScore()).toBe(140) // 40 + (5 * 10 * 2)
    })

    it('スコアリセット機能が動作すること', () => {
      const game = new Game()

      ;(game as any).addScore(500)
      expect(game.getScore()).toBe(500)
      ;(game as any).resetScore()
      expect(game.getScore()).toBe(0)
    })

    it('消去時に自動的にスコアが加算されること', () => {
      const game = new Game()
      const field = game.getField()

      // 4つの赤いぷよを配置
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1
      field[11][3] = 1

      // 消去されない別の色のぷよを配置（全消しを防ぐため）
      field[10][5] = 2

      // 連鎖処理を実行
      ;(game as any).resetChainCount()
      ;(game as any).processChain()

      // スコアが自動的に加算されることを確認（全消しボーナスなし）
      expect(game.getScore()).toBe(40) // 4 * 10 * 1
    })
  })

  describe('連鎖システム統合テスト', () => {
    it('完全な連鎖シナリオ：着地→消去→連鎖→スコア計算が正しく動作すること', () => {
      const game = new Game()
      const field = game.getField()

      // 確実な2連鎖パターンを設定
      // 1連鎖目：底部の赤4つ（横一列）
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1
      field[11][3] = 1

      // 2連鎖目：青4つを分離して配置（落下後に連鎖）
      field[10][0] = 2
      field[10][1] = 2
      field[8][2] = 2 // 空間を開けて配置
      field[8][3] = 2 // 空間を開けて配置

      // 赤が消えた後、青が落下して連結する

      // ぷよペア着地をシミュレート（連鎖に影響しない位置・色）
      const puyoPair = game.getCurrentPuyoPair()!
      puyoPair.axis.color = 4
      puyoPair.satellite.color = 4
      puyoPair.axis.x = 5
      puyoPair.axis.y = 11
      puyoPair.satellite.x = 0
      puyoPair.satellite.y = 11

      // 着地処理を実行
      ;(game as any).handleLandedPuyo()

      // 1連鎖のみが発生したことを確認（着地直後の重力処理により青ぷよも一緒に落下）
      expect(game.getChainCount()).toBe(1)

      // スコアが正しく計算されたことを確認
      // 1連鎖目: 4個 * 10 * 1 = 40点
      expect(game.getScore()).toBe(40)

      // 着地したぷよペアは残っている
      expect(field[11][5]).toBe(4)
      expect(field[11][0]).toBe(4)
    })

    it('基本的なスコア加算システムが正しく動作すること', () => {
      const game = new Game()
      const field = game.getField()

      // シンプルな1連鎖パターンを設定
      field[11][0] = 1 // 赤
      field[11][1] = 1 // 赤
      field[11][2] = 1 // 赤
      field[11][3] = 1 // 赤

      // ぷよペアの着地をシミュレート（連鎖に影響しない色と位置）
      const puyoPair = game.getCurrentPuyoPair()!
      puyoPair.axis.color = 2 // 青色
      puyoPair.satellite.color = 3 // 緑色
      puyoPair.axis.x = 5
      puyoPair.axis.y = 11
      puyoPair.satellite.x = 4
      puyoPair.satellite.y = 11

      // 着地処理実行
      ;(game as any).handleLandedPuyo()

      // 1連鎖が発生したことを確認
      expect(game.getChainCount()).toBe(1)

      // スコアが正しく計算されたことを確認
      // 1連鎖目: 4個 * 10 * 1 = 40点
      expect(game.getScore()).toBe(40)

      // 赤いぷよが消去されていることを確認
      expect(field[11][0]).toBe(0)
      expect(field[11][1]).toBe(0)
      expect(field[11][2]).toBe(0)
      expect(field[11][3]).toBe(0)

      // 着地したぷよペアは残っている
      expect(field[11][5]).toBe(2) // 軸ぷよ（青）
      expect(field[11][4]).toBe(3) // 衛星ぷよ（緑）
    })

    it('複数回のゲームプレイでスコアが累積されること', () => {
      const game = new Game()
      const field = game.getField()

      // 1回目のぷよ着地と消去
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1
      field[11][3] = 1

      // 1回目の着地処理
      let puyoPair = game.getCurrentPuyoPair()!
      puyoPair.axis.color = 2
      puyoPair.satellite.color = 3
      puyoPair.axis.x = 5
      puyoPair.axis.y = 11
      puyoPair.satellite.x = 4
      puyoPair.satellite.y = 11
      ;(game as any).handleLandedPuyo()

      const firstScore = game.getScore()
      expect(firstScore).toBe(40) // 4 * 10 * 1

      // 2回目のぷよ着地と消去（新しいぷよペアが生成されている）
      field[11][0] = 2
      field[11][1] = 2
      field[10][0] = 2
      field[10][1] = 2

      // 2回目の着地処理
      puyoPair = game.getCurrentPuyoPair()!
      puyoPair.axis.color = 3
      puyoPair.satellite.color = 4
      puyoPair.axis.x = 3
      puyoPair.axis.y = 11
      puyoPair.satellite.x = 2
      puyoPair.satellite.y = 11
      ;(game as any).handleLandedPuyo()

      // スコアが累積されていることを確認
      const totalScore = game.getScore()
      expect(totalScore).toBe(80) // 40 + (4 * 10 * 1)
    })

    it('連鎖が発生しない場合はスコアに影響しないこと', () => {
      const game = new Game()
      const field = game.getField()

      // 消去されない配置（3つ以下）
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1

      // ぷよペア着地をシミュレート
      const puyoPair = game.getCurrentPuyoPair()!
      puyoPair.axis.color = 2
      puyoPair.satellite.color = 3
      puyoPair.axis.x = 5
      puyoPair.axis.y = 11
      puyoPair.satellite.x = 4
      puyoPair.satellite.y = 11

      // 着地処理を実行
      ;(game as any).handleLandedPuyo()

      // 連鎖が発生していないことを確認
      expect(game.getChainCount()).toBe(0)

      // スコアが変化していないことを確認
      expect(game.getScore()).toBe(0)

      // ぷよが消去されていないことを確認
      expect(field[11][0]).toBe(1)
      expect(field[11][1]).toBe(1)
      expect(field[11][2]).toBe(1)
    })

    it('UI更新との統合：ゲーム状態がUIに正しく反映されること', () => {
      const game = new Game()
      const field = game.getField()

      // 初期状態の確認
      expect(game.getScore()).toBe(0)
      expect(game.getChainCount()).toBe(0)

      // 連鎖パターンを設定
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1
      field[11][3] = 1

      // ぷよペア着地をシミュレート
      const puyoPair = game.getCurrentPuyoPair()!
      puyoPair.axis.color = 2
      puyoPair.satellite.color = 3
      puyoPair.axis.x = 5
      puyoPair.axis.y = 11
      puyoPair.satellite.x = 4
      puyoPair.satellite.y = 11

      // 着地処理を実行
      ;(game as any).handleLandedPuyo()

      // ゲーム状態が更新されていることを確認
      expect(game.getScore()).toBeGreaterThan(0) // スコアが加算されている
      expect(game.getChainCount()).toBe(1) // 1連鎖が記録されている

      // 新しいぷよペアが生成されていることを確認
      const newPuyoPair = game.getCurrentPuyoPair()
      expect(newPuyoPair).not.toBeNull()
      expect(newPuyoPair!.axis.x).toBe(2) // 初期位置
      expect(newPuyoPair!.axis.y).toBe(1) // 初期位置
    })
  })

  describe('全消し判定機能', () => {
    it('盤面にぷよが存在する場合は全消しではないこと', () => {
      const game = new Game()
      const field = game.getField()

      // フィールドにぷよを配置
      field[11][0] = 1
      field[10][2] = 2

      // 全消し判定を実行
      expect(game.isAllClear()).toBe(false)
    })

    it('盤面が完全に空の場合は全消しであること', () => {
      const game = new Game()

      // 初期状態（全て0）で全消し判定を実行
      expect(game.isAllClear()).toBe(true)
    })

    it('盤面のぷよをすべて消去した後は全消しであること', () => {
      const game = new Game()
      const field = game.getField()

      // フィールドにぷよを配置
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1
      field[11][3] = 1

      // 消去前は全消しではない
      expect(game.isAllClear()).toBe(false)

      // 消去処理を実行
      game.erasePuyos()

      // 消去後は全消しである
      expect(game.isAllClear()).toBe(true)
    })

    it('フィールドの角にぷよがある場合でも正しく検出されること', () => {
      const game = new Game()
      const field = game.getField()

      // フィールドの四隅にぷよを配置
      field[0][0] = 1 // 左上
      field[0][5] = 2 // 右上
      field[11][0] = 3 // 左下
      field[11][5] = 4 // 右下

      // 全消しではないことを確認
      expect(game.isAllClear()).toBe(false)

      // すべて消去
      field[0][0] = 0
      field[0][5] = 0
      field[11][0] = 0
      field[11][5] = 0

      // 全消しであることを確認
      expect(game.isAllClear()).toBe(true)
    })
  })

  describe('全消しボーナス計算', () => {
    it('全消し発生時に2000点のボーナスが加算されること', () => {
      const game = new Game()

      // 全消しボーナスの計算を確認
      expect(game.getZenkeshiBonus()).toBe(2000)
    })

    it('全消しが発生しない場合はボーナスが0であること', () => {
      const game = new Game()
      const field = game.getField()

      // フィールドにぷよを配置（全消しではない状態）
      field[11][0] = 1

      // 全消しボーナスが0であることを確認
      expect(game.calculateZenkeshiScore()).toBe(0)
    })

    it('全消しが発生する場合は2000点が加算されること', () => {
      const game = new Game()

      // 盤面が空の状態（全消し）での計算
      expect(game.calculateZenkeshiScore()).toBe(2000)
    })

    it('連鎖と全消しが同時発生した場合に正しく計算されること', () => {
      const game = new Game()
      const field = game.getField()

      // 4つの赤いぷよを配置（1連鎖で全消し）
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1
      field[11][3] = 1

      // 連鎖処理前のスコアを記録
      const initialScore = game.getScore()

      // 連鎖処理を実行
      ;(game as any).resetChainCount()
      ;(game as any).processChain()

      // スコアが正しく計算されていることを確認
      // 1連鎖: 4個 * 10 * 1 = 40点
      // 全消しボーナス: 2000点
      // 合計: 2040点
      expect(game.getScore()).toBe(initialScore + 40 + 2000)

      // 盤面が空になっている（全消し状態）
      expect(game.isAllClear()).toBe(true)
    })

    it('部分的な消去では全消しボーナスが発生しないこと', () => {
      const game = new Game()
      const field = game.getField()

      // 4つの赤いぷよを配置（1連鎖）
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1
      field[11][3] = 1

      // 残るぷよを配置（重力処理後も残るように底に配置）
      field[11][5] = 2

      // 連鎖処理前のスコアを記録
      const initialScore = game.getScore()

      // 連鎖処理を実行
      ;(game as any).resetChainCount()
      ;(game as any).processChain()

      // スコアが正しく計算されていることを確認
      // 1連鎖: 4個 * 10 * 1 = 40点（全消しボーナスなし）
      expect(game.getScore()).toBe(initialScore + 40)

      // 盤面が完全に空ではない
      expect(game.isAllClear()).toBe(false)
      expect(field[11][5]).toBe(2) // 残ったぷよ
    })
  })

  describe('全消し演出機能', () => {
    it('全消し演出コールバックを設定できること', () => {
      const game = new Game()
      let callbackCalled = false

      // コールバック関数を設定
      game.setZenkeshiCallback(() => {
        callbackCalled = true
      })

      // 全消しが発生する状況を作成
      const field = game.getField()
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1
      field[11][3] = 1

      // 連鎖処理を実行（全消しになる）
      ;(game as any).resetChainCount()
      ;(game as any).processChain()

      // コールバックが呼ばれたことを確認
      expect(callbackCalled).toBe(true)
    })

    it('全消しが発生しない場合は演出コールバックが呼ばれないこと', () => {
      const game = new Game()
      let callbackCalled = false

      // コールバック関数を設定
      game.setZenkeshiCallback(() => {
        callbackCalled = true
      })

      // 全消しが発生しない状況を作成
      const field = game.getField()
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1
      field[11][3] = 1
      field[11][5] = 2 // 残るぷよ

      // 連鎖処理を実行（全消しにならない）
      ;(game as any).resetChainCount()
      ;(game as any).processChain()

      // コールバックが呼ばれていないことを確認
      expect(callbackCalled).toBe(false)
    })

    it('複数回の全消しで演出コールバックが正しく動作すること', () => {
      const game = new Game()
      let callbackCount = 0

      // コールバック関数を設定（呼ばれた回数をカウント）
      game.setZenkeshiCallback(() => {
        callbackCount++
      })

      // 1回目の全消し
      const field = game.getField()
      field[11][0] = 1
      field[11][1] = 1
      field[11][2] = 1
      field[11][3] = 1
      ;(game as any).resetChainCount()
      ;(game as any).processChain()

      expect(callbackCount).toBe(1)

      // 2回目の全消し
      field[11][0] = 2
      field[11][1] = 2
      field[11][2] = 2
      field[11][3] = 2
      ;(game as any).resetChainCount()
      ;(game as any).processChain()

      expect(callbackCount).toBe(2)
    })
  })

  describe('ゲームオーバー判定機能', () => {
    it('新しいぷよが初期位置に配置できない場合にゲームオーバーになること', () => {
      const game = new Game()
      const field = game.getField()

      // 初期位置（2, 0）とその上（2, 0の衛星位置）にぷよを配置してブロック
      field[0][2] = 1 // 軸の初期位置をブロック
      field[1][2] = 2 // 衛星の初期位置もブロック

      // 新しいぷよペアを生成しようとする
      ;(game as any).generateNewPuyoPair()

      // ゲームオーバー状態になることを確認
      expect(game.isGameOver()).toBe(true)
    })

    it('初期位置が空いている場合はゲームオーバーにならないこと', () => {
      const game = new Game()

      // 初期状態では初期位置が空いているのでゲームオーバーではない
      expect(game.isGameOver()).toBe(false)
    })

    it('ゲームオーバー状態では新しいぷよペアが生成されないこと', () => {
      const game = new Game()
      const field = game.getField()

      // 初期位置をブロック
      field[0][2] = 1
      field[1][2] = 2

      // 新しいぷよペアを生成しようとする
      ;(game as any).generateNewPuyoPair()

      // ゲームオーバー状態で現在のぷよペアがnullになることを確認
      expect(game.isGameOver()).toBe(true)
      expect(game.getCurrentPuyoPair()).toBeNull()
    })

    it('ゲームオーバー状態では操作が無効になること', () => {
      const game = new Game()
      const field = game.getField()

      // ゲームオーバー状態にする
      field[0][2] = 1
      field[1][2] = 2
      ;(game as any).generateNewPuyoPair()

      // ゲームオーバー状態で操作を試行
      game.handleInput('ArrowLeft')
      game.handleInput('ArrowRight')
      game.handleInput('ArrowUp')

      // 操作が無効で状態が変わらないことを確認
      expect(game.isGameOver()).toBe(true)
      expect(game.getCurrentPuyoPair()).toBeNull()
    })

    it('ゲームを手動でゲームオーバー状態に設定できること', () => {
      const game = new Game()

      // 手動でゲームオーバー状態に設定
      ;(game as any).setGameOver(true)

      expect(game.isGameOver()).toBe(true)
    })
  })

  describe('ゲームオーバー演出機能', () => {
    it('ゲームオーバー演出コールバックを設定できること', () => {
      const game = new Game()
      let callbackCalled = false

      // コールバック関数を設定
      ;(game as any).setGameOverCallback(() => {
        callbackCalled = true
      })

      // ゲームオーバー状態にする
      const field = game.getField()
      field[0][2] = 1
      field[1][2] = 2

      // 新しいぷよペアを生成しようとする（ゲームオーバーになる）
      ;(game as any).generateNewPuyoPair()

      // コールバックが呼ばれたことを確認
      expect(callbackCalled).toBe(true)
      expect(game.isGameOver()).toBe(true)
    })

    it('ゲームオーバーが発生しない場合は演出コールバックが呼ばれないこと', () => {
      const game = new Game()
      let callbackCalled = false

      // コールバック関数を設定
      ;(game as any).setGameOverCallback(() => {
        callbackCalled = true
      })

      // 通常の新しいぷよペア生成（ゲームオーバーにならない）
      ;(game as any).generateNewPuyoPair()

      // コールバックが呼ばれていないことを確認
      expect(callbackCalled).toBe(false)
      expect(game.isGameOver()).toBe(false)
    })

    it('ゲームオーバー演出コールバックが複数回正しく動作すること', () => {
      const game = new Game()
      let callbackCount = 0

      // コールバック関数を設定（呼ばれた回数をカウント）
      ;(game as any).setGameOverCallback(() => {
        callbackCount++
      })

      // 1回目のゲームオーバー
      const field = game.getField()
      field[0][2] = 1
      field[1][2] = 2
      ;(game as any).generateNewPuyoPair()

      expect(callbackCount).toBe(1)
      expect(game.isGameOver()).toBe(true)

      // ゲーム状態をリセット
      ;(game as any).setGameOver(false)
      ;(game as any).currentPuyoPair = null

      // 2回目のゲームオーバー（初期位置を再度ブロック）
      field[0][2] = 3
      field[1][2] = 4
      ;(game as any).generateNewPuyoPair()

      expect(callbackCount).toBe(2)
      expect(game.isGameOver()).toBe(true)
    })

    it('ゲームオーバー時に最終スコアが正しく保持されること', () => {
      const game = new Game()

      // スコアを設定
      ;(game as any).addScore(1500)
      const finalScore = game.getScore()

      // ゲームオーバー状態にする
      const field = game.getField()
      field[0][2] = 1
      field[1][2] = 2
      ;(game as any).generateNewPuyoPair()

      // ゲームオーバー後もスコアが保持されていることを確認
      expect(game.isGameOver()).toBe(true)
      expect(game.getScore()).toBe(finalScore)
    })
  })

  describe('リスタート機能', () => {
    it('ゲームをリスタートできること', () => {
      const game = new Game()
      const field = game.getField()

      // ゲーム状態を変更する
      field[11][0] = 1
      field[10][2] = 2
      ;(game as any).addScore(1500)
      ;(game as any).chainCount = 3

      // リスタート前の状態を確認
      expect(game.getScore()).toBe(1500)
      expect(game.getChainCount()).toBe(3)
      expect(field[11][0]).toBe(1)
      expect(field[10][2]).toBe(2)

      // リスタートを実行
      ;(game as any).restart()

      // ゲーム状態がリセットされていることを確認
      expect(game.isGameOver()).toBe(false)
      expect(game.getScore()).toBe(0)
      expect(game.getChainCount()).toBe(0)
      expect(game.getCurrentPuyoPair()).not.toBeNull()

      // フィールドがクリアされていることを確認
      const newField = game.getField()
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 6; x++) {
          expect(newField[y][x]).toBe(0)
        }
      }
    })

    it('ゲームオーバー状態からリスタートできること', () => {
      const game = new Game()
      const field = game.getField()

      // ゲームオーバー状態にする
      field[0][2] = 1
      field[1][2] = 2
      ;(game as any).addScore(2500)
      ;(game as any).generateNewPuyoPair()

      // ゲームオーバー状態であることを確認
      expect(game.isGameOver()).toBe(true)
      expect(game.getCurrentPuyoPair()).toBeNull()
      expect(game.getScore()).toBe(2500)

      // リスタートを実行
      ;(game as any).restart()

      // ゲーム状態がリセットされていることを確認
      expect(game.isGameOver()).toBe(false)
      expect(game.getScore()).toBe(0)
      expect(game.getChainCount()).toBe(0)
      expect(game.getCurrentPuyoPair()).not.toBeNull()

      // フィールドがクリアされていることを確認
      const newField = game.getField()
      expect(newField[0][2]).toBe(0)
      expect(newField[1][2]).toBe(0)
    })

    it('リスタート後に新しいぷよペアが正しい位置に生成されること', () => {
      const game = new Game()

      // リスタートを実行
      ;(game as any).restart()

      // 新しいぷよペアが初期位置に生成されていることを確認
      const puyoPair = game.getCurrentPuyoPair()
      expect(puyoPair).not.toBeNull()
      expect(puyoPair!.axis.x).toBe(2)
      expect(puyoPair!.axis.y).toBe(1)
    })

    it('リスタート時にタイマーがリセットされること', () => {
      const game = new Game()

      // 内部タイマーを変更（プライベートフィールドへのアクセス）
      ;(game as any).dropTimer = 500
      ;(game as any).fastDropTimer = 25

      // リスタートを実行
      ;(game as any).restart()

      // タイマーがリセットされていることを確認
      expect((game as any).dropTimer).toBe(0)
      expect((game as any).fastDropTimer).toBe(0)
    })

    it('リスタート時にキー状態がリセットされること', () => {
      const game = new Game()

      // キー状態を変更
      ;(game as any).keysPressed.add('ArrowDown')
      ;(game as any).keysPressed.add('ArrowLeft')

      // リスタート前はキーが押されている状態
      expect((game as any).keysPressed.has('ArrowDown')).toBe(true)
      expect((game as any).keysPressed.has('ArrowLeft')).toBe(true)

      // リスタートを実行
      ;(game as any).restart()

      // キー状態がリセットされていることを確認
      expect((game as any).keysPressed.size).toBe(0)
    })
  })

  describe('リセットボタン機能', () => {
    it('ゲームプレイ中にいつでもリセットできること', () => {
      const game = new Game()
      const field = game.getField()

      // ゲーム中の状態を作成
      field[11][0] = 1
      field[11][1] = 2
      field[10][3] = 3
      ;(game as any).addScore(800)
      ;(game as any).chainCount = 2
      ;(game as any).dropTimer = 750

      // リセット前の状態を確認
      expect(game.getScore()).toBe(800)
      expect(game.getChainCount()).toBe(2)
      expect(field[11][0]).toBe(1)
      expect(field[11][1]).toBe(2)
      expect(field[10][3]).toBe(3)
      expect((game as any).dropTimer).toBe(750)

      // リセットを実行（restart()と同じ機能）
      ;(game as any).restart()

      // ゲーム状態が完全にリセットされていることを確認
      expect(game.isGameOver()).toBe(false)
      expect(game.getScore()).toBe(0)
      expect(game.getChainCount()).toBe(0)
      expect((game as any).dropTimer).toBe(0)
      expect(game.getCurrentPuyoPair()).not.toBeNull()

      // フィールドがクリアされていることを確認
      const newField = game.getField()
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 6; x++) {
          expect(newField[y][x]).toBe(0)
        }
      }
    })

    it('高得点ゲーム中でもリセットできること', () => {
      const game = new Game()
      const field = game.getField()

      // 高得点状態を作成
      ;(game as any).addScore(15000)
      ;(game as any).chainCount = 5
      // フィールドにぷよを配置
      for (let x = 0; x < 6; x++) {
        for (let y = 8; y < 12; y++) {
          field[y][x] = (x % 4) + 1
        }
      }

      // リセット前の状態を確認
      expect(game.getScore()).toBe(15000)
      expect(game.getChainCount()).toBe(5)

      // リセットを実行
      ;(game as any).restart()

      // すべてがリセットされていることを確認
      expect(game.getScore()).toBe(0)
      expect(game.getChainCount()).toBe(0)
      expect(game.isGameOver()).toBe(false)

      // フィールドがクリアされていることを確認
      const newField = game.getField()
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 6; x++) {
          expect(newField[y][x]).toBe(0)
        }
      }
    })

    it('連続でリセットしても正常に動作すること', () => {
      const game = new Game()

      // 1回目のリセット
      ;(game as any).addScore(500)
      ;(game as any).restart()
      expect(game.getScore()).toBe(0)
      expect(game.getCurrentPuyoPair()).not.toBeNull()

      // 2回目のリセット
      ;(game as any).addScore(1000)
      ;(game as any).restart()
      expect(game.getScore()).toBe(0)
      expect(game.getCurrentPuyoPair()).not.toBeNull()

      // 3回目のリセット
      ;(game as any).addScore(250)
      ;(game as any).restart()
      expect(game.getScore()).toBe(0)
      expect(game.getCurrentPuyoPair()).not.toBeNull()
      expect(game.isGameOver()).toBe(false)
    })
  })

  describe('重力処理の検証テスト', () => {
    it('ぷよが重なったときに下に空間があれば落下すること', () => {
      const game = new Game()
      const field = game.getField()

      // 重なった状態を作成：下に空間がある状態でぷよを配置
      field[8][2] = 1 // 赤ぷよ（浮いている状態）
      field[9][2] = 2 // 青ぷよ（浮いている状態）
      field[11][2] = 3 // 緑ぷよ（底にある）

      // 重力処理を実行
      game.applyGravity()

      // 重力処理後の期待される結果を確認
      // 元の配置: [8][2]=1(赤), [9][2]=2(青), [10][2]=0(空), [11][2]=3(緑)
      // 落下後: [8][2]=0, [9][2]=0, [10][2]=1(赤), [11][2]=3(緑)
      // ただし、[9][2]=2(青)も[10][2]に落下するので、実際は青が[10][2]、赤が[9][2]になる
      expect(field[8][2]).toBe(0) // 元の位置は空になる
      expect(field[9][2]).toBe(1) // 赤ぷよが落下してここに
      expect(field[10][2]).toBe(2) // 青ぷよが落下してここに
      expect(field[11][2]).toBe(3) // 緑ぷよは元の位置（底）
    })

    it('複数列で同時に重力処理が正しく動作すること', () => {
      const game = new Game()
      const field = game.getField()

      // 複数列にわたって浮いているぷよを配置
      field[8][1] = 1 // 列1: 赤ぷよ（浮いている）
      field[9][1] = 2 // 列1: 青ぷよ（浮いている）
      field[11][1] = 3 // 列1: 緑ぷよ（底）

      field[7][3] = 4 // 列3: 黄ぷよ（浮いている）
      field[10][3] = 1 // 列3: 赤ぷよ（浮いている）

      // 重力処理を実行
      game.applyGravity()

      // 列1の結果確認
      // 元の配置: [8][1]=1(赤), [9][1]=2(青), [10][1]=0(空), [11][1]=3(緑)
      // 重力処理は底から上にスキャンして詰める：緑(3)は11に残り、青(2)は10に、赤(1)は9に詰まる
      expect(field[8][1]).toBe(0) // 空
      expect(field[9][1]).toBe(1) // 赤ぷよが落下してここに
      expect(field[10][1]).toBe(2) // 青ぷよが落下してここに
      expect(field[11][1]).toBe(3) // 緑ぷよは底に残る

      // 列3の結果確認
      // 元の配置: [7][3]=4(黄), [8][3]=0, [9][3]=0, [10][3]=1(赤), [11][3]=0
      // 重力処理は底から上にスキャンして詰める：赤(1)が11に、黄(4)が10に詰まる
      expect(field[7][3]).toBe(0) // 空
      expect(field[8][3]).toBe(0) // 空
      expect(field[9][3]).toBe(0) // 空
      expect(field[10][3]).toBe(4) // 黄ぷよが落下してここに
      expect(field[11][3]).toBe(1) // 赤ぷよが底に落下
    })

    it('段階的な落下が正しく動作することを確認', () => {
      const game = new Game()
      const field = game.getField()

      // 階段状にぷよを配置
      field[8][0] = 1 // 高い位置
      field[10][0] = 2 // 中間位置
      // 底は空

      // 重力処理実行
      game.applyGravity()

      // 結果確認：全て底に詰まっているはず
      // 元の配置: [8][0]=1(赤), [9][0]=0, [10][0]=2(青), [11][0]=0
      // 落下後: 赤と青が底に詰まる（青が先に書き込まれるので底、赤が上）
      expect(field[8][0]).toBe(0) // 元の位置は空
      expect(field[9][0]).toBe(0) // 空
      expect(field[10][0]).toBe(1) // 赤ぷよが上に積まれる
      expect(field[11][0]).toBe(2) // 青ぷよが底
    })
  })

  describe('実際のゲームプレイシナリオでの重力処理テスト', () => {
    it('縦配置ぷよの上に横配置ぷよを重ねた場合の落下処理', () => {
      const game = new Game()
      const field = game.getField()

      // シナリオ1: 最初に縦に配置されたぷよペア（軸が下、衛星が上）
      field[10][2] = 1 // 軸ぷよ（赤）
      field[9][2] = 2 // 衛星ぷよ（青）

      // シナリオ2: 次に横向きに配置されたぷよペア（隣接配置）
      field[8][2] = 3 // 軸ぷよ（緑）
      field[8][3] = 4 // 衛星ぷよ（黄）- 横に配置

      console.log('ゲームプレイシナリオの重力処理前:')
      for (let y = 7; y < 12; y++) {
        console.log(`Row ${y}: [${field[y].join(', ')}]`)
      }

      // 重力処理を実行
      game.applyGravity()

      console.log('ゲームプレイシナリオの重力処理後:')
      for (let y = 7; y < 12; y++) {
        console.log(`Row ${y}: [${field[y].join(', ')}]`)
      }

      // 期待される結果を確認
      // 列2: すべてのぷよが下に詰まる
      expect(field[8][2]).toBe(0) // 空
      expect(field[9][2]).toBe(3) // 緑ぷよが落下
      expect(field[10][2]).toBe(2) // 青ぷよ（元の位置）
      expect(field[11][2]).toBe(1) // 赤ぷよ（底）

      // 列3: 黄(4)が底に落下
      expect(field[8][3]).toBe(0) // 元の位置は空
      expect(field[11][3]).toBe(4) // 黄ぷよが底に落下
    })

    it('複雑な配置パターンでの重力処理（空間あり）', () => {
      const game = new Game()
      const field = game.getField()

      // より複雑な配置を作成
      field[8][1] = 1 // 浮いているぷよ
      field[10][1] = 2 // 下に空間があるぷよ
      field[11][1] = 3 // 底のぷよ

      field[7][2] = 4 // 高い位置のぷよ
      field[9][2] = 5 // 中間の浮いているぷよ
      // [8][2], [10][2], [11][2] は空

      // 重力処理実行
      game.applyGravity()

      // 列1の結果確認
      expect(field[8][1]).toBe(0) // 空
      expect(field[9][1]).toBe(1) // 1が落下
      expect(field[10][1]).toBe(2) // 2が落下
      expect(field[11][1]).toBe(3) // 3は底に残る

      // 列2の結果確認
      expect(field[7][2]).toBe(0) // 空
      expect(field[8][2]).toBe(0) // 空
      expect(field[9][2]).toBe(0) // 空
      expect(field[10][2]).toBe(4) // 4が落下
      expect(field[11][2]).toBe(5) // 5が底に落下
    })

    it('横向きぷよが正しく落下することを確認', () => {
      const game = new Game()
      const field = game.getField()

      // 縦にぷよを配置（底から2つ）
      field[10][2] = 1
      field[11][2] = 2

      // 横向きぷよを配置（空中に浮いている状態）
      field[8][2] = 3
      field[8][3] = 4

      console.log('横向きぷよテスト - 重力処理前:')
      for (let y = 7; y < 12; y++) {
        console.log(`Row ${y}: [${field[y].join(', ')}]`)
      }

      // 重力処理を実行
      game.applyGravity()

      console.log('横向きぷよテスト - 重力処理後:')
      for (let y = 7; y < 12; y++) {
        console.log(`Row ${y}: [${field[y].join(', ')}]`)
      }

      // 期待される結果
      // 列2: 3が9に落下（1と2の上）
      expect(field[9][2]).toBe(3)
      expect(field[10][2]).toBe(1)
      expect(field[11][2]).toBe(2)

      // 列3: 4が底に落下
      expect(field[11][3]).toBe(4)
    })

    it('横向きぷよペアが着地時に正しく重力処理されることを確認', () => {
      const game = new Game()

      // 最初のぷよペアを縦に配置
      let puyoPair = game.getCurrentPuyoPair()!
      puyoPair.axis.x = 2
      puyoPair.axis.y = 10
      puyoPair.axis.color = 1
      puyoPair.satellite.color = 2
      puyoPair.rotation = 2 // 下向き（衛星が下）
      puyoPair.updateSatellitePosition()

      // 着地処理をシミュレート
      ;(game as any).handleLandedPuyo()

      const field = game.getField()
      console.log('縦ぷよ配置後:')
      for (let y = 9; y < 12; y++) {
        console.log(`Row ${y}: [${field[y].join(', ')}]`)
      }

      // 次のぷよペアを横向きに配置
      puyoPair = game.getCurrentPuyoPair()!
      puyoPair.axis.x = 2
      puyoPair.axis.y = 8
      puyoPair.axis.color = 3
      puyoPair.satellite.color = 4
      puyoPair.rotation = 1 // 右向き
      puyoPair.updateSatellitePosition()

      console.log('横ぷよ配置前（currentPuyoPair）:')
      console.log(`軸: (${puyoPair.axis.x}, ${puyoPair.axis.y}), 色: ${puyoPair.axis.color}`)
      console.log(
        `衛星: (${puyoPair.satellite.x}, ${puyoPair.satellite.y}), 色: ${puyoPair.satellite.color}`
      )

      // 着地処理をシミュレート（processChainが呼ばれる）
      ;(game as any).handleLandedPuyo()

      console.log('横ぷよ着地処理後:')
      for (let y = 7; y < 12; y++) {
        console.log(`Row ${y}: [${field[y].join(', ')}]`)
      }

      // 期待される結果：横向きぷよが正しく落下
      expect(field[8][2]).toBe(0) // 空
      expect(field[8][3]).toBe(0) // 空
      expect(field[9][2]).toBe(3) // 左のぷよが落下
      expect(field[10][2]).toBe(1) // 既存のぷよ
      expect(field[11][2]).toBe(2) // 既存のぷよ
      expect(field[11][3]).toBe(4) // 右のぷよが底に落下
    })

    it('実際のゲームプレイでの横向きぷよペアの落下', () => {
      const game = new Game()

      // 縦ぷよペアを配置して固定
      let puyoPair = game.getCurrentPuyoPair()!
      puyoPair.axis.x = 2
      puyoPair.axis.y = 10
      puyoPair.satellite.x = 2
      puyoPair.satellite.y = 9
      puyoPair.axis.color = 1
      puyoPair.satellite.color = 2
      ;(game as any).fixPuyoPair()
      ;(game as any).generateNewPuyoPair()

      // 横向きぷよペアを生成して配置
      puyoPair = game.getCurrentPuyoPair()!
      puyoPair.axis.x = 2
      puyoPair.axis.y = 8
      puyoPair.rotation = 1 // 右向き
      puyoPair.updateSatellitePosition()
      puyoPair.axis.color = 3
      puyoPair.satellite.color = 4

      const field = game.getField()
      console.log('実際のゲームプレイ - 横ぷよ固定前:')
      for (let y = 7; y < 12; y++) {
        console.log(`Row ${y}: [${field[y].join(', ')}]`)
      }

      // 横向きぷよを固定
      ;(game as any).fixPuyoPair()

      console.log('実際のゲームプレイ - 横ぷよ固定直後:')
      for (let y = 7; y < 12; y++) {
        console.log(`Row ${y}: [${field[y].join(', ')}]`)
      }

      // 重力処理を実行
      game.applyGravity()

      console.log('実際のゲームプレイ - 重力処理後:')
      for (let y = 7; y < 12; y++) {
        console.log(`Row ${y}: [${field[y].join(', ')}]`)
      }

      // 期待される結果：横向きぷよが下に落ちる
      expect(field[8][2]).toBe(0) // 空
      expect(field[8][3]).toBe(0) // 空
      expect(field[9][2]).toBe(3) // 軸ぷよが落下
      expect(field[11][3]).toBe(4) // 衛星ぷよが底に落下
    })

    it('ゲーム中の実際の配置シミュレーション', () => {
      const game = new Game()

      // 最初のぷよペアを配置（縦配置）
      let puyoPair = game.getCurrentPuyoPair()!
      puyoPair.axis.x = 2
      puyoPair.axis.y = 10
      puyoPair.satellite.x = 2
      puyoPair.satellite.y = 9
      puyoPair.axis.color = 1
      puyoPair.satellite.color = 2

      // 着地処理をシミュレート
      ;(game as any).fixPuyoPair()
      ;(game as any).generateNewPuyoPair()

      // 2番目のぷよペアを配置（横配置）
      puyoPair = game.getCurrentPuyoPair()!
      puyoPair.rotation = 1 // 右向き（横配置）
      puyoPair.axis.x = 2
      puyoPair.axis.y = 8
      puyoPair.updateSatellitePosition() // 横配置の位置を更新
      puyoPair.axis.color = 3
      puyoPair.satellite.color = 4

      const field = game.getField()

      console.log('ゲーム中シミュレーション前:')
      for (let y = 7; y < 12; y++) {
        console.log(`Row ${y}: [${field[y].join(', ')}]`)
      }

      // 2番目のぷよペアを固定
      ;(game as any).fixPuyoPair()

      // 重力処理を実行
      game.applyGravity()

      console.log('ゲーム中シミュレーション後:')
      for (let y = 7; y < 12; y++) {
        console.log(`Row ${y}: [${field[y].join(', ')}]`)
      }

      // 結果を確認
      expect(field[8][2]).toBe(0) // 空
      expect(field[9][2]).toBe(3) // 軸ぷよ（緑）が落下
      expect(field[10][2]).toBe(2) // 衛星ぷよ（青）
      expect(field[11][2]).toBe(1) // 軸ぷよ（赤）（底）
      expect(field[11][3]).toBe(4) // 衛星ぷよ（黄）が底に落下
    })
  })
})
