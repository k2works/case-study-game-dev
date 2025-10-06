use macroquad::prelude::*;

#[macroquad::main("Puyo Puyo")]
async fn main() {
    loop {
        clear_background(BLACK);

        draw_text("Puyo Puyo Game", 20.0, 20.0, 30.0, WHITE);

        next_frame().await
    }
}
