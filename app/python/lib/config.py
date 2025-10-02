"""ゲーム設定クラス"""


class Config:
    """ゲームの設定値を管理するクラス"""

    def __init__(self) -> None:
        """設定の初期化"""
        self.stage_cols: int = 6  # ステージの列数
        self.stage_rows: int = 12  # ステージの行数
        self.puyo_size: int = 32  # ぷよのサイズ(ピクセル)
        self.stage_bg_color: int = 1  # ステージの背景色(Pyxel色番号)
        self.stage_border_color: int = 5  # ステージの枠線色
