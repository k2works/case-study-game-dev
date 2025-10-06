package puyo

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPuyoColor(t *testing.T) {
	t.Run("空のぷよは空文字列を返す", func(t *testing.T) {
		color := ColorNone
		assert.Equal(t, "", color.String())
	})

	t.Run("赤いぷよは赤を表す文字列を返す", func(t *testing.T) {
		color := ColorRed
		assert.Equal(t, "赤", color.String())
	})

	t.Run("青いぷよは青を表す文字列を返す", func(t *testing.T) {
		color := ColorBlue
		assert.Equal(t, "青", color.String())
	})

	t.Run("緑のぷよは緑を表す文字列を返す", func(t *testing.T) {
		color := ColorGreen
		assert.Equal(t, "緑", color.String())
	})

	t.Run("黄色いぷよは黄を表す文字列を返す", func(t *testing.T) {
		color := ColorYellow
		assert.Equal(t, "黄", color.String())
	})
}
