package board

import "github.com/case-study-game-dev/puyo-puyo-go/internal/puyo"

const (
	// Rows はボードの行数
	Rows = 12
	// Cols はボードの列数
	Cols = 6
)

// Board はぷよぷよの盤面を表す
type Board struct {
	Cells [Rows][Cols]puyo.Color
}

// New は新しいボードを作成する
func New() *Board {
	return &Board{}
}

// Set は指定した位置にぷよを配置する
func (b *Board) Set(row, col int, color puyo.Color) {
	if row >= 0 && row < Rows && col >= 0 && col < Cols {
		b.Cells[row][col] = color
	}
}

// Get は指定した位置のぷよの色を取得する
func (b *Board) Get(row, col int) puyo.Color {
	if row >= 0 && row < Rows && col >= 0 && col < Cols {
		return b.Cells[row][col]
	}
	return puyo.ColorNone
}
