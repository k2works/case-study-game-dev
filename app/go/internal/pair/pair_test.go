package pair

import (
	"testing"

	"github.com/case-study-game-dev/puyo-puyo-go/internal/board"
	"github.com/case-study-game-dev/puyo-puyo-go/internal/puyo"
	"github.com/stretchr/testify/assert"
)

func TestPuyoPair(t *testing.T) {
	t.Run("新しいぷよペアは軸ぷよと子ぷよを持つ", func(t *testing.T) {
		p := New(2, 0, puyo.ColorRed, puyo.ColorBlue)

		assert.Equal(t, 2, p.AxisX)
		assert.Equal(t, 0, p.AxisY)
		assert.Equal(t, puyo.ColorRed, p.AxisColor)
		assert.Equal(t, 2, p.ChildX)
		assert.Equal(t, -1, p.ChildY)
		assert.Equal(t, puyo.ColorBlue, p.ChildColor)
	})

	t.Run("左に移動すると位置が1減る", func(t *testing.T) {
		p := New(2, 0, puyo.ColorRed, puyo.ColorBlue)

		p.MoveLeft()

		assert.Equal(t, 1, p.AxisX)
		assert.Equal(t, 1, p.ChildX)
	})

	t.Run("右に移動すると位置が1増える", func(t *testing.T) {
		p := New(2, 0, puyo.ColorRed, puyo.ColorBlue)

		p.MoveRight()

		assert.Equal(t, 3, p.AxisX)
		assert.Equal(t, 3, p.ChildX)
	})
}

func TestPuyoPairCollision(t *testing.T) {
	t.Run("ボード範囲外の位置は衝突と判定される", func(t *testing.T) {
		p := New(0, 0, puyo.ColorRed, puyo.ColorBlue)
		b := board.New()

		// 左端（X=-1）は衝突
		assert.True(t, p.IsCollision(b, -1, 0, -1, -1))

		// 右端（X=6）は衝突
		assert.True(t, p.IsCollision(b, 6, 0, 6, -1))

		// 上端（Y=-2）は衝突
		assert.True(t, p.IsCollision(b, 2, 0, 2, -2))

		// 下端（Y=12）は衝突
		assert.True(t, p.IsCollision(b, 2, 12, 2, 11))
	})

	t.Run("ぷよがある位置は衝突と判定される", func(t *testing.T) {
		p := New(2, 0, puyo.ColorRed, puyo.ColorBlue)
		b := board.New()
		b.Set(11, 2, puyo.ColorGreen)

		// ぷよがある位置は衝突
		assert.True(t, p.IsCollision(b, 2, 11, 2, 10))
	})

	t.Run("空いている位置は衝突しない", func(t *testing.T) {
		p := New(2, 0, puyo.ColorRed, puyo.ColorBlue)
		b := board.New()

		// 空いている位置は衝突しない
		assert.False(t, p.IsCollision(b, 2, 0, 2, -1))
	})
}
