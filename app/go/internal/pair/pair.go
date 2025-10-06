package pair

import (
	"github.com/case-study-game-dev/puyo-puyo-go/internal/board"
	"github.com/case-study-game-dev/puyo-puyo-go/internal/puyo"
)

// PuyoPair は落下中のぷよペアを表す
type PuyoPair struct {
	AxisX      int
	AxisY      int
	AxisColor  puyo.Color
	ChildX     int
	ChildY     int
	ChildColor puyo.Color
}

// New は新しいぷよペアを作成する
// 初期状態では子ぷよは軸ぷよの上（Y-1）に配置される
func New(axisX, axisY int, axisColor, childColor puyo.Color) *PuyoPair {
	return &PuyoPair{
		AxisX:      axisX,
		AxisY:      axisY,
		AxisColor:  axisColor,
		ChildX:     axisX,
		ChildY:     axisY - 1,
		ChildColor: childColor,
	}
}

// MoveLeft は軸ぷよと子ぷよを左に移動する
func (p *PuyoPair) MoveLeft() {
	p.AxisX--
	p.ChildX--
}

// MoveRight は軸ぷよと子ぷよを右に移動する
func (p *PuyoPair) MoveRight() {
	p.AxisX++
	p.ChildX++
}

// IsCollision は指定した位置に衝突があるかチェックする
func (p *PuyoPair) IsCollision(b *board.Board, axisX, axisY, childX, childY int) bool {
	// 軸ぷよの衝突判定
	if !isValidPosition(b, axisX, axisY) {
		return true
	}

	// 子ぷよの衝突判定
	// Y=-1（画面上端の1マス上）は許可、それより上（Y<-1）は衝突
	if childY < -1 {
		return true
	}
	// Y>=0の場合は通常の衝突判定
	if childY >= 0 && !isValidPosition(b, childX, childY) {
		return true
	}

	return false
}

// isValidPosition は指定した位置が有効かチェックする
func isValidPosition(b *board.Board, x, y int) bool {
	// 範囲外チェック
	if x < 0 || x >= board.Cols || y < 0 || y >= board.Rows {
		return false
	}

	// ぷよが既にあるかチェック
	if b.Get(y, x) != puyo.ColorNone {
		return false
	}

	return true
}

// CanMoveLeft は左に移動できるかチェックする
func (p *PuyoPair) CanMoveLeft(b *board.Board) bool {
	return !p.IsCollision(b, p.AxisX-1, p.AxisY, p.ChildX-1, p.ChildY)
}

// CanMoveRight は右に移動できるかチェックする
func (p *PuyoPair) CanMoveRight(b *board.Board) bool {
	return !p.IsCollision(b, p.AxisX+1, p.AxisY, p.ChildX+1, p.ChildY)
}
