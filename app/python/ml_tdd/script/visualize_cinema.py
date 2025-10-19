"""Cinema 予測モデルの結果可視化スクリプト."""

# Windows の文字エンコーディング問題を回避
import io
import sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# プロジェクトのルートディレクトリをパスに追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import matplotlib.pyplot as plt
import numpy as np

from src.ml.cinema_predictor import CinemaPredictor

# 日本語フォント設定
plt.rcParams["font.sans-serif"] = ["MS Gothic", "Yu Gothic", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False


def plot_predictions(y_true, y_pred, save_path="results/cinema_predictions.png"):
    """予測結果の散布図を作成."""
    plt.figure(figsize=(10, 6))

    # 散布図
    plt.scatter(y_true, y_pred, alpha=0.6, edgecolors="k", linewidth=0.5)

    # 理想的な予測線（y = x）
    min_val = min(y_true.min(), y_pred.min())
    max_val = max(y_true.max(), y_pred.max())
    plt.plot([min_val, max_val], [min_val, max_val], "r--", lw=2, label="理想的な予測")

    plt.xlabel("実測値（興行収入）", fontsize=12)
    plt.ylabel("予測値（興行収入）", fontsize=12)
    plt.title("Cinema 興行収入予測：実測値 vs 予測値", fontsize=14, fontweight="bold")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()

    Path(save_path).parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(save_path, dpi=300, bbox_inches="tight")
    print(f"予測散布図を保存しました: {save_path}")
    plt.close()


def plot_residuals(
    y_true, y_pred, save_path="results/cinema_residuals.png"
):
    """残差プロットを作成."""
    residuals = y_pred - y_true

    fig, axes = plt.subplots(1, 2, figsize=(15, 5))

    # 残差プロット
    axes[0].scatter(y_pred, residuals, alpha=0.6, edgecolors="k", linewidth=0.5)
    axes[0].axhline(y=0, color="r", linestyle="--", lw=2)
    axes[0].set_xlabel("予測値", fontsize=12)
    axes[0].set_ylabel("残差（予測値 - 実測値）", fontsize=12)
    axes[0].set_title("残差プロット", fontsize=13, fontweight="bold")
    axes[0].grid(True, alpha=0.3)

    # 残差のヒストグラム
    axes[1].hist(residuals, bins=20, edgecolor="black", alpha=0.7)
    axes[1].axvline(x=0, color="r", linestyle="--", lw=2)
    axes[1].set_xlabel("残差", fontsize=12)
    axes[1].set_ylabel("頻度", fontsize=12)
    axes[1].set_title("残差の分布", fontsize=13, fontweight="bold")
    axes[1].grid(True, alpha=0.3, axis="y")

    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches="tight")
    print(f"残差プロットを保存しました: {save_path}")
    plt.close()


def plot_feature_importance(
    model, feature_names, save_path="results/cinema_feature_importance.png"
):
    """特徴量の重要度を可視化."""
    coefficients = model.coef_
    importance = np.abs(coefficients)

    # 重要度でソート
    indices = np.argsort(importance)[::-1]

    plt.figure(figsize=(10, 6))
    plt.bar(
        range(len(importance)),
        importance[indices],
        color="steelblue",
        edgecolor="black",
    )
    plt.xticks(
        range(len(importance)),
        [feature_names[i] for i in indices],
        rotation=45,
        ha="right",
    )
    plt.xlabel("特徴量", fontsize=12)
    plt.ylabel("重要度（係数の絶対値）", fontsize=12)
    plt.title("特徴量の重要度", fontsize=14, fontweight="bold")
    plt.grid(True, alpha=0.3, axis="y")
    plt.tight_layout()

    plt.savefig(save_path, dpi=300, bbox_inches="tight")
    print(f"特徴量重要度グラフを保存しました: {save_path}")
    plt.close()


def main() -> None:
    """メイン処理."""
    print("=" * 60)
    print("Cinema 予測モデルの結果可視化")
    print("=" * 60)

    # データの読み込み
    print("\n1. データとモデルの読み込み...")
    predictor = CinemaPredictor()
    X, y = predictor.load_data("data/cinema.csv")

    # 保存されたモデルの読み込み
    predictor.load_model("models/cinema_model.pkl")
    print("   モデルを読み込みました!")

    # 予測
    print("\n2. 予測の実行...")
    predictions = predictor.predict(X)
    metrics = predictor.evaluate(y, predictions)

    print(f"   R² スコア: {metrics['r2']:.4f}")
    print(f"   MAE: {metrics['mae']:.2f}")
    print(f"   RMSE: {metrics['rmse']:.2f}")

    # 可視化
    print("\n3. グラフの作成...")

    # 予測結果の散布図
    plot_predictions(y, predictions)

    # 残差プロット
    plot_residuals(y, predictions)

    # 特徴量の重要度
    plot_feature_importance(predictor.model, X.columns.tolist())

    print("\n" + "=" * 60)
    print("可視化完了! results/ フォルダを確認してください。")
    print("=" * 60)


if __name__ == "__main__":
    main()
