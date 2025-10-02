import pyxel


class App:
    def __init__(self) -> None:
        pyxel.init(160, 120, title="Hello Pyxel")
        pyxel.run(self.update, self.draw)

    def update(self) -> None:
        if pyxel.btnp(pyxel.KEY_Q):
            pyxel.quit()

    def draw(self) -> None:
        pyxel.cls(0)
        pyxel.text(55, 41, "Hello, Pyxel!", pyxel.frame_count % 16)
        pyxel.text(50, 50, "Press Q to quit", 7)


App()
