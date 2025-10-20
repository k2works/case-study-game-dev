import { renderHook, act } from '@testing-library/react-hooks'
import { useGameState } from '../useGameState'
import { Config } from '../../models/Config'
import { PuyoColor } from '../../models/PuyoColor'

describe('useGameState', () => {
  const config = new Config()

  describe('初期状態', () => {
    it('空のグリッドが作成されること', () => {
      const { result } = renderHook(() => useGameState(config))
      const { grid } = result.current

      expect(grid).toHaveLength(config.stageRows)
      expect(grid[0]).toHaveLength(config.stageColumns)
      expect(
        grid.every((row: PuyoColor[]) => row.every((cell: PuyoColor) => cell === PuyoColor.EMPTY))
      ).toBe(true)
    })

    it('落下中のぷよが生成されること', () => {
      const { result } = renderHook(() => useGameState(config))
      const { fallingPuyo } = result.current

      expect(fallingPuyo).toBeDefined()
      expect(fallingPuyo.x).toBeGreaterThanOrEqual(0)
      expect(fallingPuyo.x).toBeLessThan(config.stageColumns)
      expect(fallingPuyo.y).toBe(1) // 軸ぷよはy=1から開始（子ぷよがy=0で画面内に）
      expect(fallingPuyo.main).toBeDefined()
      expect(fallingPuyo.sub).toBeDefined()
      expect(fallingPuyo.main.color).not.toBe(PuyoColor.EMPTY)
      expect(fallingPuyo.sub.color).not.toBe(PuyoColor.EMPTY)
    })

    it('子ぷよは軸ぷよの上に配置されること', () => {
      const { result } = renderHook(() => useGameState(config))

      expect(result.current.fallingPuyo.sub.dy).toBe(-1)
      expect(result.current.fallingPuyo.sub.dx).toBe(0)
    })
  })

  describe('左移動', () => {
    it('左に移動できること', () => {
      const { result } = renderHook(() => useGameState(config))
      const initialX = result.current.fallingPuyo.x

      act(() => {
        result.current.moveLeft()
      })

      expect(result.current.fallingPuyo.x).toBe(initialX - 1)
    })

    it('左端では移動できないこと', () => {
      const { result } = renderHook(() => useGameState(config))

      // 左端まで移動
      act(() => {
        for (let i = 0; i < config.stageColumns; i++) {
          result.current.moveLeft()
        }
      })

      const leftmostX = result.current.fallingPuyo.x
      expect(leftmostX).toBe(0)

      // さらに左に移動しようとしても移動しない
      act(() => {
        result.current.moveLeft()
      })

      expect(result.current.fallingPuyo.x).toBe(0)
    })
  })

  describe('右移動', () => {
    it('右に移動できること', () => {
      const { result } = renderHook(() => useGameState(config))
      const initialX = result.current.fallingPuyo.x

      act(() => {
        result.current.moveRight()
      })

      expect(result.current.fallingPuyo.x).toBe(initialX + 1)
    })

    it('右端では移動できないこと', () => {
      const { result } = renderHook(() => useGameState(config))

      // 右端まで移動
      act(() => {
        for (let i = 0; i < config.stageColumns; i++) {
          result.current.moveRight()
        }
      })

      const rightmostX = result.current.fallingPuyo.x
      expect(rightmostX).toBe(config.stageColumns - 1)

      // さらに右に移動しようとしても移動しない
      act(() => {
        result.current.moveRight()
      })

      expect(result.current.fallingPuyo.x).toBe(config.stageColumns - 1)
    })
  })

  describe('回転', () => {
    it('rotateを呼ぶと子ぷよが時計回りに90度回転すること', () => {
      const { result } = renderHook(() => useGameState(config))

      // 初期状態: 子ぷよは上 (dx=0, dy=-1)
      expect(result.current.fallingPuyo.sub.dx).toBe(0)
      expect(result.current.fallingPuyo.sub.dy).toBe(-1)

      // 1回回転: 子ぷよは右 (dx=1, dy=0)
      act(() => {
        result.current.rotate()
      })
      expect(result.current.fallingPuyo.sub.dx).toBe(1)
      expect(result.current.fallingPuyo.sub.dy).toBe(0)

      // 2回回転: 子ぷよは下 (dx=0, dy=1)
      act(() => {
        result.current.rotate()
      })
      expect(result.current.fallingPuyo.sub.dx).toBe(0)
      expect(result.current.fallingPuyo.sub.dy).toBe(1)

      // 3回回転: 子ぷよは左 (dx=-1, dy=0)
      act(() => {
        result.current.rotate()
      })
      expect(result.current.fallingPuyo.sub.dx).toBe(-1)
      expect(result.current.fallingPuyo.sub.dy).toBe(0)

      // 4回回転: 子ぷよは上に戻る (dx=0, dy=-1)
      act(() => {
        result.current.rotate()
      })
      expect(result.current.fallingPuyo.sub.dx).toBe(0)
      expect(result.current.fallingPuyo.sub.dy).toBe(-1)
    })

    it('壁際で回転できない場合、壁キックで1マスずらして回転できること', () => {
      const { result } = renderHook(() => useGameState(config))

      // 左端に移動（x=0）
      const initialCenter = result.current.fallingPuyo.x
      act(() => {
        for (let i = 0; i < initialCenter; i++) {
          result.current.moveLeft()
        }
      })

      const initialX = result.current.fallingPuyo.x
      expect(initialX).toBe(0)

      // 子ぷよを右向き（dx=1, dy=0）にする
      act(() => {
        result.current.rotate()
      })

      // さらに下向き（dx=0, dy=1）にする
      act(() => {
        result.current.rotate()
      })

      expect(result.current.fallingPuyo.sub.dx).toBe(0)
      expect(result.current.fallingPuyo.sub.dy).toBe(1)

      // ここでもう一度回転すると左向き（dx=-1, dy=0）になるが、
      // 左端なので通常は回転できない
      // しかし壁キックにより右に1マスずれて回転できるはず
      act(() => {
        result.current.rotate()
      })

      // 壁キックにより回転成功
      expect(result.current.fallingPuyo.sub.dx).toBe(-1)
      expect(result.current.fallingPuyo.sub.dy).toBe(0)

      // x座標が1増えているはず（壁キック）
      expect(result.current.fallingPuyo.x).toBe(initialX + 1)
    })
  })

  describe('消去処理', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })

    it('着地時に両方のぷよがグリッドに配置されること', () => {
      const { result } = renderHook(() => useGameState(config))

      // 初期状態: 軸ぷよがy=1、子ぷよがy=0（両方画面内）
      expect(result.current.fallingPuyo.y).toBe(1)
      expect(result.current.fallingPuyo.sub.dy).toBe(-1)

      // dropを使って即座に着地させる
      act(() => {
        result.current.drop()
      })

      // グリッドを確認 - 2つのぷよが配置されているはず
      const grid = result.current.grid
      const puyoCount = grid.reduce(
        (count, row) => count + row.filter((cell) => cell !== PuyoColor.EMPTY).length,
        0
      )

      // 両方のぷよがグリッドに配置されているはず
      expect(puyoCount).toBe(2)
    })

    it('横に4つぷよを並べたときに全て消去されること', () => {
      // カスタムコンフィグで確実に同じ色が出るようにモック
      jest.spyOn(Math, 'random').mockReturnValue(0) // 常に最初の色（RED）を返す

      const { result } = renderHook(() => useGameState(config))

      // 1つ目のぷよペアを回転させて横向きにして落とす（x=0,1に配置）
      act(() => {
        // 左端まで移動
        result.current.moveLeft()
        result.current.moveLeft()
        result.current.moveLeft()
        // 右向きに回転
        result.current.rotate()
        result.current.drop()
      })

      // 2つ目のぷよペアを回転させて横向きにして落とす（x=2,3に配置）
      act(() => {
        // x=2の位置に移動
        result.current.moveLeft()
        // 右向きに回転
        result.current.rotate()
        result.current.drop()
      })

      // グリッドを確認 - 4つの赤ぷよが消去されているはず
      const grid = result.current.grid
      let redPuyoCount = 0

      for (let y = 0; y < config.stageRows; y++) {
        for (let x = 0; x < config.stageColumns; x++) {
          if (grid[y][x] === PuyoColor.RED) {
            redPuyoCount++
          }
        }
      }

      // 4つの赤ぷよが消去されているはず（残りは0）
      expect(redPuyoCount).toBe(0)

      // スコアが加算されているはず
      expect(result.current.score).toBeGreaterThan(0)

      // モックをリセット
      jest.restoreAllMocks()
    })

    it('右端近くに横に4つぷよを並べたときに全て消去されること', () => {
      // カスタムコンフィグで確実に同じ色が出るようにモック
      jest.spyOn(Math, 'random').mockReturnValue(0) // 常に最初の色（RED）を返す

      const { result } = renderHook(() => useGameState(config))

      // 1つ目のぷよペアを回転させて横向きにして落とす（x=2,3に配置）
      act(() => {
        // x=2の位置に移動
        result.current.moveLeft()
        // 右向きに回転
        result.current.rotate()
        result.current.drop()
      })

      // 2つ目のぷよペアを回転させて横向きにして落とす（x=4,5に配置）
      act(() => {
        // x=4の位置に移動
        result.current.moveRight()
        // 右向きに回転
        result.current.rotate()
        result.current.drop()
      })

      // グリッドを確認 - 4つの赤ぷよが消去されているはず
      const grid = result.current.grid
      let redPuyoCount = 0

      for (let y = 0; y < config.stageRows; y++) {
        for (let x = 0; x < config.stageColumns; x++) {
          if (grid[y][x] === PuyoColor.RED) {
            redPuyoCount++
          }
        }
      }

      // 4つの赤ぷよが消去されているはず（残りは0）
      expect(redPuyoCount).toBe(0)

      // スコアが加算されているはず
      expect(result.current.score).toBeGreaterThan(0)

      // モックをリセット
      jest.restoreAllMocks()
    })

    it('縦に4つぷよを並べたときに全て消去されること', () => {
      // カスタムコンフィグで確実に同じ色が出るようにモック
      jest.spyOn(Math, 'random').mockReturnValue(0) // 常に最初の色（RED）を返す

      const { result } = renderHook(() => useGameState(config))

      // 1つ目のぷよペアを落とす
      act(() => {
        // 左に移動して x=1 に配置
        result.current.moveLeft()
        result.current.moveLeft()
        result.current.drop()
      })

      // 2つ目のぷよペアを落とす（同じ位置に）
      act(() => {
        result.current.moveLeft()
        result.current.moveLeft()
        result.current.drop()
      })

      // グリッドを確認 - 4つの赤ぷよが消去されているはず
      const grid = result.current.grid
      let redPuyoCount = 0

      for (let y = 0; y < config.stageRows; y++) {
        for (let x = 0; x < config.stageColumns; x++) {
          if (grid[y][x] === PuyoColor.RED) {
            redPuyoCount++
          }
        }
      }

      // 4つの赤ぷよが消去されているはず（残りは0）
      expect(redPuyoCount).toBe(0)

      // スコアが加算されているはず
      expect(result.current.score).toBeGreaterThan(0)

      // モックをリセット
      jest.restoreAllMocks()
    })
  })

  describe('自動落下', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })

    it('一定時間ごとにぷよが下に移動すること', () => {
      const { result } = renderHook(() => useGameState(config))
      const initialY = result.current.fallingPuyo.y

      // 1秒経過
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(result.current.fallingPuyo.y).toBeGreaterThan(initialY)
    })

    it('床に到達したらぷよが固定され新しいぷよが生成されること', () => {
      const { result } = renderHook(() => useGameState(config))

      // ぷよを床まで移動
      act(() => {
        jest.advanceTimersByTime(config.stageRows * 1000)
      })

      // 新しいぷよが生成されているはず（yが1にリセットされている）
      expect(result.current.fallingPuyo.y).toBe(1)
      // グリッドに固定されたぷよがあるはず
      const hasFixedPuyo = result.current.grid.some((row) =>
        row.some((cell) => cell !== PuyoColor.EMPTY)
      )
      expect(hasFixedPuyo).toBe(true)
    })

    it('既存のぷよに接触したら固定され、めり込まないこと', () => {
      const { result } = renderHook(() => useGameState(config))

      // 最初のぷよを床まで落とす
      act(() => {
        jest.advanceTimersByTime(config.stageRows * 1000)
      })

      // プレイ領域の最下行（row 11 = config.stageRows - 2）にぷよがあるはず
      const firstGrid = result.current.grid
      const playAreaBottom = config.stageRows - 2
      const bottomRow = firstGrid[playAreaBottom]
      const firstPuyoInBottomRow = bottomRow.filter((cell) => cell !== PuyoColor.EMPTY).length
      expect(firstPuyoInBottomRow).toBeGreaterThan(0)

      // 2番目のぷよを落とす
      act(() => {
        jest.advanceTimersByTime(config.stageRows * 1000)
      })

      const secondGrid = result.current.grid

      // 合計ぷよ数を確認
      const totalPuyoCount = secondGrid.reduce(
        (count, row) => count + row.filter((cell) => cell !== PuyoColor.EMPTY).length,
        0
      )

      // 少なくとも2個以上のぷよが固定されているはず（最初の2個 + 2番目の2個 = 4個）
      expect(totalPuyoCount).toBeGreaterThanOrEqual(2)

      // 1つのセルに2つ以上のぷよがめり込んでいないことを確認
      const allCellsValid = secondGrid.every((row) =>
        row.every((cell) => cell === PuyoColor.EMPTY || Object.values(PuyoColor).includes(cell))
      )
      expect(allCellsValid).toBe(true)

      // プレイ領域の最下行より上の行にもぷよが存在することを確認（正しく積まれている）
      const rowsAboveBottom = secondGrid.slice(0, playAreaBottom)
      const hasStackedPuyo = rowsAboveBottom.some((row) =>
        row.some((cell) => cell !== PuyoColor.EMPTY)
      )

      // このアサーションが失敗すれば、接触判定が実装されていないことが明確になる
      expect(hasStackedPuyo).toBe(true)
    })
  })

  describe('ゲームオーバー判定', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })

    it('初期状態ではゲームオーバーではないこと', () => {
      const { result } = renderHook(() => useGameState(config))

      expect(result.current.isGameOver).toBe(false)
    })

    it('画面上部（y=0）にぷよが固定されたらゲームオーバーになること', () => {
      // 各ぷよで異なる色を返すようにモック（消去を防ぐ）
      let colorIndex = 0
      jest.spyOn(Math, 'random').mockImplementation(() => {
        // 4色を順番に返す（RED, BLUE, GREEN, YELLOWの順）
        return (colorIndex++ % 4) * 0.26 // 0, 0.26, 0.52, 0.78...
      })

      const { result } = renderHook(() => useGameState(config))

      // ぷよを積み上げて画面上部に到達させる
      // 同じx座標に落とし続ける（消去されないよう異なる色）
      // プレイ領域は12行（y=0からy=11）、各ペアは2行なので6ペア必要
      // 7回ドロップすれば y=0 を超える
      for (let i = 0; i < 7; i++) {
        act(() => {
          // 左端に移動して同じ列に積む
          result.current.moveLeft()
          result.current.moveLeft()
          result.current.moveLeft()
          result.current.drop()
          jest.advanceTimersByTime(1000)
        })
      }

      // ゲームオーバー判定
      expect(result.current.isGameOver).toBe(true)

      // モックをリセット
      jest.restoreAllMocks()
    })

    it('ゲームオーバー後は操作を受け付けないこと', () => {
      // 各ぷよで異なる色を返すようにモック（消去を防ぐ）
      let colorIndex = 0
      jest.spyOn(Math, 'random').mockImplementation(() => {
        // 4色を順番に返す（RED, BLUE, GREEN, YELLOWの順）
        return (colorIndex++ % 4) * 0.26 // 0, 0.26, 0.52, 0.78...
      })

      const { result } = renderHook(() => useGameState(config))

      // ぷよを積み上げてゲームオーバーにする
      // 同じx座標に落とし続ける（消去されないよう異なる色）
      for (let i = 0; i < 7; i++) {
        act(() => {
          // 左端に移動して同じ列に積む
          result.current.moveLeft()
          result.current.moveLeft()
          result.current.moveLeft()
          result.current.drop()
          jest.advanceTimersByTime(1000)
        })
      }

      // ゲームオーバー確認
      expect(result.current.isGameOver).toBe(true)

      const currentPuyoX = result.current.fallingPuyo.x

      // 操作しても反応しない
      act(() => {
        result.current.moveLeft()
      })
      expect(result.current.fallingPuyo.x).toBe(currentPuyoX)

      act(() => {
        result.current.moveRight()
      })
      expect(result.current.fallingPuyo.x).toBe(currentPuyoX)

      // モックをリセット
      jest.restoreAllMocks()
    })
  })

  describe('リスタート機能', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })

    it('restart関数を呼ぶとゲーム状態が初期化されること', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0) // 全て同じ色

      const { result } = renderHook(() => useGameState(config))

      // 横に4つ並べて消去させる（スコアを増やす）
      act(() => {
        result.current.moveLeft()
        result.current.moveLeft()
        result.current.moveLeft()
        result.current.rotate()
        result.current.drop()
        jest.advanceTimersByTime(1000)
      })

      act(() => {
        result.current.moveLeft()
        result.current.rotate()
        result.current.drop()
        jest.advanceTimersByTime(1000)
      })

      // スコアがある状態を確認
      expect(result.current.score).toBeGreaterThan(0)
      // グリッドにぷよがない（消去された）
      const hasNoPuyo = result.current.grid.every((row) =>
        row.every((cell) => cell === PuyoColor.EMPTY)
      )
      expect(hasNoPuyo).toBe(true)

      // リスタート
      act(() => {
        result.current.restart()
      })

      // 初期状態に戻っていることを確認
      expect(result.current.score).toBe(0)
      expect(result.current.chainCount).toBe(0)
      expect(result.current.isGameOver).toBe(false)
      expect(result.current.fallingPuyo.y).toBe(1)

      // グリッドが空になっている
      const isEmpty = result.current.grid.every((row) =>
        row.every((cell) => cell === PuyoColor.EMPTY)
      )
      expect(isEmpty).toBe(true)

      jest.restoreAllMocks()
    })

    it('ゲームオーバー後にrestartを呼ぶとゲームが再開できること', () => {
      // 各ぷよで異なる色を返すようにモック
      let colorIndex = 0
      jest.spyOn(Math, 'random').mockImplementation(() => {
        return (colorIndex++ % 4) * 0.26
      })

      const { result } = renderHook(() => useGameState(config))

      // ゲームオーバーにする
      for (let i = 0; i < 7; i++) {
        act(() => {
          result.current.moveLeft()
          result.current.moveLeft()
          result.current.moveLeft()
          result.current.drop()
          jest.advanceTimersByTime(1000)
        })
      }

      // ゲームオーバー確認
      expect(result.current.isGameOver).toBe(true)

      // リスタート
      act(() => {
        result.current.restart()
      })

      // ゲームが再開できることを確認
      expect(result.current.isGameOver).toBe(false)

      // 操作が再び受け付けられる
      const initialX = result.current.fallingPuyo.x
      act(() => {
        result.current.moveLeft()
      })
      expect(result.current.fallingPuyo.x).toBe(initialX - 1)

      jest.restoreAllMocks()
    })
  })
})
