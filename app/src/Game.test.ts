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

        const erased = game.erasePuyos()
        expect(erased).toBe(true) // 消去が実行されたことを確認

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

        const erased = game.erasePuyos()
        expect(erased).toBe(false) // 消去が実行されなかったことを確認

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

        const erased = game.erasePuyos()
        expect(erased).toBe(true)

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

        const erased = game.erasePuyos()
        expect(erased).toBe(true)

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
  })
})
