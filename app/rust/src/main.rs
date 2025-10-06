use macroquad::prelude::*;
use puyo_puyo_game::game::Game;

fn window_conf() -> Conf {
    Conf {
        window_title: "Puyo Puyo Game".to_owned(),
        window_width: 400,
        window_height: 600,
        ..Default::default()
    }
}

#[macroquad::main(window_conf)]
async fn main() {
    let mut game = Game::new();

    loop {
        clear_background(BLACK);

        // スペースキーでゲーム開始
        if is_key_pressed(KeyCode::Space) && game.mode() == puyo_puyo_game::game::GameMode::Start {
            game.start();
        }

        // Rキーでリスタート（ゲームオーバー時）
        if is_key_pressed(KeyCode::R) && game.mode() == puyo_puyo_game::game::GameMode::GameOver {
            game.restart();
        }

        // ゲームの更新処理
        let delta_time = get_frame_time();
        game.update(delta_time);

        // ゲームの描画処理
        if game.mode() == puyo_puyo_game::game::GameMode::Start {
            draw_text("Puyo Puyo Game", 120.0, 40.0, 30.0, WHITE);
            draw_text("Press Space to Start", 90.0, 300.0, 20.0, GRAY);
        } else {
            game.draw();
        }

        next_frame().await
    }
}
