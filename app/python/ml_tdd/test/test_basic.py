"""基本的な環境確認テスト."""

import numpy as np
import pandas as pd
import sklearn


def test_パッケージのインポート確認() -> None:
    """必要なパッケージが正しくインストールされているか確認."""
    assert pd is not None  # pandas がインポートできる
    assert sklearn is not None  # scikit-learn がインポートできる
    assert np is not None  # numpy がインポートできる


def test_pandasのバージョン確認() -> None:
    """pandas のバージョンが 1.0 以上であることを確認."""
    version = pd.__version__
    major_version = int(version.split(".")[0])
    assert major_version >= 1  # pandas 1.x 以降が必要


def test_scikit_learnのバージョン確認() -> None:
    """scikit-learn のバージョンが 1.0 以上であることを確認."""
    version = sklearn.__version__
    major_version = int(version.split(".")[0])
    assert major_version >= 1  # scikit-learn 1.x 以降が必要


class TestDataFrameBasics:
    """pandas DataFrame の基本操作テスト."""

    def test_DataFrameの作成(self) -> None:
        """DataFrame を作成できることを確認."""
        df = pd.DataFrame({"A": [1, 2, 3], "B": [4, 5, 6]})
        assert len(df) == 3  # 3行のデータ
        assert list(df.columns) == ["A", "B"]  # 列名が正しい

    def test_欠損値の検出(self) -> None:
        """欠損値を正しく検出できることを確認."""
        df = pd.DataFrame({"A": [1, np.nan, 3]})
        assert df["A"].isnull().sum() == 1  # 1つ欠損値がある

    def test_データの選択(self) -> None:
        """特定の条件でデータを選択できることを確認."""
        df = pd.DataFrame({"A": [1, 2, 3], "B": [4, 5, 6]})
        filtered = df[df["A"] > 1]
        assert len(filtered) == 2  # 2行が条件に合致

    def test_新しい列の追加(self) -> None:
        """DataFrame に新しい列を追加できることを確認."""
        df = pd.DataFrame({"A": [1, 2, 3]})
        df["B"] = df["A"] * 2
        assert "B" in df.columns  # 新しい列が追加された
        assert df["B"].tolist() == [2, 4, 6]  # 値が正しい
