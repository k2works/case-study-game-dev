package main

import (
	"log"

	"github.com/case-study-game-dev/puyo-puyo-go/internal/game"
	"github.com/hajimehoshi/ebiten/v2"
)

func main() {
	g := game.New()

	ebiten.SetWindowSize(480, 720)
	ebiten.SetWindowTitle("ぷよぷよ")

	if err := ebiten.RunGame(g); err != nil {
		log.Fatal(err)
	}
}
