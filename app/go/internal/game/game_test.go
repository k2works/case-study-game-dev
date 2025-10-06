package game

import (
	"testing"

	"github.com/case-study-game-dev/puyo-puyo-go/internal/board"
	"github.com/case-study-game-dev/puyo-puyo-go/internal/puyo"
	"github.com/hajimehoshi/ebiten/v2"
	"github.com/stretchr/testify/assert"
)

func TestGame(t *testing.T) {
	t.Run("新しいゲームはボードを持つ", func(t *testing.T) {
		g := New()

		assert.NotNil(t, g.Board)
		assert.IsType(t, &board.Board{}, g.Board)
	})

	t.Run("Updateメソッドは正常に動作する", func(t *testing.T) {
		g := New()

		err := g.Update()

		assert.NoError(t, err)
	})

	t.Run("Layoutメソッドは画面サイズを返す", func(t *testing.T) {
		g := New()

		width, height := g.Layout(640, 480)

		assert.Equal(t, 240, width)
		assert.Equal(t, 360, height)
	})
}

func TestGameScore(t *testing.T) {
	t.Run("ぷよを消すとスコアが加算される", func(t *testing.T) {
		g := New()

		// ボードに4つの赤ぷよを配置（消去可能な状態）
		g.Board.Set(11, 1, puyo.ColorRed)
		g.Board.Set(11, 2, puyo.ColorRed)
		g.Board.Set(10, 1, puyo.ColorRed)
		g.Board.Set(10, 2, puyo.ColorRed)

		// 残るぷよを配置（全消しにならないように）
		g.Board.Set(11, 4, puyo.ColorBlue)

		// 消去判定モードに設定
		g.Mode = ModeChecking
		g.Update()

		// スコアが加算されていることを確認
		assert.Equal(t, 40, g.Score.Total) // 4 * 10 = 40
		assert.Equal(t, 1, g.Score.Chain)  // 1連鎖
	})

	t.Run("連鎖するとボーナスが付く", func(t *testing.T) {
		g := New()

		// 1連鎖目の配置（赤4つ）
		g.Board.Set(11, 1, puyo.ColorRed)
		g.Board.Set(11, 2, puyo.ColorRed)
		g.Board.Set(10, 1, puyo.ColorRed)
		g.Board.Set(10, 2, puyo.ColorRed)

		// 2連鎖目の配置（青3つ、赤の上）
		// 赤が消えた後、重力で青が下に落ちて4つ揃う
		g.Board.Set(9, 1, puyo.ColorBlue)
		g.Board.Set(9, 2, puyo.ColorBlue)
		g.Board.Set(8, 1, puyo.ColorBlue)
		// 青4つ目は別の列に配置（落下後に揃う）
		g.Board.Set(7, 2, puyo.ColorBlue)

		// 残るぷよを配置（全消しにならないように）
		g.Board.Set(11, 4, puyo.ColorGreen)

		// 1回目の消去判定
		g.Mode = ModeChecking
		g.Update()

		firstScore := g.Score.Total
		assert.Equal(t, 40, firstScore) // 4 * 10 * 1 = 40
		assert.Equal(t, 1, g.Score.Chain)

		// 重力適用
		g.Mode = ModeFalling
		for g.hasFloatingPuyo() {
			g.applyGravity()
		}

		// 2回目の消去判定（青が落ちて4つ揃う）
		g.Mode = ModeChecking
		g.Update()

		// 2連鎖ボーナスが付いていることを確認
		assert.Equal(t, 120, g.Score.Total) // 40 + (4 * 10 * 2) = 120
		assert.Equal(t, 2, g.Score.Chain)
	})

	t.Run("消去できないときは連鎖がリセットされる", func(t *testing.T) {
		g := New()
		g.Score.Chain = 3

		// 消去できない状態
		g.Board.Set(11, 1, puyo.ColorRed)
		g.Board.Set(11, 2, puyo.ColorBlue)

		// 消去判定
		g.Mode = ModeChecking
		g.Update()

		// 連鎖がリセットされていることを確認
		assert.Equal(t, 0, g.Score.Chain)
	})
}

