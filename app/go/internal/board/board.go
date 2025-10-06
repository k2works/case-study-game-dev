package board

import "github.com/case-study-game-dev/puyo-puyo-go/internal/puyo"

const (
	// Rows はボードの行数
	Rows = 12
	// Cols はボードの列数
	Cols = 6
)

// Position はボード上の位置を表す
type Position struct {
	Row, Col int
}

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

// CheckErase は消去可能なぷよを検出する
func (b *Board) CheckErase() []Position {
	visited := make(map[Position]bool)
	var toErase []Position

	for row := 0; row < Rows; row++ {
		for col := 0; col < Cols; col++ {
			pos := Position{row, col}
			if visited[pos] || b.Cells[row][col] == puyo.ColorNone {
				continue
			}

			group := b.dfs(row, col, b.Cells[row][col], visited)
			if len(group) >= 4 {
				toErase = append(toErase, group...)
			}
		}
	}

	return toErase
}

// dfs は深さ優先探索で同じ色のぷよグループを見つける
func (b *Board) dfs(row, col int, color puyo.Color, visited map[Position]bool) []Position {
	pos := Position{row, col}
	if visited[pos] {
		return nil
	}

	if row < 0 || row >= Rows || col < 0 || col >= Cols {
		return nil
	}

	if b.Cells[row][col] != color {
		return nil
	}

	visited[pos] = true
	group := []Position{pos}

	// 上下左右を探索
	group = append(group, b.dfs(row-1, col, color, visited)...)
	group = append(group, b.dfs(row+1, col, color, visited)...)
	group = append(group, b.dfs(row, col-1, color, visited)...)
	group = append(group, b.dfs(row, col+1, color, visited)...)

	return group
}

// Erase は指定した位置のぷよを消去する
func (b *Board) Erase(positions []Position) {
	for _, pos := range positions {
		b.Cells[pos.Row][pos.Col] = puyo.ColorNone
	}
}
