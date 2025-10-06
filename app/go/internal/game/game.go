package game

import (
	"github.com/case-study-game-dev/puyo-puyo-go/internal/board"
	"github.com/hajimehoshi/ebiten/v2"
)

const (
	// ScreenWidth は画面の幅
	ScreenWidth = 240
	// ScreenHeight は画面の高さ
	ScreenHeight = 360
)

// Game はゲームの状態を管理する
type Game struct {
	Board *board.Board
}

// New は新しいゲームを作成する
func New() *Game {
	return &Game{
		Board: board.New(),
	}
}

// Update はゲームの状態を更新する（1フレームごとに呼ばれる）
func (g *Game) Update() error {
	return nil
}

// Draw は画面を描画する
func (g *Game) Draw(screen *ebiten.Image) {
	// 次のイテレーションで実装
}

// Layout は画面のレイアウトを決定する
func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	return ScreenWidth, ScreenHeight
}
