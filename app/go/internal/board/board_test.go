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
