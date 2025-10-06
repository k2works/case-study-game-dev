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

func TestPuyoPairRotate(t *testing.T) {
	t.Run("右回転すると子ぷよが上→右→下→左→上と移動する", func(t *testing.T) {
		p := New(2, 5, puyo.ColorRed, puyo.ColorBlue)
		b := board.New()

		// 初期状態: 上
		assert.Equal(t, DirUp, p.Direction)
		assert.Equal(t, 2, p.ChildX)
		assert.Equal(t, 4, p.ChildY)

		// 1回目: 上→右
		result := p.Rotate(b)
		assert.True(t, result)
		assert.Equal(t, DirRight, p.Direction)
		assert.Equal(t, 3, p.ChildX)
		assert.Equal(t, 5, p.ChildY)

		// 2回目: 右→下
		result = p.Rotate(b)
		assert.True(t, result)
		assert.Equal(t, DirDown, p.Direction)
		assert.Equal(t, 2, p.ChildX)
		assert.Equal(t, 6, p.ChildY)

		// 3回目: 下→左
		result = p.Rotate(b)
		assert.True(t, result)
		assert.Equal(t, DirLeft, p.Direction)
		assert.Equal(t, 1, p.ChildX)
		assert.Equal(t, 5, p.ChildY)

		// 4回目: 左→上
		result = p.Rotate(b)
		assert.True(t, result)
		assert.Equal(t, DirUp, p.Direction)
		assert.Equal(t, 2, p.ChildX)
		assert.Equal(t, 4, p.ChildY)
	})

	t.Run("壁に近い場合は左にずらして回転（壁キック）", func(t *testing.T) {
		p := New(5, 5, puyo.ColorRed, puyo.ColorBlue) // X=5（右端近く）
		b := board.New()

		// 初期状態（上）から右に回転
		// 通常は(6, 5)になるが範囲外なので壁キック
		result := p.Rotate(b)
		assert.True(t, result)
		assert.Equal(t, DirRight, p.Direction)
		// 壁キックで左にずれる
		assert.Equal(t, 4, p.AxisX)
		assert.Equal(t, 5, p.ChildX)
	})

	t.Run("回転できない場合はfalseを返す", func(t *testing.T) {
		p := New(2, 5, puyo.ColorRed, puyo.ColorBlue)
		b := board.New()

		// 回転先（右）と壁キック先の両方にぷよがある
		b.Set(5, 3, puyo.ColorGreen) // 回転先
		b.Set(5, 2, puyo.ColorGreen) // 左壁キック先
		b.Set(5, 4, puyo.ColorGreen) // 右壁キック先

		result := p.Rotate(b)
		assert.False(t, result)
		// 状態は変わらない
		assert.Equal(t, DirUp, p.Direction)
	})
}