func TestGameOver(t *testing.T) {
	t.Run("出現位置が埋まっているとゲームオーバーになる", func(t *testing.T) {
		g := New()

		// 出現位置(2, 1)にぷよを配置
		g.Board.Set(1, 2, puyo.ColorRed)

		// 新しいぷよペアを生成しようとする
		g.spawnNewPair()

		// ゲームオーバーモードになっていることを確認
		assert.Equal(t, ModeGameOver, g.Mode)
		// 現在のぷよペアがnilになっていることを確認
		assert.Nil(t, g.CurrentPair)
	})

	t.Run("出現位置が空いているとゲームオーバーにならない", func(t *testing.T) {
		g := New()

		// 出現位置を空けておく
		// （何も配置しない）

		// 新しいぷよペアを生成
		g.spawnNewPair()

		// プレイモードのままであることを確認
		assert.NotEqual(t, ModeGameOver, g.Mode)
		// ぷよペアが生成されていることを確認
		assert.NotNil(t, g.CurrentPair)
	})
}

func TestGameOverInput(t *testing.T) {
	t.Run("ゲームオーバー中は通常の入力を受け付けない", func(t *testing.T) {
		g := New()
		g.Mode = ModeGameOver
		g.CurrentPair = nil

		// Updateを呼んでも何も起こらない
		err := g.Update()

		assert.NoError(t, err)
		assert.Equal(t, ModeGameOver, g.Mode)
		assert.Nil(t, g.CurrentPair)
	})
}

func TestGameAllClearBonus(t *testing.T) {
	t.Run("全消しすると5000点のボーナスが加算される", func(t *testing.T) {
		g := New()

		// ボードに4つの赤ぷよを配置（消去可能な状態）
		g.Board.Set(11, 1, puyo.ColorRed)
		g.Board.Set(11, 2, puyo.ColorRed)
		g.Board.Set(10, 1, puyo.ColorRed)
		g.Board.Set(10, 2, puyo.ColorRed)

		// 消去判定モードに設定
		g.Mode = ModeChecking
		g.Update()

		// 基本スコア: 4 * 10 = 40
		// 全消しボーナス: 5000
		// 合計: 5040
		assert.Equal(t, 5040, g.Score.Total)
		assert.True(t, g.Board.IsAllClear())
	})

	t.Run("全消しでない場合はボーナスが加算されない", func(t *testing.T) {
		g := New()

		// ボードに消去可能な4つの赤ぷよを配置
		g.Board.Set(11, 1, puyo.ColorRed)
		g.Board.Set(11, 2, puyo.ColorRed)
		g.Board.Set(10, 1, puyo.ColorRed)
		g.Board.Set(10, 2, puyo.ColorRed)

		// 残るぷよを配置（消去されない）
		g.Board.Set(11, 4, puyo.ColorBlue)

		// 消去判定モードに設定
		g.Mode = ModeChecking
		g.Update()

		// 基本スコアのみ: 4 * 10 = 40
		assert.Equal(t, 40, g.Score.Total)
		assert.False(t, g.Board.IsAllClear())
	})
}

func TestGameFalling(t *testing.T) {
	t.Run("時間経過でぷよペアが自動落下する", func(t *testing.T) {
		g := New()
		initialY := g.CurrentPair.AxisY

		// FallInterval に達するまで時間を進める
		g.FallTimer = FallInterval
		g.Update()

		// 下に移動していることを確認
		assert.True(t, g.CurrentPair.AxisY > initialY)
	})

	t.Run("着地後はボードに固定される", func(t *testing.T) {
		g := New()
		axisColor := g.CurrentPair.AxisColor
		childColor := g.CurrentPair.ChildColor

		// ボードの底まで落とす
		for g.CurrentPair != nil && g.Mode == ModePlaying {
			g.FallTimer = FallInterval
			g.Update()
		}

		// ModeFalling または ModeChecking になっているはず
		assert.True(t, g.Mode == ModeFalling || g.Mode == ModeChecking)

		// ボードにぷよが配置されていることを確認
		hasAxisColor := false
		hasChildColor := false
		for row := 0; row < board.Rows; row++ {
			for col := 0; col < board.Cols; col++ {
				if g.Board.Get(row, col) == axisColor {
					hasAxisColor = true
				}
				if g.Board.Get(row, col) == childColor {
					hasChildColor = true
				}
			}
		}
		assert.True(t, hasAxisColor)
		assert.True(t, hasChildColor)
	})
}

