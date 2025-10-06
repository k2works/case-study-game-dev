package pair

import (
	"github.com/case-study-game-dev/puyo-puyo-go/internal/board"
	"github.com/case-study-game-dev/puyo-puyo-go/internal/puyo"
)

// Direction はぷよペアの向きを表す
type Direction int

const (
	DirUp Direction = iota
	DirRight
	DirDown
	DirLeft
)

// PuyoPair は落下中のぷよペアを表す
type PuyoPair struct {
	AxisX      int
	AxisY      int
	AxisColor  puyo.Color
	ChildX     int
	ChildY     int
	ChildColor puyo.Color
	Direction  Direction
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
		Direction:  DirUp,
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

// MoveDown は軸ぷよと子ぷよを下に移動する
func (p *PuyoPair) MoveDown() {
	p.AxisY++
	p.ChildY++
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

// CanMoveDown は下に移動できるかチェックする
func (p *PuyoPair) CanMoveDown(b *board.Board) bool {
	return !p.IsCollision(b, p.AxisX, p.AxisY+1, p.ChildX, p.ChildY+1)
}

// calcChildPosition は方向から子ぷよの位置を計算する
func (p *PuyoPair) calcChildPosition(axisX, axisY int, dir Direction) (int, int) {
	switch dir {
	case DirUp:
		return axisX, axisY - 1
	case DirRight:
		return axisX + 1, axisY
	case DirDown:
		return axisX, axisY + 1
	case DirLeft:
		return axisX - 1, axisY
	default:
		return axisX, axisY - 1
	}
}

// Rotate は右回転する（壁キック付き）
func (p *PuyoPair) Rotate(b *board.Board) bool {
	newDir := (p.Direction + 1) % 4
	newChildX, newChildY := p.calcChildPosition(p.AxisX, p.AxisY, newDir)

	// 回転可能かチェック
	if !p.IsCollision(b, p.AxisX, p.AxisY, newChildX, newChildY) {
		p.Direction = newDir
		p.ChildX = newChildX
		p.ChildY = newChildY
		return true
	}

	// 壁キック: 左にずらして回転
	if !p.IsCollision(b, p.AxisX-1, p.AxisY, newChildX-1, newChildY) {
		p.AxisX--
		p.ChildX = newChildX - 1
		p.ChildY = newChildY
		p.Direction = newDir
		return true
	}

	// 壁キック: 右にずらして回転
	if !p.IsCollision(b, p.AxisX+1, p.AxisY, newChildX+1, newChildY) {
		p.AxisX++
		p.ChildX = newChildX + 1
		p.ChildY = newChildY
		p.Direction = newDir
		return true
	}

	return false
}
