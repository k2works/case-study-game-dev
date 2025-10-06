// Puyo Pair module
// イテレーション2で実装

use crate::board::PuyoColor;

pub struct PuyoPair {
    axis_x: i32,
    axis_y: i32,
    axis_color: PuyoColor,
    child_x: i32,
    child_y: i32,
    child_color: PuyoColor,
}

impl PuyoPair {
    pub fn new(x: i32, y: i32, axis_color: PuyoColor, child_color: PuyoColor) -> Self {
        Self {
            axis_x: x,
            axis_y: y,
            axis_color,
            child_x: x,
            child_y: y - 1, // 子ぷよは軸ぷよの上
            child_color,
        }
    }

    pub fn axis_x(&self) -> i32 {
        self.axis_x
    }

    pub fn axis_y(&self) -> i32 {
        self.axis_y
    }

    pub fn axis_color(&self) -> PuyoColor {
        self.axis_color
    }

    pub fn child_x(&self) -> i32 {
        self.child_x
    }

    pub fn child_y(&self) -> i32 {
        self.child_y
    }

    pub fn child_color(&self) -> PuyoColor {
        self.child_color
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::board::PuyoColor;

    #[test]
    fn test_create_puyo_pair() {
        let pair = PuyoPair::new(2, 1, PuyoColor::Red, PuyoColor::Blue);

        assert_eq!(pair.axis_x(), 2);
        assert_eq!(pair.axis_y(), 1);
        assert_eq!(pair.axis_color(), PuyoColor::Red);
        assert_eq!(pair.child_color(), PuyoColor::Blue);
    }

    #[test]
    fn test_child_position_initially_above_axis() {
        let pair = PuyoPair::new(2, 1, PuyoColor::Red, PuyoColor::Blue);

        // 子ぷよは軸ぷよの上に配置される（y座標が1小さい）
        assert_eq!(pair.child_x(), 2);
        assert_eq!(pair.child_y(), 0);
    }
}
