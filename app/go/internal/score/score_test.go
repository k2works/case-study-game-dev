package score

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestScore(t *testing.T) {
	t.Run("新しいスコアは0で初期化される", func(t *testing.T) {
		s := New()

		assert.Equal(t, 0, s.Total)
		assert.Equal(t, 0, s.Chain)
	})

	t.Run("スコアを加算できる", func(t *testing.T) {
		s := New()

		// 4つのぷよを消去（連鎖なし）
		s.Add(4, 0)

		assert.Equal(t, 40, s.Total) // 4 * 10 = 40
	})

	t.Run("連鎖数に応じてボーナスが付く", func(t *testing.T) {
		s := New()

		// 1連鎖: 4つ消去
		s.Add(4, 1)
		assert.Equal(t, 40, s.Total) // 4 * 10 * 1 = 40

		// 2連鎖: 4つ消去
		s.Add(4, 2)
		assert.Equal(t, 120, s.Total) // 40 + (4 * 10 * 2) = 120

		// 3連鎖: 4つ消去
		s.Add(4, 3)
		assert.Equal(t, 280, s.Total) // 120 + (4 * 10 * 4) = 280
	})
}

func TestChainCounter(t *testing.T) {
	t.Run("連鎖数を増やせる", func(t *testing.T) {
		s := New()

		s.IncrementChain()
		assert.Equal(t, 1, s.Chain)

		s.IncrementChain()
		assert.Equal(t, 2, s.Chain)
	})

	t.Run("連鎖数をリセットできる", func(t *testing.T) {
		s := New()
		s.Chain = 5

		s.ResetChain()

		assert.Equal(t, 0, s.Chain)
	})
}
