"""保存済み Iris 分類モデルを使った予測スクリプト.

このスクリプトは以下を実行します:
1. 保存済みモデルの読み込み
2. 新しいデータでの予測
3. 結果の表示
"""

import pandas as pd

from src.ml.iris_classifier import IrisClassifier


def main() -> None:
    """メイン処理."""
    print("=" * 60)
    print("保存済み Iris 分類モデルでの予測")
    print("=" * 60)
    print()

    # 1. 保存済みモデルの読み込み
    print("[Step 1] 保存済みモデルの読み込み")
    model_path = "model/iris_model.pkl"
    classifier = IrisClassifier()
    classifier.load_model(model_path)
    print(f"  [OK] モデル読み込み完了: {model_path}")
    print()

    # 2. 新しいデータを準備
    print("[Step 2] 予測データの準備")
    # サンプルデータ（異なる種類のアヤメの特徴量）
    test_data = pd.DataFrame(
        {
            "sepal_length": [5.1, 6.5, 7.2],
            "sepal_width": [3.5, 3.0, 3.0],
            "petal_length": [1.4, 5.0, 5.8],
            "petal_width": [0.2, 1.5, 1.6],
        }
    )

    print("  予測するサンプル:")
    print(test_data.to_string(index=False))
    print()

    # 3. 予測の実行
    print("[Step 3] 予測の実行")
    predictions = classifier.predict(test_data)

    print("  結果:")
    for i, pred in enumerate(predictions, 1):
        print(f"    サンプル {i}: {pred}")
    print()

    # 4. 詳細な予測結果
    print("[Step 4] 詳細な予測結果")
    print()
    print("  " + "-" * 70)
    print(
        f"  {'No.':>4} | "
        f"{'sepal_length':>12} | "
        f"{'sepal_width':>11} | "
        f"{'petal_length':>12} | "
        f"{'petal_width':>11} | "
        f"{'予測':>11}"
    )
    print("  " + "-" * 70)

    for i, (idx, row) in enumerate(test_data.iterrows(), 1):
        print(
            f"  {i:>4} | "
            f"{row['sepal_length']:>12.1f} | "
            f"{row['sepal_width']:>11.1f} | "
            f"{row['petal_length']:>12.1f} | "
            f"{row['petal_width']:>11.1f} | "
            f"{predictions[i-1]:>11}"
        )
    print("  " + "-" * 70)
    print()

    print("=" * 60)
    print("予測完了！")
    print("=" * 60)
    print()

    # 5. 期待される結果の説明
    print("参考情報:")
    print("  - setosa:     花びらが小さい（長さ < 2cm）")
    print("  - versicolor: 花びらが中程度（長さ 3-5cm）")
    print("  - virginica:  花びらが大きい（長さ > 5cm）")
    print()


if __name__ == "__main__":
    main()
