package game

import (
	"fmt"
	"image/color"
	"math/rand"

	"github.com/case-study-game-dev/puyo-puyo-go/internal/board"
	"github.com/case-study-game-dev/puyo-puyo-go/internal/pair"
	"github.com/case-study-game-dev/puyo-puyo-go/internal/puyo"
	"github.com/case-study-game-dev/puyo-puyo-go/internal/score"
	"github.com/hajimehoshi/ebiten/v2"
	"github.com/hajimehoshi/ebiten/v2/ebitenutil"
	"github.com/hajimehoshi/ebiten/v2/inpututil"
	"github.com/hajimehoshi/ebiten/v2/vector"
)

const (
	ScreenWidth  = 240
	ScreenHeight = 360
	CellSize     = 30
	BoardOffsetX = 30
	BoardOffsetY = 0   // ボード12行×30px=360pxが画面内に収まるように0に設定
	FallInterval = 0.5 // 0.5秒ごとに落下
)

// GameMode はゲームの状態を表す
type GameMode int

const (
	ModePlaying GameMode = iota
	ModeFalling
	ModeChecking
	ModeGameOver
)

// Game はゲームの状態を管理する
type Game struct {
	Board          *board.Board
	CurrentPair    *pair.PuyoPair
	Mode           GameMode
	FallTimer      float64
	moveDelayTimer int
	Score          *score.Score
}

// New は新しいゲームを作成する
func New() *Game {
	g := &Game{
		Board: board.New(),
		Mode:  ModePlaying,
		Score: score.New(),
	}
	g.spawnNewPair()
	return g
}

// spawnNewPair は新しいぷよペアを生成する
func (g *Game) spawnNewPair() {
	colors := []puyo.Color{
		puyo.ColorRed,
		puyo.ColorBlue,
		puyo.ColorGreen,
		puyo.ColorYellow,
	}

	axisColor := colors[rand.Intn(len(colors))]
	childColor := colors[rand.Intn(len(colors))]

	newPair := pair.New(2, 1, axisColor, childColor)

	// ゲームオーバー判定：新しいぷよペアが配置できるかチェック
	if newPair.IsCollision(g.Board, newPair.AxisX, newPair.AxisY,
		newPair.ChildX, newPair.ChildY) {
		// 配置できない場合はゲームオーバー
		g.Mode = ModeGameOver
		g.CurrentPair = nil
		return
	}

	// 配置できる場合は通常通りセット
	g.CurrentPair = newPair
	g.Mode = ModePlaying
	g.FallTimer = 0
}

// Update はゲームの状態を更新する（1フレームごとに呼ばれる）
func (g *Game) Update() error {
	// ゲームオーバー中の処理
	if g.Mode == ModeGameOver {
		// Rキーでリスタート
		if inpututil.IsKeyJustPressed(ebiten.KeyR) {
			g.restart()
		}
		return nil
	}

	dt := 1.0 / 60.0 // 60FPS

	switch g.Mode {
	case ModePlaying:
		g.handleInput()
		g.updateFall(dt)
	case ModeFalling:
		// 落下中のぷよを処理
		g.applyGravity()
		if !g.hasFloatingPuyo() {
			g.Mode = ModeChecking
		}
	case ModeChecking:
		positions := g.Board.CheckErase()
		if len(positions) > 0 {
			// 連鎖数を増やす
			g.Score.IncrementChain()

			// スコアを加算
			g.Score.Add(len(positions), g.Score.Chain)

			// ぷよを消去
			g.Board.Erase(positions)

			// 重力適用モードへ
			g.Mode = ModeFalling
		} else {
			// 消去するぷよがない場合は連鎖終了
			g.Score.ResetChain()

			// 新しいぷよペアを生成
			g.spawnNewPair()
		}
	}

	return nil
}

func (g *Game) handleInput() {
	if g.CurrentPair == nil {
		return
	}

	// 移動ディレイタイマーを減らす
	if g.moveDelayTimer > 0 {
		g.moveDelayTimer--
	}

	// 左右移動
	g.handleHorizontalMove(ebiten.KeyArrowLeft, true)
	g.handleHorizontalMove(ebiten.KeyArrowRight, false)

	// 回転
	if inpututil.IsKeyJustPressed(ebiten.KeyZ) || inpututil.IsKeyJustPressed(ebiten.KeyArrowUp) {
		g.CurrentPair.Rotate(g.Board)
	}
}

func (g *Game) handleHorizontalMove(key ebiten.Key, isLeft bool) {
	if !ebiten.IsKeyPressed(key) {
		return
	}

	if inpututil.IsKeyJustPressed(key) {
		// 最初の入力は即座に反応
		g.tryMove(isLeft)
		if g.moveDelayTimer == 0 {
			g.moveDelayTimer = 8 // 約0.13秒の遅延
		}
	} else if g.moveDelayTimer == 0 {
		// 長押し時は遅延後に移動
		g.tryMove(isLeft)
		g.moveDelayTimer = 4 // 連続移動時は少し早く
	}
}

func (g *Game) tryMove(isLeft bool) {
	if isLeft {
		if g.CurrentPair.CanMoveLeft(g.Board) {
			g.CurrentPair.MoveLeft()
		}
	} else {
		if g.CurrentPair.CanMoveRight(g.Board) {
			g.CurrentPair.MoveRight()
		}
	}
}

