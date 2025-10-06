use crate::board::{Board, Cell, PuyoColor};
use crate::puyo_pair::PuyoPair;
use macroquad::prelude::{is_key_pressed, KeyCode};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GameMode {
    Start,
    Playing,
    Checking,
    Erasing,
    Falling,
    GameOver,
}

pub struct Game {
    mode: GameMode,
    score: i32,
    chain_count: i32,
    board: Option<Board>,
    current_pair: Option<PuyoPair>,
    fall_timer: f32,
    fall_interval: f32,
}

impl Game {
    pub fn new() -> Self {
        Self {
            mode: GameMode::Start,
            score: 0,
            chain_count: 0,
            board: Some(Board::new(6, 12)),
            current_pair: None,
            fall_timer: 0.0,
            fall_interval: 1.0, // 1秒ごとに落下
        }
    }

    pub fn mode(&self) -> GameMode {
        self.mode
    }

    pub fn score(&self) -> i32 {
        self.score
    }

    pub fn chain_count(&self) -> i32 {
        self.chain_count
    }

    pub fn board(&self) -> Option<&Board> {
        self.board.as_ref()
    }

    pub fn current_pair(&self) -> Option<&PuyoPair> {
        self.current_pair.as_ref()
    }

    pub fn start(&mut self) {
        self.mode = GameMode::Playing;
        self.spawn_new_pair();
    }

    fn spawn_new_pair(&mut self) {
        use rand::Rng;
        let mut rng = rand::rng();

        let axis_color = match rng.random_range(0..4) {
            0 => PuyoColor::Red,
            1 => PuyoColor::Blue,
            2 => PuyoColor::Green,
            _ => PuyoColor::Yellow,
        };

        let child_color = match rng.random_range(0..4) {
            0 => PuyoColor::Red,
            1 => PuyoColor::Blue,
            2 => PuyoColor::Green,
            _ => PuyoColor::Yellow,
        };

        let pair = PuyoPair::new(2, 1, axis_color, child_color);
        self.current_pair = Some(pair);
    }

    pub fn update(&mut self, delta_time: f32) {
        if self.mode != GameMode::Playing {
            return;
        }

        // 入力処理
        self.handle_input();

        // 落下タイマーを更新
        self.fall_timer += delta_time;

        // 一定時間経過したら自動落下
        if self.fall_timer >= self.fall_interval {
            self.auto_fall();
            self.fall_timer = 0.0;
        }
    }

    fn handle_input(&mut self) {
        if let Some(ref mut pair) = self.current_pair {
            if let Some(ref board) = self.board {
                // 左矢印キーが押されたら左に移動
                if is_key_pressed(KeyCode::Left) && pair.can_move_left(board) {
                    pair.move_left();
                }
                // 右矢印キーが押されたら右に移動
                if is_key_pressed(KeyCode::Right) && pair.can_move_right(board) {
                    pair.move_right();
                }
                // 上矢印キーまたはXキーが押されたら右回転
                if is_key_pressed(KeyCode::Up) || is_key_pressed(KeyCode::X) {
                    pair.rotate_right_with_wall_kick(board);
                }
                // Zキーが押されたら左回転
                if is_key_pressed(KeyCode::Z) {
                    pair.rotate_left_with_wall_kick(board);
                }
                // 下矢印キーが押されたら高速落下
                if is_key_pressed(KeyCode::Down) && pair.can_move_down(board) {
                    pair.move_down();
                    self.fall_timer = 0.0; // タイマーをリセット
                }
            }
        }
    }

    fn auto_fall(&mut self) {
        if let Some(ref mut pair) = self.current_pair {
            if let Some(ref board) = self.board {
                if pair.can_move_down(board) {
                    pair.move_down();
                } else {
                    // 着地処理
                    self.land_pair();
                }
            }
        }
    }

