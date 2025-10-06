package game

import (
	"testing"

	"github.com/case-study-game-dev/puyo-puyo-go/internal/board"
	"github.com/stretchr/testify/assert"
)

func TestGame(t *testing.T) {
	t.Run("新しいゲームはボードを持つ", func(t *testing.T) {
		g := New()

		assert.NotNil(t, g.Board)
		assert.IsType(t, &board.Board{}, g.Board)
	})

	t.Run("Updateメソッドは正常に動作する", func(t *testing.T) {
		g := New()

		err := g.Update()

		assert.NoError(t, err)
	})

	t.Run("Layoutメソッドは画面サイズを返す", func(t *testing.T) {
		g := New()

		width, height := g.Layout(640, 480)

		assert.Equal(t, 240, width)
		assert.Equal(t, 360, height)
	})
}