func (g *Game) updateFall(dt float64) {
	if g.CurrentPair == nil {
		return
	}

	g.FallTimer += dt

	if g.FallTimer >= FallInterval {
		g.FallTimer = 0

		// 下に移動できるかチェック
		if g.CurrentPair.CanMoveDown(g.Board) {
			g.CurrentPair.MoveDown()
		} else {
			// 着地
			g.lockPair()
			g.Mode = ModeFalling
		}
	}
}

func (g *Game) lockPair() {
	if g.CurrentPair == nil {
		return
	}

	// 軸ぷよをボードに配置
	g.Board.Set(g.CurrentPair.AxisY, g.CurrentPair.AxisX, g.CurrentPair.AxisColor)

	// 子ぷよをボードに配置（画面内の場合のみ）
	if g.CurrentPair.ChildY >= 0 {
		g.Board.Set(g.CurrentPair.ChildY, g.CurrentPair.ChildX, g.CurrentPair.ChildColor)
	}

	g.CurrentPair = nil
}

func (g *Game) applyGravity() {
	// ボードの下から上に向かって処理
	for col := 0; col < board.Cols; col++ {
		for row := board.Rows - 2; row >= 0; row-- {
			if g.Board.Get(row, col) != puyo.ColorNone {
				// 下に空きがあれば落とす
				newRow := row
				for newRow+1 < board.Rows && g.Board.Get(newRow+1, col) == puyo.ColorNone {
					newRow++
				}
				if newRow != row {
					g.Board.Set(newRow, col, g.Board.Get(row, col))
					g.Board.Set(row, col, puyo.ColorNone)
				}
			}
		}
	}
}

func (g *Game) hasFloatingPuyo() bool {
	// 各列について、空きの上にぷよがあるかチェック
	for col := 0; col < board.Cols; col++ {
		for row := board.Rows - 1; row > 0; row-- {
			if g.Board.Get(row, col) == puyo.ColorNone && g.Board.Get(row-1, col) != puyo.ColorNone {
				return true
			}
		}
	}
	return false
}

// restart はゲームを初期状態に戻す
func (g *Game) restart() {
	// ボードをクリア
	g.Board = board.New()

	// スコアをリセット
	g.Score = score.New()

	// モードをプレイモードに
	g.Mode = ModePlaying

	// 新しいぷよペアを生成
	g.spawnNewPair()

	// タイマーをリセット
	g.FallTimer = 0
}

// Draw は画面を描画する
func (g *Game) Draw(screen *ebiten.Image) {
	// ボードを描画
	g.drawBoard(screen)

	// 現在のぷよペアを描画
	if g.CurrentPair != nil {
		g.drawPuyoPair(screen)
	}

	// スコアを表示
	scoreText := fmt.Sprintf("Score: %d", g.Score.Total)
	ebitenutil.DebugPrintAt(screen, scoreText, 10, 10)

	// 連鎖数を表示（連鎖中のみ）
	if g.Score.Chain > 0 {
		chainText := fmt.Sprintf("Chain: %d", g.Score.Chain)
		ebitenutil.DebugPrintAt(screen, chainText, 10, 30)
	}

	// ゲームオーバー表示
	if g.Mode == ModeGameOver {
		gameOverText := "GAME OVER"
		ebitenutil.DebugPrintAt(screen, gameOverText, 60, 160)
		restartText := "Press R to Restart"
		ebitenutil.DebugPrintAt(screen, restartText, 40, 180)
	}
}

func (g *Game) drawBoard(screen *ebiten.Image) {
	// ボードの枠を描画
	for row := 0; row < board.Rows; row++ {
		for col := 0; col < board.Cols; col++ {
			x := float64(BoardOffsetX + col*CellSize)
			y := float64(BoardOffsetY + row*CellSize)

			puyoColor := g.Board.Get(row, col)
			if puyoColor != puyo.ColorNone {
				g.drawPuyo(screen, x, y, puyoColor)
			}
		}
	}
}

func (g *Game) drawPuyoPair(screen *ebiten.Image) {
	// 軸ぷよ
	axisX := float64(BoardOffsetX + g.CurrentPair.AxisX*CellSize)
	axisY := float64(BoardOffsetY + g.CurrentPair.AxisY*CellSize)
	g.drawPuyo(screen, axisX, axisY, g.CurrentPair.AxisColor)

	// 子ぷよ（画面内の場合のみ）
	if g.CurrentPair.ChildY >= 0 {
		childX := float64(BoardOffsetX + g.CurrentPair.ChildX*CellSize)
		childY := float64(BoardOffsetY + g.CurrentPair.ChildY*CellSize)
		g.drawPuyo(screen, childX, childY, g.CurrentPair.ChildColor)
	}
}

func (g *Game) drawPuyo(screen *ebiten.Image, x, y float64, puyoColor puyo.Color) {
	var r, gr, b uint8

	switch puyoColor {
	case puyo.ColorRed:
		r, gr, b = 255, 0, 0
	case puyo.ColorBlue:
		r, gr, b = 0, 0, 255
	case puyo.ColorGreen:
		r, gr, b = 0, 255, 0
	case puyo.ColorYellow:
		r, gr, b = 255, 255, 0
	default:
		return
	}

	// ぷよを円として描画
	centerX := float32(x + float64(CellSize)/2)
	centerY := float32(y + float64(CellSize)/2)
	radius := float32(CellSize)/2 - 2
	vector.DrawFilledCircle(screen, centerX, centerY, radius, color.RGBA{r, gr, b, 255}, true)
}

// Layout は画面のレイアウトを決定する
func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	return ScreenWidth, ScreenHeight
}