    fn land_pair(&mut self) {
        if let (Some(pair), Some(ref mut board)) = (self.current_pair.take(), &mut self.board) {
            // 軸ぷよをボードに配置
            if pair.axis_y >= 0 && pair.axis_y < board.rows() as i32 {
                board.set_cell(
                    pair.axis_x as usize,
                    pair.axis_y as usize,
                    Cell::Filled(pair.axis_color),
                );
            }

            // 子ぷよをボードに配置
            if pair.child_y >= 0 && pair.child_y < board.rows() as i32 {
                board.set_cell(
                    pair.child_x as usize,
                    pair.child_y as usize,
                    Cell::Filled(pair.child_color),
                );
            }

            // 次のぷよを生成
            self.spawn_new_pair();
        }
    }

    pub fn draw(&self) {
        use macroquad::prelude::*;

        const CELL_SIZE: f32 = 40.0;
        const BOARD_OFFSET_X: f32 = 50.0;
        const BOARD_OFFSET_Y: f32 = 80.0;

        // ボードを描画
        if let Some(ref board) = self.board {
            for y in 0..board.rows() {
                for x in 0..board.cols() {
                    let px = BOARD_OFFSET_X + x as f32 * CELL_SIZE;
                    let py = BOARD_OFFSET_Y + y as f32 * CELL_SIZE;

                    // セルの枠を描画
                    draw_rectangle_lines(px, py, CELL_SIZE, CELL_SIZE, 1.0, GRAY);

                    // セルにぷよがあれば描画
                    if let Some(Cell::Filled(color)) = board.get_cell(x, y) {
                        let puyo_color = match color {
                            PuyoColor::Red => RED,
                            PuyoColor::Blue => BLUE,
                            PuyoColor::Green => GREEN,
                            PuyoColor::Yellow => YELLOW,
                        };

                        draw_circle(
                            px + CELL_SIZE / 2.0,
                            py + CELL_SIZE / 2.0,
                            CELL_SIZE / 2.0 - 4.0,
                            puyo_color,
                        );
                    }
                }
            }
        }

        // 現在のぷよペアを描画
        if let Some(ref pair) = self.current_pair {
            // 軸ぷよを描画
            let axis_x = BOARD_OFFSET_X + pair.axis_x() as f32 * CELL_SIZE;
            let axis_y = BOARD_OFFSET_Y + pair.axis_y() as f32 * CELL_SIZE;
            let axis_color = match pair.axis_color() {
                PuyoColor::Red => RED,
                PuyoColor::Blue => BLUE,
                PuyoColor::Green => GREEN,
                PuyoColor::Yellow => YELLOW,
            };

            draw_circle(
                axis_x + CELL_SIZE / 2.0,
                axis_y + CELL_SIZE / 2.0,
                CELL_SIZE / 2.0 - 4.0,
                axis_color,
            );

            // 子ぷよを描画
            let child_x = BOARD_OFFSET_X + pair.child_x() as f32 * CELL_SIZE;
            let child_y = BOARD_OFFSET_Y + pair.child_y() as f32 * CELL_SIZE;
            let child_color = match pair.child_color() {
                PuyoColor::Red => RED,
                PuyoColor::Blue => BLUE,
                PuyoColor::Green => GREEN,
                PuyoColor::Yellow => YELLOW,
            };

            draw_circle(
                child_x + CELL_SIZE / 2.0,
                child_y + CELL_SIZE / 2.0,
                CELL_SIZE / 2.0 - 4.0,
                child_color,
            );
        }

        // スコアの表示
        draw_text(
            &format!("Score: {}", self.score),
            10.0,
            30.0,
            20.0,
            WHITE,
        );
    }
}

impl Default for Game {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_game_initialization() {
        let game = Game::new();

        assert_eq!(game.mode(), GameMode::Start);
        assert_eq!(game.score(), 0);
        assert_eq!(game.chain_count(), 0);
    }

    #[test]
    fn test_game_has_board() {
        let game = Game::new();

        assert!(game.board().is_some());
    }
}
