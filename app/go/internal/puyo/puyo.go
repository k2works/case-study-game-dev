package puyo

// Color はぷよの色を表す型
type Color int

const (
	ColorNone Color = iota
	ColorRed
	ColorBlue
	ColorGreen
	ColorYellow
)

// String はぷよの色を文字列で返す
func (c Color) String() string {
	switch c {
	case ColorRed:
		return "赤"
	case ColorBlue:
		return "青"
	case ColorGreen:
		return "緑"
	case ColorYellow:
		return "黄"
	default:
		return ""
	}
}

// Puyo represents a single puyo piece
type Puyo struct {
}
