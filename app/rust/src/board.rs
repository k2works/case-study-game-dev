use std::collections::HashSet;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PuyoColor {
    Red,
    Blue,
    Green,
    Yellow,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Cell {
    Empty,
    Filled(PuyoColor),
}

pub struct Board {
    cols: usize,
    rows: usize,
    cells: Vec<Vec<Cell>>,
}

impl Board {
    pub fn new(cols: usize, rows: usize) -> Self {
        let cells = vec![vec![Cell::Empty; rows]; cols];
        Self { cols, rows, cells }
    }

    pub fn cols(&self) -> usize {
        self.cols
    }

    pub fn rows(&self) -> usize {
        self.rows
    }

    pub fn get_cell(&self, x: usize, y: usize) -> Option<Cell> {
        self.cells.get(x).and_then(|col| col.get(y)).copied()
    }

    pub fn set_cell(&mut self, x: usize, y: usize, cell: Cell) {
        if let Some(col) = self.cells.get_mut(x) {
            if let Some(c) = col.get_mut(y) {
                *c = cell;
            }
        }
    }

    pub fn find_connected(&self, start_x: usize, start_y: usize) -> HashSet<(usize, usize)> {
        let mut connected = HashSet::new();

        // 開始位置が範囲外または空の場合は空のセットを返す
        if start_x >= self.cols || start_y >= self.rows {
            return connected;
        }

        let start_color = match self.cells[start_x][start_y] {
            Cell::Filled(color) => color,
            Cell::Empty => return connected,
        };

        // 深さ優先探索
        self.dfs(start_x, start_y, start_color, &mut connected);

        connected
    }

    fn dfs(&self, x: usize, y: usize, target_color: PuyoColor, visited: &mut HashSet<(usize, usize)>) {
        // 範囲チェック
        if x >= self.cols || y >= self.rows {
            return;
        }

        // 既に訪問済みならスキップ
        if visited.contains(&(x, y)) {
            return;
        }

        // 色が一致するかチェック
        match self.cells[x][y] {
            Cell::Filled(color) if color == target_color => {
                visited.insert((x, y));

                // 4方向を探索（範囲チェック付き）
                if x + 1 < self.cols {
                    self.dfs(x + 1, y, target_color, visited); // 右
                }
                if x > 0 {
                    self.dfs(x - 1, y, target_color, visited); // 左
                }
                if y + 1 < self.rows {
                    self.dfs(x, y + 1, target_color, visited); // 下
                }
                if y > 0 {
                    self.dfs(x, y - 1, target_color, visited); // 上
                }
            }
            _ => {}
        }
    }

    pub fn check_erase(&self) -> HashSet<(usize, usize)> {
        let mut erase_positions = HashSet::new();
        let mut checked = HashSet::new();

        // ボード全体を走査
        for x in 0..self.cols {
            for y in 0..self.rows {
                // 既にチェック済みまたは空のセルはスキップ
                if checked.contains(&(x, y)) {
                    continue;
                }

                if let Cell::Filled(_) = self.cells[x][y] {
                    // 接続しているぷよを探索
                    let connected = self.find_connected(x, y);

                    // チェック済みに追加
                    for pos in &connected {
                        checked.insert(*pos);
                    }

                    // 4つ以上繋がっている場合は消去対象
                    if connected.len() >= 4 {
                        for pos in connected {
                            erase_positions.insert(pos);
                        }
                    }
                }
            }
        }

        erase_positions
    }

    pub fn erase_puyos(&mut self, positions: &HashSet<(usize, usize)>) {
        for (x, y) in positions {
            if *x < self.cols && *y < self.rows {
                self.cells[*x][*y] = Cell::Empty;
            }
        }
    }

    pub fn apply_gravity(&mut self) -> bool {
        let mut has_fallen = false;

        for x in 0..self.cols {
            if self.apply_gravity_to_column(x) {
                has_fallen = true;
            }
        }

        has_fallen
    }

    fn apply_gravity_to_column(&mut self, x: usize) -> bool {
        let mut has_fallen = false;
        let mut write_y = self.rows - 1;

        for read_y in (0..self.rows).rev() {
            if let Cell::Filled(color) = self.cells[x][read_y] {
                if read_y != write_y {
                    self.cells[x][write_y] = Cell::Filled(color);
                    self.cells[x][read_y] = Cell::Empty;
                    has_fallen = true;
                }
                if write_y > 0 {
                    write_y -= 1;
                }
            }
        }

        has_fallen
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_board() {
        let board = Board::new(6, 12);

        assert_eq!(board.cols(), 6);
        assert_eq!(board.rows(), 12);
    }

    #[test]
    fn test_all_cells_are_empty_initially() {
        let board = Board::new(6, 12);

        for x in 0..board.cols() {
            for y in 0..board.rows() {
                assert_eq!(board.get_cell(x, y), Some(Cell::Empty));
            }
        }
    }

    #[test]
    fn test_set_and_get_cell() {
        let mut board = Board::new(6, 12);

        board.set_cell(2, 5, Cell::Filled(PuyoColor::Red));

        assert_eq!(board.get_cell(2, 5), Some(Cell::Filled(PuyoColor::Red)));
    }

    #[test]
    fn test_get_cell_out_of_bounds() {
        let board = Board::new(6, 12);

        assert_eq!(board.get_cell(10, 20), None);
    }

    #[test]
    fn test_find_connected_same_color_horizontal() {
        let mut board = Board::new(6, 12);
        // 横に4つ赤ぷよを配置
        board.set_cell(0, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(1, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(3, 11, Cell::Filled(PuyoColor::Red));

        let connected = board.find_connected(0, 11);

        assert_eq!(connected.len(), 4);
    }

    #[test]
    fn test_find_connected_same_color_square() {
        let mut board = Board::new(6, 12);
        // 2x2の正方形に赤ぷよを配置
        board.set_cell(1, 10, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 10, Cell::Filled(PuyoColor::Red));
        board.set_cell(1, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 11, Cell::Filled(PuyoColor::Red));

        let connected = board.find_connected(1, 10);

        assert_eq!(connected.len(), 4);
    }

    #[test]
    fn test_find_connected_different_colors() {
        let mut board = Board::new(6, 12);
        // 市松模様に配置
        board.set_cell(1, 10, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 10, Cell::Filled(PuyoColor::Blue));
        board.set_cell(1, 11, Cell::Filled(PuyoColor::Blue));
        board.set_cell(2, 11, Cell::Filled(PuyoColor::Red));

        let connected = board.find_connected(1, 10);

        // 同じ色が1つしか繋がっていない
        assert_eq!(connected.len(), 1);
    }

    #[test]
    fn test_check_erase_4_connected() {
        let mut board = Board::new(6, 12);
        // 横に4つ赤ぷよを配置
        board.set_cell(0, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(1, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(3, 11, Cell::Filled(PuyoColor::Red));

        let erase_positions = board.check_erase();

        assert_eq!(erase_positions.len(), 4);
    }

    #[test]
    fn test_check_erase_less_than_4() {
        let mut board = Board::new(6, 12);
        // 横に3つ赤ぷよを配置（消えない）
        board.set_cell(0, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(1, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 11, Cell::Filled(PuyoColor::Red));

        let erase_positions = board.check_erase();

        assert_eq!(erase_positions.len(), 0);
    }

    #[test]
    fn test_check_erase_multiple_groups() {
        let mut board = Board::new(6, 12);
        // 2つのグループ
        // 赤ぷよ4つ（横）
        board.set_cell(0, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(1, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(3, 11, Cell::Filled(PuyoColor::Red));

        // 青ぷよ4つ（縦）
        board.set_cell(5, 8, Cell::Filled(PuyoColor::Blue));
        board.set_cell(5, 9, Cell::Filled(PuyoColor::Blue));
        board.set_cell(5, 10, Cell::Filled(PuyoColor::Blue));
        board.set_cell(5, 11, Cell::Filled(PuyoColor::Blue));

        let erase_positions = board.check_erase();

        assert_eq!(erase_positions.len(), 8); // 4 + 4
    }

    #[test]
    fn test_erase_puyos() {
        let mut board = Board::new(6, 12);
        // 横に4つ赤ぷよを配置
        board.set_cell(0, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(1, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(3, 11, Cell::Filled(PuyoColor::Red));

        let erase_positions = board.check_erase();
        board.erase_puyos(&erase_positions);

        // すべて消えている
        assert_eq!(board.get_cell(0, 11), Some(Cell::Empty));
        assert_eq!(board.get_cell(1, 11), Some(Cell::Empty));
        assert_eq!(board.get_cell(2, 11), Some(Cell::Empty));
        assert_eq!(board.get_cell(3, 11), Some(Cell::Empty));
    }

    #[test]
    fn test_apply_gravity() {
        let mut board = Board::new(6, 12);
        // 浮いているぷよを配置
        board.set_cell(2, 5, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 11, Cell::Filled(PuyoColor::Blue)); // 下端

        board.apply_gravity();

        // 赤ぷよが最終位置まで落下
        assert_eq!(board.get_cell(2, 5), Some(Cell::Empty));
        assert_eq!(board.get_cell(2, 10), Some(Cell::Filled(PuyoColor::Red)));
        // 青ぷよは動かない
        assert_eq!(board.get_cell(2, 11), Some(Cell::Filled(PuyoColor::Blue)));
    }

    #[test]
    fn test_apply_gravity_multiple_puyos() {
        let mut board = Board::new(6, 12);
        // 横に並んだぷよが同時に落ちる
        board.set_cell(1, 5, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 5, Cell::Filled(PuyoColor::Blue));
        board.set_cell(3, 5, Cell::Filled(PuyoColor::Green));

        board.apply_gravity();

        // すべて最下段に落下
        assert_eq!(board.get_cell(1, 11), Some(Cell::Filled(PuyoColor::Red)));
        assert_eq!(board.get_cell(2, 11), Some(Cell::Filled(PuyoColor::Blue)));
        assert_eq!(board.get_cell(3, 11), Some(Cell::Filled(PuyoColor::Green)));
    }

    #[test]
    fn test_apply_gravity_stacked_puyos() {
        let mut board = Board::new(6, 12);
        // 縦に積まれたぷよ
        board.set_cell(2, 5, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 6, Cell::Filled(PuyoColor::Blue));
        board.set_cell(2, 7, Cell::Filled(PuyoColor::Green));

        board.apply_gravity();

        // 下から順に配置される
        assert_eq!(board.get_cell(2, 9), Some(Cell::Filled(PuyoColor::Red)));
        assert_eq!(board.get_cell(2, 10), Some(Cell::Filled(PuyoColor::Blue)));
        assert_eq!(board.get_cell(2, 11), Some(Cell::Filled(PuyoColor::Green)));
    }

    #[test]
    fn test_apply_gravity_l_shape() {
        let mut board = Board::new(6, 12);
        // L字型の配置（縦向きペア + 横向きペアを重ねた状態を模擬）
        // 縦向きペア: (2,10), (2,11)
        board.set_cell(2, 10, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 11, Cell::Filled(PuyoColor::Red));

        // 横向きペア: (2,9), (3,9) - 着地直後の状態
        board.set_cell(2, 9, Cell::Filled(PuyoColor::Blue));
        board.set_cell(3, 9, Cell::Filled(PuyoColor::Blue));

        board.apply_gravity();

        // (2,9)は(2,10)の上なので動かない
        assert_eq!(board.get_cell(2, 9), Some(Cell::Filled(PuyoColor::Blue)));
        // (3,9)は下が空いているので(3,11)まで落ちる
        assert_eq!(board.get_cell(3, 9), Some(Cell::Empty));
        assert_eq!(board.get_cell(3, 11), Some(Cell::Filled(PuyoColor::Blue)));
    }
}
