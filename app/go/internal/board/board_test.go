package board

import (
	"testing"

	"github.com/case-study-game-dev/puyo-puyo-go/internal/puyo"
	"github.com/stretchr/testify/assert"
)

func TestBoard(t *testing.T) {
	t.Run("新しいボードは12行6列の空の盤面を持つ", func(t *testing.T) {
		b := New()

		assert.Equal(t, 12, len(b.Cells))
		assert.Equal(t, 6, len(b.Cells[0]))

		// すべてのセルが空であることを確認
		for row := 0; row < 12; row++ {
			for col := 0; col < 6; col++ {
				assert.Equal(t, puyo.ColorNone, b.Cells[row][col])
			}
		}
	})

	t.Run("指定した位置にぷよを配置できる", func(t *testing.T) {
		b := New()

		b.Set(11, 2, puyo.ColorRed)

		assert.Equal(t, puyo.ColorRed, b.Cells[11][2])
	})

	t.Run("指定した位置のぷよを取得できる", func(t *testing.T) {
		b := New()
		b.Cells[11][2] = puyo.ColorBlue

		color := b.Get(11, 2)

		assert.Equal(t, puyo.ColorBlue, color)
	})
}

func TestCheckErase(t *testing.T) {
	t.Run("4つ以上つながった同じ色のぷよは消去対象になる", func(t *testing.T) {
		b := New()
		// 横に4つ赤いぷよを配置
		b.Set(11, 0, puyo.ColorRed)
		b.Set(11, 1, puyo.ColorRed)
		b.Set(11, 2, puyo.ColorRed)
		b.Set(11, 3, puyo.ColorRed)

		positions := b.CheckErase()

		assert.Equal(t, 4, len(positions))
	})

	t.Run("3つ以下のつながりは消去対象にならない", func(t *testing.T) {
		b := New()
		// 横に3つ赤いぷよを配置
		b.Set(11, 0, puyo.ColorRed)
		b.Set(11, 1, puyo.ColorRed)
		b.Set(11, 2, puyo.ColorRed)

		positions := b.CheckErase()

		assert.Equal(t, 0, len(positions))
	})

	t.Run("縦に4つつながった場合も消去対象になる", func(t *testing.T) {
		b := New()
		// 縦に4つ青いぷよを配置
		b.Set(11, 2, puyo.ColorBlue)
		b.Set(10, 2, puyo.ColorBlue)
		b.Set(9, 2, puyo.ColorBlue)
		b.Set(8, 2, puyo.ColorBlue)

		positions := b.CheckErase()

		assert.Equal(t, 4, len(positions))
	})

	t.Run("L字型につながった5つのぷよも消去対象になる", func(t *testing.T) {
		b := New()
		// L字型に配置
		b.Set(11, 0, puyo.ColorGreen)
		b.Set(11, 1, puyo.ColorGreen)
		b.Set(11, 2, puyo.ColorGreen)
		b.Set(10, 2, puyo.ColorGreen)
		b.Set(9, 2, puyo.ColorGreen)

		positions := b.CheckErase()

		assert.Equal(t, 5, len(positions))
	})

	t.Run("複数のグループがある場合は全て検出する", func(t *testing.T) {
		b := New()
		// 赤4つ
		b.Set(11, 0, puyo.ColorRed)
		b.Set(11, 1, puyo.ColorRed)
		b.Set(11, 2, puyo.ColorRed)
		b.Set(11, 3, puyo.ColorRed)
		// 青4つ
		b.Set(10, 0, puyo.ColorBlue)
		b.Set(10, 1, puyo.ColorBlue)
		b.Set(10, 2, puyo.ColorBlue)
		b.Set(10, 3, puyo.ColorBlue)

		positions := b.CheckErase()

		assert.Equal(t, 8, len(positions))
	})
}

func TestErase(t *testing.T) {
	t.Run("指定した位置のぷよを消去できる", func(t *testing.T) {
		b := New()
		b.Set(11, 0, puyo.ColorRed)
		b.Set(11, 1, puyo.ColorRed)
		b.Set(11, 2, puyo.ColorRed)
		b.Set(11, 3, puyo.ColorRed)

		positions := []Position{
			{Row: 11, Col: 0},
			{Row: 11, Col: 1},
			{Row: 11, Col: 2},
			{Row: 11, Col: 3},
		}
		b.Erase(positions)

		assert.Equal(t, puyo.ColorNone, b.Get(11, 0))
		assert.Equal(t, puyo.ColorNone, b.Get(11, 1))
		assert.Equal(t, puyo.ColorNone, b.Get(11, 2))
		assert.Equal(t, puyo.ColorNone, b.Get(11, 3))
	})
}
