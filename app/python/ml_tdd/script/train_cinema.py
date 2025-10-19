"""Cinema 予測モデルの訓練スクリプト."""

# Windows の文字エンコーディング問題を回避
import io
import sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# プロジェクトのルートディレクトリをパスに追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.ml.cinema_predictor import CinemaPredictor


def main() -> None:
    """メイン処理."""
    print("=" * 60)
    print("Cinema 興行収入予測モデルの訓練")
    print("=" * 60)

    # データの読み込み
    print("\n1. データの読み込み...")
    predictor = CinemaPredictor()
    X, y = predictor.load_data("data/cinema.csv")

    print(f"   データサイズ: {X.shape[0]} サンプル, {X.shape[1]} 特徴量")
    print(f"   特徴量: {list(X.columns)}")
    print(f"   目的変数: {y.name}")
    print(f"   欠損値の有無: {X.isnull().sum().sum()} 個（補完済み）")

    # データの統計情報
    print("\n2. データの統計情報")
    print("\n   特徴量の統計:")
    print(X.describe())
    print("\n   目的変数の統計:")
    print(y.describe())

    # モデルの訓練
    print("\n3. モデルの訓練...")
    predictor.train(X, y)
    print("   訓練完了!")

    # モデルの評価（訓練データで）
    print("\n4. モデルの評価（訓練データ）...")
    predictions = predictor.predict(X)
    metrics = predictor.evaluate(y, predictions)

    print("\n   評価指標:")
    print(f"   - R² スコア: {metrics['r2']:.4f}")
    print(f"   - MAE (平均絶対誤差): {metrics['mae']:.2f}")
    print(f"   - RMSE (二乗平均平方根誤差): {metrics['rmse']:.2f}")

    # R² スコアの解釈
    print("\n   R² スコアの解釈:")
    if metrics["r2"] >= 0.9:
        print("   ➜ 非常に良い: モデルは 90% 以上の分散を説明")
    elif metrics["r2"] >= 0.7:
        print("   ➜ 良い: モデルは 70% 以上の分散を説明")
    elif metrics["r2"] >= 0.5:
        print("   ➜ 中程度: モデルは 50% 以上の分散を説明")
    else:
        print("   ➜ 改善の余地あり: モデルの説明力が低い")

    # モデル係数の表示
    print("\n5. モデルの係数（各特徴量の重要度）:")
    print(f"   - 切片: {predictor.model.intercept_:.2f}")
    for feature, coef in zip(X.columns, predictor.model.coef_):
        print(f"   - {feature}: {coef:.4f}")

    # 予測例の表示
    print("\n6. 予測例（最初の 5 サンプル）:")
    print(f"   {'実測値':>10} {'予測値':>10} {'誤差':>10}")
    print("   " + "-" * 32)
    for i in range(min(5, len(y))):
        error = predictions[i] - y.iloc[i]
        print(
            f"   {y.iloc[i]:>10.2f} {predictions[i]:>10.2f} {error:>10.2f}"
        )

    # モデルの保存
    print("\n7. モデルの保存...")
    model_path = "models/cinema_model.pkl"
    Path("models").mkdir(exist_ok=True)
    predictor.save_model(model_path)
    print(f"   モデルを保存しました: {model_path}")

    print("\n" + "=" * 60)
    print("訓練完了!")
    print("=" * 60)


if __name__ == "__main__":
    main()
