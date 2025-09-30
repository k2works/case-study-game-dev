import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Game } from './game'
import { Config } from './config'
import { Stage } from './stage'
import { PuyoImage } from './puyoimage'
import { Player } from './player'
import { Score } from './score'

describe('ゲーム', () => {
  let game: Game

  beforeEach(() => {
    // DOMの準備
    document.body.innerHTML = `
            <canvas id="stage"></canvas>
            <div id="score"></div>
            <div id="next"></div>
            <div id="next2"></div>
            <div id="gameOver"></div>
        `

    // Canvas のモックを作成
    const canvas = document.getElementById('stage') as any
    canvas.getContext = () => ({
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      fillRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      arc: () => {},
      fill: () => {},
    })

    game = new Game()
  })

  describe('ゲームの初期化', () => {
    it('ゲームを初期化すると、必要なコンポーネントが作成される', () => {
      game.initialize()

      // privateフィールドにアクセスするためにany型にキャスト
      const anyGame = game as any
      expect(anyGame.config).toBeInstanceOf(Config)
      expect(anyGame.puyoImage).toBeInstanceOf(PuyoImage)
      expect(anyGame.stage).toBeInstanceOf(Stage)
      expect(anyGame._player).toBeInstanceOf(Player)
      expect(anyGame._score).toBeInstanceOf(Score)
    })

    it('ゲームを初期化すると、ゲームモードがplayingになる', () => {
      game.initialize()

      const anyGame = game as any
      expect(anyGame.mode).toEqual('playing')
    })
  })

  describe('ゲームループ', () => {
    it('ゲームループを開始すると、requestAnimationFrameが呼ばれる', () => {
      // requestAnimationFrameのモック
      const originalRequestAnimationFrame = window.requestAnimationFrame
      const mockRequestAnimationFrame = vi.fn()
      window.requestAnimationFrame = mockRequestAnimationFrame as any

      try {
        game.initialize()
        game.start()

        expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1)
        expect(mockRequestAnimationFrame).toHaveBeenCalledWith(expect.any(Function))
      } finally {
        // モックを元に戻す
        window.requestAnimationFrame = originalRequestAnimationFrame
      }
    })
  })

  describe('自由落下', () => {
    it('フレームカウントが一定値に達すると、ぷよが自動的に下に移動する', () => {
      game.initialize()

      // privateフィールドにアクセスするためにany型にキャスト
      const anyGame = game as any
      const player = anyGame._player
      const initialY = player.puyoY

      // フレームカウントを自由落下速度まで進める（30フレーム）
      for (let i = 0; i < 30; i++) {
        anyGame.update()
      }

      // ぷよが下に移動していることを確認
      expect(player.puyoY).toBeGreaterThan(initialY)
    })

    it('下キーが押されている時は、毎フレームぷよが下に移動する', () => {
      game.initialize()

      // 下キーを押す
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(downEvent)

      const anyGame = game as any
      const player = anyGame._player
      const initialY = player.puyoY

      // 1フレーム更新
      anyGame.update()

      // ぷよが下に移動していることを確認
      expect(player.puyoY).toBe(initialY + 1)
    })
  })

  describe('重なり検出と即座着地', () => {
    it('配置済みぷよと重なっている場合、即座に着地処理が実行される', () => {
      game.initialize()

      const anyGame = game as any
      const player = anyGame._player
      const stage = anyGame.stage

      // ステージにぷよを配置
      stage.setPuyo(3, 5, '#ff0000')

      // プレイヤーぷよを重なる位置に配置
      player.puyoX = 3
      player.puyoY = 5
      player.rotation = 0

      // 更新処理を実行
      anyGame.update()

      // 即座にcheckEraseモードに遷移していることを確認
      expect(anyGame.mode).toBe('checkErase')
    })

    it('縦向きぷよが着地後、横向きぷよが重なる位置に来た場合、即座に着地する', () => {
      game.initialize()

      const anyGame = game as any
      const player = anyGame._player
      const stage = anyGame.stage

      // 縦向きぷよ（rotation=0）をx=3, y=12に配置して着地させる
      player.puyoX = 3
      player.puyoY = 12 // 最下段
      player.rotation = 0 // 上向き（2つ目のぷよがy=11）

      // 着地させる
      anyGame.mode = 'playing'
      anyGame.update() // 着地検出
      expect(anyGame.mode).toBe('checkErase')

      // ステージに配置されたぷよを確認
      expect(stage.getPuyo(3, 12)).not.toBe('')
      expect(stage.getPuyo(3, 11)).not.toBe('')

      // 消去・落下判定を完了させる
      anyGame.update() // checkErase
      anyGame.update() // checkFall
      anyGame.update() // newPuyo

      // 次のぷよを横向き（rotation=1）で生成して配置済みぷよの上に重ねる
      player.puyoX = 3
      player.puyoY = 11 // 配置済みぷよ(3,11)と重なる
      player.rotation = 1 // 右向き（2つ目のぷよが x=4, y=11）

      // 更新処理
      anyGame.mode = 'playing'
      anyGame.update()

      // 軸ぷよ(3,11)が配置済みぷよと重なっているので即座着地
      expect(anyGame.mode).toBe('checkErase')
    })

    it('重なった状態で左右キーを押しても移動しない', () => {
      game.initialize()

      const anyGame = game as any
      const player = anyGame._player

      // 縦向きぷよ（rotation=0）をx=3, y=12に配置して着地させる
      player.puyoX = 3
      player.puyoY = 12
      player.rotation = 0

      anyGame.mode = 'playing'
      anyGame.update() // 着地

      // 消去・落下・新ぷよ生成
      anyGame.update() // checkErase
      anyGame.update() // checkFall
      anyGame.update() // newPuyo

      // 次のぷよを横向きで配置済みぷよの上に重ねる
      player.puyoX = 3
      player.puyoY = 11
      player.rotation = 1

      // 左キーを押す
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      document.dispatchEvent(leftEvent)

      anyGame.mode = 'playing'
      anyGame.update()

      // 重なっているので移動していない
      expect(player.puyoX).toBe(3)
      expect(anyGame.mode).toBe('checkErase')

      // 右キーを押す試み（新ぷよ生成後）
      anyGame.update() // checkErase
      anyGame.update() // checkFall
      anyGame.update() // newPuyo

      player.puyoX = 3
      player.puyoY = 11
      player.rotation = 1

      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      document.dispatchEvent(rightEvent)

      anyGame.mode = 'playing'
      anyGame.update()

      // 重なっているので移動していない
      expect(player.puyoX).toBe(3)
      expect(anyGame.mode).toBe('checkErase')
    })

    it('横向きぷよが自動落下で縦向きぷよに重なる前に着地する', () => {
      game.initialize()

      const anyGame = game as any
      const player = anyGame._player

      // 縦向きぷよをx=3, y=12に配置して着地させる
      player.puyoX = 3
      player.puyoY = 12
      player.rotation = 0

      anyGame.mode = 'playing'
      anyGame.update() // 着地

      // 消去・落下・新ぷよ生成
      anyGame.update() // checkErase
      anyGame.update() // checkFall
      anyGame.update() // newPuyo

      // 次のぷよを横向きでx=3, y=0から開始
      player.puyoX = 3
      player.puyoY = 0
      player.rotation = 1 // 右向き（2つ目がx=4）

      anyGame.mode = 'playing'

      // y=0から落下していき、y=10で着地する（y=11は配置済みぷよがあるため）
      // fallSpeed=30なので、30フレームごとに1マス落下する
      let totalFrames = 0
      while (anyGame.mode === 'playing' && totalFrames < 1000) {
        anyGame.update()
        totalFrames++
      }

      // y=10で着地するはず
      expect(player.puyoY).toBe(10)
      expect(anyGame.mode).toBe('checkErase')
      expect(totalFrames).toBeLessThan(1000) // 無限ループ防止
    })
  })

  describe('着地と次のぷよ生成', () => {
    it('ぷよが着地すると、checkEraseモードを経て新しいぷよが上部に生成される', () => {
      game.initialize()

      const anyGame = game as any
      const player = anyGame._player

      // ぷよを下端まで移動
      player.puyoY = anyGame.config.stageRows - 1

      // 1フレーム更新（着地）
      anyGame.update()
      expect(anyGame.mode).toBe('checkErase')

      // 消去判定（消すぷよなし）
      anyGame.update()
      expect(anyGame.mode).toBe('checkFall')

      // 落下判定（落下可能なぷよなし）
      anyGame.update()
      expect(anyGame.mode).toBe('newPuyo')

      // 新ぷよ生成
      anyGame.update()
      expect(anyGame.mode).toBe('playing')

      // 新しいぷよが上部に生成されていることを確認
      expect(player.puyoY).toBe(0)
    })

    it('ぷよが着地すると、ステージにぷよが配置される', () => {
      game.initialize()

      const anyGame = game as any
      const player = anyGame._player
      const stage = anyGame.stage

      // ぷよの位置を記録
      const landedX = player.puyoX
      const landedY = anyGame.config.stageRows - 1
      player.puyoY = landedY

      // 1フレーム更新（着地処理）
      anyGame.update()

      // ステージにぷよが配置されていることを確認
      expect(stage.getPuyo(landedX, landedY)).not.toBe('')
    })
  })

  describe('ぷよ消去', () => {
    it('4つ連結したぷよが着地すると、checkEraseモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 横に3つ赤いぷよを事前配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')

      // プレイヤーの軸ぷよを(3, 12)に配置して着地させる
      const player = anyGame._player
      player.puyoX = 3
      player.puyoY = 12
      player.rotation = 0 // 2つ目のぷよは上

      // 着地処理を実行
      anyGame.update()

      // checkEraseモードに遷移していることを確認
      expect(anyGame.mode).toBe('checkErase')
    })

    it('checkEraseモードで4つ以上連結したぷよがあると、erasingモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 横に4つ赤いぷよを配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')
      stage.setPuyo(3, 12, '#ff0000')

      // checkEraseモードに設定
      anyGame.mode = 'checkErase'

      // 更新処理
      anyGame.update()

      // erasingモードに遷移していることを確認
      expect(anyGame.mode).toBe('erasing')
    })

    it('erasingモードではぷよが消去される', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 横に4つ赤いぷよを配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')
      stage.setPuyo(3, 12, '#ff0000')

      // checkEraseモードで消去対象を検出
      anyGame.mode = 'checkErase'
      anyGame.update()

      // erasingモードで消去実行
      expect(anyGame.mode).toBe('erasing')
      anyGame.update()

      // ぷよが消去されていることを確認
      expect(stage.getPuyo(0, 12)).toBe('')
      expect(stage.getPuyo(1, 12)).toBe('')
      expect(stage.getPuyo(2, 12)).toBe('')
      expect(stage.getPuyo(3, 12)).toBe('')
    })

    it('消すぷよがない場合は、checkFallモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 3つだけ配置（消去対象外）
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')

      // checkEraseモードに設定
      anyGame.mode = 'checkErase'

      // 更新処理
      anyGame.update()

      // checkFallモードに遷移していることを確認
      expect(anyGame.mode).toBe('checkFall')
    })

    it('newPuyoモードでは新しいぷよが生成されてplayingモードに戻る', () => {
      game.initialize()

      const anyGame = game as any

      // newPuyoモードに設定
      anyGame.mode = 'newPuyo'

      // 更新処理
      anyGame.update()

      // playingモードに戻っていることを確認
      expect(anyGame.mode).toBe('playing')
    })
  })

  describe('重力落下', () => {
    it('ぷよ消去後、落下可能なぷよがあればcheckFallモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 縦に積まれたぷよを配置
      stage.setPuyo(2, 10, '#ff0000')
      stage.setPuyo(2, 11, '#0000ff')
      stage.setPuyo(2, 12, '#00ff00')

      // 横に4つ配置して消去可能にする
      stage.setPuyo(0, 12, '#00ff00')
      stage.setPuyo(1, 12, '#00ff00')
      stage.setPuyo(3, 12, '#00ff00')

      // checkEraseモードで消去対象検出
      anyGame.mode = 'checkErase'
      anyGame.update()
      expect(anyGame.mode).toBe('erasing')

      // 消去実行
      anyGame.update()

      // 落下判定モードに遷移
      expect(anyGame.mode).toBe('checkFall')
    })

    it('checkFallモードで落下可能なぷよがあればfallモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 空白の上にぷよを配置
      stage.setPuyo(2, 5, '#ff0000')

      // checkFallモードに設定
      anyGame.mode = 'checkFall'

      // 更新処理
      anyGame.update()

      // fallモードに遷移していることを確認
      expect(anyGame.mode).toBe('fall')
    })

    it('fallモードでは重力が適用されcheckEraseモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 空白の上にぷよを配置
      stage.setPuyo(2, 5, '#ff0000')

      // fallモードに設定
      anyGame.mode = 'fall'

      // 更新処理
      anyGame.update()

      // ぷよが落下していることを確認
      expect(stage.getPuyo(2, 12)).toBe('#ff0000')
      expect(stage.getPuyo(2, 5)).toBe('')

      // checkEraseモードに遷移（連鎖判定）
      expect(anyGame.mode).toBe('checkErase')
    })

    it('落下可能なぷよがない場合はnewPuyoモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 下端にぷよを配置（落下不可）
      stage.setPuyo(2, 12, '#ff0000')

      // checkFallモードに設定
      anyGame.mode = 'checkFall'

      // 更新処理
      anyGame.update()

      // newPuyoモードに遷移していることを確認
      expect(anyGame.mode).toBe('newPuyo')
    })
  })

  describe('スコア表示', () => {
    it('スコア表示要素が存在する', () => {
      // Arrange: スコア表示用のDOM要素を作成
      document.body.innerHTML = `
        <div id="app">
          <canvas id="stage"></canvas>
          <div id="score">0</div>
        </div>
      `

      // Act: ゲームを初期化
      game.initialize()

      // Assert: スコア表示要素が存在することを確認
      const scoreElement = document.getElementById('score')
      expect(scoreElement).not.toBeNull()
      expect(scoreElement?.textContent).toBe('0')
    })

    it('スコアが更新されると表示も更新される', () => {
      // Arrange: スコア表示用のDOM要素を作成
      document.body.innerHTML = `
        <div id="app">
          <canvas id="stage"></canvas>
          <div id="score">0</div>
        </div>
      `

      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage
      const scoreElement = document.getElementById('score')

      // 横に4つ赤いぷよを配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')
      stage.setPuyo(3, 12, '#ff0000')

      anyGame.mode = 'checkErase'

      // Act: ぷよを消去してスコアを更新
      anyGame.update() // checkErase → erasing
      anyGame.update() // erasing → checkFall

      // Assert: スコア表示が更新されている
      expect(scoreElement?.textContent).toBe('40')
    })
  })

  describe('スコア計算', () => {
    it('4つのぷよを消去すると基本スコアが加算される', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage
      const score = anyGame._score

      // 横に4つ赤いぷよを配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')
      stage.setPuyo(3, 12, '#ff0000')

      // checkEraseモードに設定
      anyGame.mode = 'checkErase'

      // 初期スコアを確認
      expect(score.getScore()).toBe(0)

      // 更新処理（消去判定）
      anyGame.update()

      // erasingモードに遷移
      expect(anyGame.mode).toBe('erasing')

      // 更新処理（消去実行）
      anyGame.update()

      // スコアが加算されていることを確認（4個消去 = 40点）
      expect(score.getScore()).toBe(40)
    })

    it('連鎖が発生するとボーナスが加算される', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage
      const score = anyGame._score

      // ステージ配置:
      // 縦  0    1    2    3    4    5
      //  8:           青
      //  9:           青
      // 10:           青
      // 11: 赤   赤   赤   赤
      // 12: 赤   赤   青   赤
      //
      // 1連鎖目: 下の赤8つが消える
      // 2連鎖目: 青が列2に落下して下端から縦4つ揃い消える

      // 下段: 赤を配置（7個、列2の行12は青）
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(3, 12, '#ff0000')
      stage.setPuyo(0, 11, '#ff0000')
      stage.setPuyo(1, 11, '#ff0000')
      stage.setPuyo(2, 11, '#ff0000')
      stage.setPuyo(3, 11, '#ff0000')

      // 青を配置：列2の下端に1つ、上部に3つ
      stage.setPuyo(2, 12, '#0000ff') // 下端（赤の間に挟まれている）
      stage.setPuyo(2, 8, '#0000ff') // 上部
      stage.setPuyo(2, 9, '#0000ff')
      stage.setPuyo(2, 10, '#0000ff')

      // checkEraseモードに設定
      anyGame.mode = 'checkErase'

      // 初期スコアを確認
      expect(score.getScore()).toBe(0)

      // 1連鎖目: 赤いぷよ消去
      anyGame.update() // checkErase → erasing
      anyGame.update() // erasing → checkFall

      // 1連鎖目のスコア（7個 × 10点 × 1倍 = 70点）
      expect(score.getScore()).toBe(70)

      // 落下処理
      anyGame.update() // checkFall → fall
      anyGame.update() // fall → checkErase

      // 2連鎖目: 青いぷよ消去（青が下に落ちて4つ連結）
      anyGame.update() // checkErase → erasing
      anyGame.update() // erasing → checkFall

      // 2連鎖目のスコア（4個 × 10点 × 8倍 = 320点）
      // 合計: 70点 + 320点 = 390点
      expect(score.getScore()).toBe(390)
    })
  })

  describe('ゲームオーバー', () => {
    it('新しいぷよの生成位置にぷよがある場合、ゲームオーバーになる', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 新しいぷよが生成される位置（中央上部）にぷよを配置
      const centerCol = Math.floor(anyGame.config.stageCols / 2)
      stage.setPuyo(centerCol, 0, '#ff0000')

      // 新ぷよ生成モードに設定
      anyGame.mode = 'newPuyo'

      // 新ぷよ生成を試みる
      anyGame.update()

      // ゲームオーバーモードになっていることを確認
      expect(anyGame.mode).toBe('gameOver')
    })

    it('ゲームオーバー後はゲームが停止する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 新しいぷよが生成される位置にぷよを配置
      const centerCol = Math.floor(anyGame.config.stageCols / 2)
      stage.setPuyo(centerCol, 0, '#ff0000')

      // ゲームオーバーにする
      anyGame.mode = 'newPuyo'
      anyGame.update()

      expect(anyGame.mode).toBe('gameOver')

      // ゲームオーバー後にupdateを呼んでもモードが変わらないことを確認
      anyGame.update()
      expect(anyGame.mode).toBe('gameOver')
    })

    it('ゲームオーバー時に「GAME OVER」が表示される', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage
      const centerCol = Math.floor(anyGame.config.stageCols / 2)

      // 初期位置にぷよを配置してゲームオーバーにする
      stage.setPuyo(centerCol, 0, '#ff0000')

      // 新しいぷよの生成を試みる
      anyGame.mode = 'newPuyo'
      anyGame.update()

      // 描画処理を呼び出す
      anyGame.draw()

      // ゲームオーバー表示要素が表示されることを確認
      const gameOverElement = document.getElementById('gameOver')
      expect(gameOverElement).not.toBeNull()
      expect(gameOverElement?.style.display).toBe('block')
    })

    it('プレイ中は「GAME OVER」が非表示になっている', () => {
      game.initialize()

      const anyGame = game as any
      anyGame.mode = 'playing'
      anyGame.draw()

      // ゲームオーバー表示要素が非表示であることを確認
      const gameOverElement = document.getElementById('gameOver')
      expect(gameOverElement?.style.display).toBe('none')
    })
  })

  describe('リスタート機能', () => {
    it('restart()を呼ぶとゲームが初期状態に戻る', () => {
      game.initialize()
      const anyGame = game as any

      // スコアを加算
      anyGame._score.addScore(100)
      expect(anyGame._score.getScore()).toBe(100)

      // ステージにぷよを配置
      const stage = anyGame.stage
      stage.setPuyo(0, 12, '#ff0000')

      // ゲームオーバー状態にする
      const centerCol = Math.floor(anyGame.config.stageCols / 2)
      stage.setPuyo(centerCol, 0, '#ff0000')
      anyGame.mode = 'newPuyo'
      anyGame.update()
      expect(anyGame.mode).toBe('gameOver')

      // リスタート
      anyGame.restart()

      // 初期状態に戻っていることを確認
      expect(anyGame._score.getScore()).toBe(0)
      expect(anyGame.mode).toBe('playing')
      expect(stage.getPuyo(0, 12)).toBe('')
    })

    it('リスタート後にゲームが正常に動作する', () => {
      game.initialize()
      const anyGame = game as any

      // 一度ゲームオーバーにする
      const stage = anyGame.stage
      const centerCol = Math.floor(anyGame.config.stageCols / 2)
      stage.setPuyo(centerCol, 0, '#ff0000')
      anyGame.mode = 'newPuyo'
      anyGame.update()

      // リスタート
      anyGame.restart()

      // プレイヤー操作が可能なことを確認
      expect(anyGame.mode).toBe('playing')
      anyGame.update()
      // エラーが発生しないことを確認
    })
  })
})