func TestGameRestart(t *testing.T) {
	t.Run("リスタートするとゲーム状態がリセットされる", func(t *testing.T) {
		g := New()

		// ゲーム状態を変更
		g.Board.Set(11, 0, puyo.ColorRed)
		g.Score.Total = 1000
		g.Score.Chain = 5
		g.Mode = ModeGameOver

		// リスタート
		g.restart()

		// ボードが空になっていることを確認
		isEmpty := true
		for row := 0; row < board.Rows; row++ {
			for col := 0; col < board.Cols; col++ {
				if g.Board.Get(row, col) != puyo.ColorNone {
					isEmpty = false
				}
			}
		}
		assert.True(t, isEmpty)

		// スコアがリセットされていることを確認
		assert.Equal(t, 0, g.Score.Total)
		assert.Equal(t, 0, g.Score.Chain)

		// モードがプレイモードに戻っていることを確認
		assert.Equal(t, ModePlaying, g.Mode)

		// 新しいぷよペアが生成されていることを確認
		assert.NotNil(t, g.CurrentPair)
	})
}

func TestGameMovement(t *testing.T) {
	t.Run("左に移動できる", func(t *testing.T) {
		g := New()
		initialX := g.CurrentPair.AxisX

		// 左に移動
		g.tryMove(true)

		// 位置が変わったことを確認
		assert.Equal(t, initialX-1, g.CurrentPair.AxisX)
	})

	t.Run("右に移動できる", func(t *testing.T) {
		g := New()
		initialX := g.CurrentPair.AxisX

		// 右に移動
		g.tryMove(false)

		// 位置が変わったことを確認
		assert.Equal(t, initialX+1, g.CurrentPair.AxisX)
	})

	t.Run("壁があると移動できない", func(t *testing.T) {
		g := New()

		// 左端まで移動
		for g.CurrentPair.CanMoveLeft(g.Board) {
			g.CurrentPair.MoveLeft()
		}
		leftX := g.CurrentPair.AxisX

		// さらに左に移動しようとしても移動しない
		g.tryMove(true)
		assert.Equal(t, leftX, g.CurrentPair.AxisX)
	})
}

func TestGameLockPair(t *testing.T) {
	t.Run("子ぷよが画面外の場合でも軸ぷよは配置される", func(t *testing.T) {
		g := New()

		// 子ぷよを画面外に配置（Y < 0）
		g.CurrentPair.ChildY = -1
		axisColor := g.CurrentPair.AxisColor
		axisX := g.CurrentPair.AxisX
		axisY := g.CurrentPair.AxisY

		// lockPair を実行
		g.lockPair()

		// 軸ぷよがボードに配置されていることを確認
		assert.Equal(t, axisColor, g.Board.Get(axisY, axisX))

		// CurrentPair が nil になっていることを確認
		assert.Nil(t, g.CurrentPair)
	})
}

func TestGameDraw(t *testing.T) {
	t.Run("ゲームオーバー時の描画", func(t *testing.T) {
		g := New()
		g.Mode = ModeGameOver
		g.CurrentPair = nil

		// 描画メソッドを呼び出してもパニックしないことを確認
		// 実際の画面への描画はスキップするが、メソッドの実行パスをテスト
		img := ebiten.NewImage(ScreenWidth, ScreenHeight)
		assert.NotPanics(t, func() {
			g.Draw(img)
		})
	})

	t.Run("プレイ中の描画", func(t *testing.T) {
		g := New()

		// ボードにぷよを配置
		g.Board.Set(11, 0, puyo.ColorRed)
		g.Board.Set(11, 1, puyo.ColorBlue)

		// 描画メソッドを呼び出してもパニックしないことを確認
		img := ebiten.NewImage(ScreenWidth, ScreenHeight)
		assert.NotPanics(t, func() {
			g.Draw(img)
		})
	})

	t.Run("CurrentPairがnilの場合の描画", func(t *testing.T) {
		g := New()
		g.CurrentPair = nil

		// CurrentPair が nil でもパニックしないことを確認
		img := ebiten.NewImage(ScreenWidth, ScreenHeight)
		assert.NotPanics(t, func() {
			g.Draw(img)
		})
	})
}
