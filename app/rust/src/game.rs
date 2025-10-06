use crate::board::Board;

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
}

impl Game {
    pub fn new() -> Self {
        Self {
            mode: GameMode::Start,
            score: 0,
            chain_count: 0,
            board: Some(Board::new(6, 12)),
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
}

impl Default for Game {
    fn default() -> Self {
        Self::new()
    }
}
