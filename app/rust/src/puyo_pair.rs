// Puyo Pair module
// イテレーション2で実装

use crate::board::{Board, Cell, PuyoColor};

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

    pub fn can_move_left(&self, board: &Board) -> bool {
        let new_axis_x = self.axis_x - 1;
        let new_child_x = self.child_x - 1;
        if new_axis_x < 0 || new_child_x < 0 {
            return false;
        }
        !self.is_collision(board, new_axis_x, self.axis_y, new_child_x, self.child_y)
    }

    pub fn can_move_right(&self, board: &Board) -> bool {
        let new_axis_x = self.axis_x + 1;
        let new_child_x = self.child_x + 1;
        if new_axis_x >= board.cols() as i32 || new_child_x >= board.cols() as i32 {
            return false;
        }
        !self.is_collision(board, new_axis_x, self.axis_y, new_child_x, self.child_y)
    }

    pub fn move_left(&mut self) {
        self.axis_x -= 1;
        self.child_x -= 1;
    }

    pub fn move_right(&mut self) {
        self.axis_x += 1;
        self.child_x += 1;
    }

    fn is_collision(&self, board: &Board, ax: i32, ay: i32, cx: i32, cy: i32) -> bool {
        // 範囲チェック
        if ax < 0 || ax >= board.cols() as i32 || ay < 0 || ay >= board.rows() as i32 {
            return true;
        }
        if cx < 0 || cx >= board.cols() as i32 || cy < 0 || cy >= board.rows() as i32 {
            return true;
        }

        // ボードとの衝突チェック
        if let Some(cell) = board.get_cell(ax as usize, ay as usize) {
            if cell != Cell::Empty {
                return true;
            }
        }
        if let Some(cell) = board.get_cell(cx as usize, cy as usize) {
            if cell != Cell::Empty {
                return true;
            }
        }

        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::board::{Board, PuyoColor};

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

    #[test]
    fn test_can_move_left_when_space_is_available() {
        let pair = PuyoPair::new(2, 1, PuyoColor::Red, PuyoColor::Blue);
        let board = Board::new(6, 12);

        assert!(pair.can_move_left(&board));
    }

    #[test]
    fn test_cannot_move_left_at_left_edge() {
        let pair = PuyoPair::new(0, 1, PuyoColor::Red, PuyoColor::Blue);
        let board = Board::new(6, 12);

        assert!(!pair.can_move_left(&board));
    }

    #[test]
    fn test_can_move_right_when_space_is_available() {
        let pair = PuyoPair::new(2, 1, PuyoColor::Red, PuyoColor::Blue);
        let board = Board::new(6, 12);

        assert!(pair.can_move_right(&board));
    }

    #[test]
    fn test_cannot_move_right_at_right_edge() {
        let pair = PuyoPair::new(5, 1, PuyoColor::Red, PuyoColor::Blue);
        let board = Board::new(6, 12);

        assert!(!pair.can_move_right(&board));
    }

    #[test]
    fn test_move_left_changes_position() {
        let mut pair = PuyoPair::new(2, 1, PuyoColor::Red, PuyoColor::Blue);

        pair.move_left();

        assert_eq!(pair.axis_x(), 1);
        assert_eq!(pair.child_x(), 1);
    }

    #[test]
    fn test_move_right_changes_position() {
        let mut pair = PuyoPair::new(2, 1, PuyoColor::Red, PuyoColor::Blue);

        pair.move_right();

        assert_eq!(pair.axis_x(), 3);
        assert_eq!(pair.child_x(), 3);
    }
}
