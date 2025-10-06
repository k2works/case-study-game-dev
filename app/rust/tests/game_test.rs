#[cfg(test)]
mod tests {
    use puyo_puyo_game::game::Game;
    use puyo_puyo_game::game::GameMode;

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
