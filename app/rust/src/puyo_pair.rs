// Puyo Pair module
// イテレーション2で実装

use crate::board::{Board, Cell, PuyoColor};

pub struct PuyoPair {
    pub(crate) axis_x: i32,
    pub(crate) axis_y: i32,
    pub(crate) axis_color: PuyoColor,
    pub(crate) child_x: i32,
    pub(crate) child_y: i32,
    pub(crate) child_color: PuyoColor,
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

    pub fn rotate_right(&mut self) {
        // 子ぷよの相対位置を計算
        let dx = self.child_x - self.axis_x;
        let dy = self.child_y - self.axis_y;

        // 右回転: (dx, dy) -> (-dy, dx)
        // 上(0,-1) -> 右(1,0) -> 下(0,1) -> 左(-1,0) -> 上(0,-1)
        let new_dx = -dy;
        let new_dy = dx;

        // 新しい子ぷよの位置を計算
        self.child_x = self.axis_x + new_dx;
        self.child_y = self.axis_y + new_dy;
    }

    pub fn rotate_left(&mut self) {
        // 子ぷよの相対位置を計算
        let dx = self.child_x - self.axis_x;
        let dy = self.child_y - self.axis_y;

        // 左回転: (dx, dy) -> (dy, -dx)
        // 上(0,-1) -> 左(-1,0) -> 下(0,1) -> 右(1,0) -> 上(0,-1)
        let new_dx = dy;
        let new_dy = -dx;

        // 新しい子ぷよの位置を計算
        self.child_x = self.axis_x + new_dx;
        self.child_y = self.axis_y + new_dy;
    }

    pub fn can_rotate_right(&self, board: &Board) -> bool {
        // 仮想的に右回転した場合の子ぷよの位置を計算
        let dx = self.child_x - self.axis_x;
        let dy = self.child_y - self.axis_y;
        let new_child_x = self.axis_x - dy;
        let new_child_y = self.axis_y + dx;

        // 回転後の位置が有効か確認
        !self.is_collision(board, self.axis_x, self.axis_y, new_child_x, new_child_y)
    }

    pub fn can_rotate_left(&self, board: &Board) -> bool {
        // 仮想的に左回転した場合の子ぷよの位置を計算
        let dx = self.child_x - self.axis_x;
        let dy = self.child_y - self.axis_y;
        let new_child_x = self.axis_x + dy;
        let new_child_y = self.axis_y - dx;

        // 回転後の位置が有効か確認
        !self.is_collision(board, self.axis_x, self.axis_y, new_child_x, new_child_y)
    }

    pub fn rotate_right_with_wall_kick(&mut self, board: &Board) {
        // まず通常の回転を試す
        if self.can_rotate_right(board) {
            self.rotate_right();
            return;
        }

        // 左に1マスずらして回転を試す（右壁キック）
        let original_axis_x = self.axis_x;
        let original_child_x = self.child_x;
        self.axis_x -= 1;
        self.child_x -= 1;
        if self.axis_x >= 0 && self.can_rotate_right(board) {
            self.rotate_right();
            return;
        }

        // 右に1マスずらして回転を試す（左壁キック）
        self.axis_x = original_axis_x + 1;
        self.child_x = original_child_x + 1;
        if self.axis_x < board.cols() as i32 && self.can_rotate_right(board) {
            self.rotate_right();
            return;
        }

        // どちらもダメなら元の位置に戻す
        self.axis_x = original_axis_x;
        self.child_x = original_child_x;
    }

