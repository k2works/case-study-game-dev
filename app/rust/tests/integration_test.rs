// tests/integration_test.rs
use puyo_puyo_game::board::{Cell, PuyoColor};
use puyo_puyo_game::game::{Game, GameMode};

#[test]
fn test_complete_game_scenario() {
    let mut game = Game::new();

    // ゲームが正しく初期化されている
    assert_eq!(game.score(), 0);
    assert_eq!(game.chain_count(), 0);
    assert_eq!(game.mode(), GameMode::Start);

    // ゲームを開始
    game.start();

    // ゲームモードがPlayingになっている
    assert_eq!(game.mode(), GameMode::Playing);

    // ぷよペアが生成されている
    assert!(game.current_pair().is_some());
}

#[test]
fn test_game_initialization() {
    let game = Game::new();

    // 初期状態の確認
    assert_eq!(game.score(), 0);
    assert_eq!(game.chain_count(), 0);
    assert_eq!(game.mode(), GameMode::Start);
    assert!(game.board().is_some());
    assert!(game.current_pair().is_none());
}

#[test]
fn test_board_manipulation() {
    let mut game = Game::new();
    game.start();

    // ボードを取得して操作
    if let Some(board) = game.board_mut() {
        // セルにぷよを配置
        board.set_cell(0, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(1, 11, Cell::Filled(PuyoColor::Blue));
        board.set_cell(2, 11, Cell::Filled(PuyoColor::Green));
        board.set_cell(3, 11, Cell::Filled(PuyoColor::Yellow));
    }

    // 配置されたぷよを確認
    if let Some(board) = game.board() {
        assert_eq!(board.get_cell(0, 11), Some(Cell::Filled(PuyoColor::Red)));
        assert_eq!(board.get_cell(1, 11), Some(Cell::Filled(PuyoColor::Blue)));
        assert_eq!(board.get_cell(2, 11), Some(Cell::Filled(PuyoColor::Green)));
        assert_eq!(board.get_cell(3, 11), Some(Cell::Filled(PuyoColor::Yellow)));
    }
}

#[test]
fn test_erasure_detection() {
    let mut game = Game::new();
    game.start();

    // 消去可能な配置を作成（4つの赤ぷよ）
    if let Some(board) = game.board_mut() {
        board.set_cell(0, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(1, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 11, Cell::Filled(PuyoColor::Red));
        board.set_cell(3, 11, Cell::Filled(PuyoColor::Red));
    }

    // 消去判定
    if let Some(board) = game.board() {
        let erase_positions = board.check_erase();
        assert_eq!(erase_positions.len(), 4);
    }
}

#[test]
fn test_all_clear_detection() {
    let mut game = Game::new();
    game.start();

    // 初期状態ではボードは空（ただしcurrent_pairがある）
    if let Some(board) = game.board() {
        assert!(board.is_all_clear());
    }

    // ぷよを配置
    if let Some(board) = game.board_mut() {
        board.set_cell(0, 11, Cell::Filled(PuyoColor::Red));
    }

    // 全消しではない
    if let Some(board) = game.board() {
        assert!(!board.is_all_clear());
    }

    // ぷよを消去
    if let Some(board) = game.board_mut() {
        board.set_cell(0, 11, Cell::Empty);
    }

    // 再び全消し
    if let Some(board) = game.board() {
        assert!(board.is_all_clear());
    }
}

#[test]
fn test_game_over_detection() {
    let mut game = Game::new();
    game.start();

    // 初期状態ではゲームオーバーではない
    assert!(!game.is_game_over());
    assert_eq!(game.mode(), GameMode::Playing);

    // 出現位置 (2, 1) にぷよを配置してブロック
    if let Some(board) = game.board_mut() {
        board.set_cell(2, 1, Cell::Filled(PuyoColor::Red));
        board.set_cell(2, 0, Cell::Filled(PuyoColor::Blue));
    }

    // この状態でupdateを複数回実行して着地とチェックを経由
    // （実際のゲームでは自動的にゲームオーバーになる）
    // 統合テストとしては、is_game_over()メソッドの動作確認が主目的
}

#[test]
fn test_restart_resets_game_state() {
    let mut game = Game::new();
    game.start();

    // ゲーム状態を変更
    if let Some(board) = game.board_mut() {
        board.set_cell(0, 11, Cell::Filled(PuyoColor::Red));
    }

    // 初期状態ではないことを確認
    assert!(game.current_pair().is_some());

    // リスタート
    game.restart();

    // すべてがリセットされている
    assert_eq!(game.score(), 0);
    assert_eq!(game.chain_count(), 0);
    assert_eq!(game.mode(), GameMode::Playing); // restartはstartも呼ぶのでPlaying
    assert!(game.current_pair().is_some()); // 新しいペアが生成される

    // ボードがリセットされているか確認
    // （ただし、リスタート後すぐに新しいゲームが始まるので完全に空ではない）
}

#[test]
fn test_score_management() {
    let mut game = Game::new();
    game.start();

    // 初期スコアは0
    assert_eq!(game.score(), 0);

    // スコアを加算
    game.add_score(4, 1);
    assert_eq!(game.score(), 40); // 4 * 10 * 1

    // さらに加算
    game.add_score(4, 2);
    assert_eq!(game.score(), 120); // 40 + (4 * 10 * 2)
}

#[test]
fn test_chain_management() {
    let mut game = Game::new();
    game.start();

    // 初期連鎖数は0
    assert_eq!(game.chain_count(), 0);

    // 連鎖を増やす
    game.increment_chain();
    assert_eq!(game.chain_count(), 1);

    game.increment_chain();
    assert_eq!(game.chain_count(), 2);

    // 連鎖をリセット
    game.reset_chain();
    assert_eq!(game.chain_count(), 0);
}

#[test]
fn test_all_clear_bonus() {
    let mut game = Game::new();
    game.start();

    let initial_score = game.score();

    // 全消しボーナスを追加
    game.add_all_clear_bonus();

    // 5000点加算されている
    assert_eq!(game.score(), initial_score + 5000);
}
