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
}
