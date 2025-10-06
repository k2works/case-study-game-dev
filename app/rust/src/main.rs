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
    let mut _game = Game::new();

    loop {
        clear_background(BLACK);

        // ゲームの更新処理（次のイテレーションで実装）

        // ゲームの描画処理（次のイテレーションで実装）
        draw_text("Puyo Puyo Game", 120.0, 40.0, 30.0, WHITE);
        draw_text("Press Space to Start", 90.0, 300.0, 20.0, GRAY);

        next_frame().await
    }
}