    pub fn rotate_left_with_wall_kick(&mut self, board: &Board) {
        // まず通常の回転を試す
        if self.can_rotate_left(board) {
            self.rotate_left();
            return;
        }

        // 右に1マスずらして回転を試す（左壁キック）
        let original_axis_x = self.axis_x;
        let original_child_x = self.child_x;
        self.axis_x += 1;
        self.child_x += 1;
        if self.axis_x < board.cols() as i32 && self.can_rotate_left(board) {
            self.rotate_left();
            return;
        }

        // 左に1マスずらして回転を試す（右壁キック）
        self.axis_x = original_axis_x - 1;
        self.child_x = original_child_x - 1;
        if self.axis_x >= 0 && self.can_rotate_left(board) {
            self.rotate_left();
            return;
        }

        // どちらもダメなら元の位置に戻す
        self.axis_x = original_axis_x;
        self.child_x = original_child_x;
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

    #[test]
    fn test_rotate_right_from_up() {
        // 初期状態: 軸(2,1), 子(2,0) (上)
        let mut pair = PuyoPair::new(2, 1, PuyoColor::Red, PuyoColor::Blue);
        assert_eq!(pair.child_x, 2);
        assert_eq!(pair.child_y, 0);

        // 右回転: 子が右に移動
        pair.rotate_right();
        assert_eq!(pair.child_x, 3);
        assert_eq!(pair.child_y, 1);
    }

    #[test]
    fn test_rotate_right_from_right() {
        // 右向き: 軸(2,1), 子(3,1)
        let mut pair = PuyoPair::new(2, 1, PuyoColor::Red, PuyoColor::Blue);
        pair.child_x = 3;
        pair.child_y = 1;

        // 右回転: 子が下に移動
        pair.rotate_right();
        assert_eq!(pair.child_x, 2);
        assert_eq!(pair.child_y, 2);
    }

    #[test]
    fn test_rotate_right_from_down() {
        // 下向き: 軸(2,1), 子(2,2)
        let mut pair = PuyoPair::new(2, 1, PuyoColor::Red, PuyoColor::Blue);
        pair.child_x = 2;
        pair.child_y = 2;

        // 右回転: 子が左に移動
        pair.rotate_right();
        assert_eq!(pair.child_x, 1);
        assert_eq!(pair.child_y, 1);
    }

    #[test]
    fn test_rotate_right_from_left() {
        // 左向き: 軸(2,1), 子(1,1)
        let mut pair = PuyoPair::new(2, 1, PuyoColor::Red, PuyoColor::Blue);
        pair.child_x = 1;
        pair.child_y = 1;

        // 右回転: 子が上に移動（一周して戻る）
        pair.rotate_right();
        assert_eq!(pair.child_x, 2);
        assert_eq!(pair.child_y, 0);
    }

    #[test]
    fn test_rotate_left_from_up() {
        // 初期状態: 軸(2,1), 子(2,0) (上)
        let mut pair = PuyoPair::new(2, 1, PuyoColor::Red, PuyoColor::Blue);

        // 左回転: 子が左に移動
        pair.rotate_left();
        assert_eq!(pair.child_x, 1);
        assert_eq!(pair.child_y, 1);
    }

    #[test]
    fn test_can_rotate_right() {
        let board = Board::new(6, 12);
        // 中央の位置: 軸(2,1), 子(2,0)
        let pair = PuyoPair::new(2, 1, PuyoColor::Red, PuyoColor::Blue);
        assert!(pair.can_rotate_right(&board));
    }

    #[test]
    fn test_cannot_rotate_right_at_right_edge() {
        let board = Board::new(6, 12);
        // 右端の位置: 軸(5,1), 子(5,0)
        let pair = PuyoPair::new(5, 1, PuyoColor::Red, PuyoColor::Blue);
        // 右回転すると子が(6,1)になってしまう
        assert!(!pair.can_rotate_right(&board));
    }

    #[test]
    fn test_wall_kick_right_rotation() {
        let board = Board::new(6, 12);
        // 右端の位置: 軸(5,1), 子(5,0)
        let mut pair = PuyoPair::new(5, 1, PuyoColor::Red, PuyoColor::Blue);

        // 壁キック付き回転を実行
        pair.rotate_right_with_wall_kick(&board);

        // 軸が左に1つ移動し、子が右向きになる
        assert_eq!(pair.axis_x, 4);
        assert_eq!(pair.child_x, 5);
        assert_eq!(pair.child_y, 1);
    }

    #[test]
    fn test_wall_kick_left_rotation() {
        let board = Board::new(6, 12);
        // 左端の位置: 軸(0,1), 子(0,0)
        let mut pair = PuyoPair::new(0, 1, PuyoColor::Red, PuyoColor::Blue);

        // 壁キック付き回転を実行
        pair.rotate_left_with_wall_kick(&board);

        // 軸が右に1つ移動し、子が左向きになる
        assert_eq!(pair.axis_x, 1);
        assert_eq!(pair.child_x, 0);
        assert_eq!(pair.child_y, 1);
    }
}
