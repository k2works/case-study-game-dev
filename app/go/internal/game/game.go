package game

import (
	"image/color"
	"math/rand"

	"github.com/case-study-game-dev/puyo-puyo-go/internal/board"
	"github.com/case-study-game-dev/puyo-puyo-go/internal/pair"
	"github.com/case-study-game-dev/puyo-puyo-go/internal/puyo"
	"github.com/hajimehoshi/ebiten/v2"
	"github.com/hajimehoshi/ebiten/v2/ebitenutil"
)

const (
	ScreenWidth  = 240
	ScreenHeight = 360
	CellSize     = 30
	BoardOffsetX = 30
	BoardOffsetY = 30
)

// Game はゲームの状態を管理する
type Game struct {
	Board       *board.Board
	CurrentPair *pair.PuyoPair
}

// New は新しいゲームを作成する
func New() *Game {
	g := &Game{
		Board: board.New(),
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

	g.CurrentPair = pair.New(2, 0, axisColor, childColor)
}

// Update はゲームの状態を更新する（1フレームごとに呼ばれる）
func (g *Game) Update() error {
	if g.CurrentPair == nil {
		return nil
	}

	// 左キー
	if ebiten.IsKeyPressed(ebiten.KeyArrowLeft) {
		if g.CurrentPair.CanMoveLeft(g.Board) {
			g.CurrentPair.MoveLeft()
		}
	}

	// 右キー
	if ebiten.IsKeyPressed(ebiten.KeyArrowRight) {
		if g.CurrentPair.CanMoveRight(g.Board) {
			g.CurrentPair.MoveRight()
		}
	}

	return nil
}

// Draw は画面を描画する
func (g *Game) Draw(screen *ebiten.Image) {
	// ボードを描画
	g.drawBoard(screen)

	// 現在のぷよペアを描画
	if g.CurrentPair != nil {
		g.drawPuyoPair(screen)
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
	ebitenutil.DrawRect(screen, x+2, y+2, float64(CellSize-4), float64(CellSize-4),
		color.RGBA{r, gr, b, 255})
}

// Layout は画面のレイアウトを決定する
func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	return ScreenWidth, ScreenHeight
}
