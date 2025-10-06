package score

const (
	// AllClearBonus は全消しボーナスの点数
	AllClearBonus = 5000
)

// Score はゲームのスコアと連鎖数を管理する
type Score struct {
	Total int
	Chain int
}

// New は新しいスコアを作成する
func New() *Score {
	return &Score{
		Total: 0,
		Chain: 0,
	}
}

// Add はスコアを加算する
// 基本スコア: 消したぷよの数 × 10
// 連鎖ボーナス: 2^(chain-1) 倍（chainが0の場合は1倍）
func (s *Score) Add(erasedCount, chain int) {
	chainBonus := 1
	if chain > 0 {
		// 2^(chain-1) を計算
		// 1連鎖: 2^0 = 1
		// 2連鎖: 2^1 = 2
		// 3連鎖: 2^2 = 4
		chainBonus = 1 << uint(chain-1)
	}

	points := erasedCount * 10 * chainBonus
	s.Total += points
}

// IncrementChain は連鎖数を1増やす
func (s *Score) IncrementChain() {
	s.Chain++
}

// ResetChain は連鎖数を0にリセットする
func (s *Score) ResetChain() {
	s.Chain = 0
}

// AddAllClearBonus は全消しボーナスを加算する
func (s *Score) AddAllClearBonus() {
	s.Total += AllClearBonus
}
