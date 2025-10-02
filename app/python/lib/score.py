"""スコア管理クラス"""


class Score:
    """スコアの計算と表示を管理するクラス"""

    # 連鎖ボーナステーブル（連鎖数 → 倍率）
    CHAIN_BONUS = [0, 0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256]

    # 全消しボーナス
    ZENKESHI_BONUS = 2100

    def __init__(self) -> None:
        """スコアの初期化"""
        self.score: int = 0

    def calculate_score(
        self, erase_count: int, chain_count: int, is_zenkeshi: bool = False
    ) -> int:
        """スコアを計算して加算

        Args:
            erase_count: 消したぷよの数
            chain_count: 連鎖数（1連鎖目=1、2連鎖目=2...）
            is_zenkeshi: 全消しかどうか

        Returns:
            今回加算されたスコア
        """
        # 基本点 = 消したぷよの数 × 10
        base_score = erase_count * 10

        # 連鎖ボーナス
        chain_bonus = 0
        if chain_count < len(self.CHAIN_BONUS):
            chain_bonus = self.CHAIN_BONUS[chain_count]
        else:
            # 12連鎖以上は最大ボーナス
            chain_bonus = self.CHAIN_BONUS[-1]

        # スコア = 基本点 × (1 + 連鎖ボーナス/100)
        added_score = int(base_score * (1 + chain_bonus / 100))

        # 全消しボーナス
        if is_zenkeshi:
            added_score += self.ZENKESHI_BONUS

        # スコアを加算
        self.score += added_score

        return added_score

    def reset(self) -> None:
        """スコアをリセット"""
        self.score = 0
