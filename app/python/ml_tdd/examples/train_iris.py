"""Iris 分類モデルの訓練スクリプト.

このスクリプトは以下を実行します:
1. Iris データセットの読み込み
2. 訓練データとテストデータへの分割
3. 決定木モデルの訓練
4. モデルの評価
5. 訓練済みモデルの保存
"""

from sklearn.model_selection import train_test_split

from src.ml.iris_classifier import IrisClassifier


def main() -> None:
    """メイン処理."""
    print("=" * 60)
    print("Iris 分類モデルの訓練を開始します")
    print("=" * 60)
    print()

    # 1. データの読み込み
    print("[Step 1] データの読み込み")
    classifier = IrisClassifier(max_depth=3)
    X, y = classifier.load_data("data/iris.csv")
    print(f"  [OK] データ読み込み完了: {len(X)} サンプル, {X.shape[1]} 特徴量")
    print(f"  [OK] クラス: {sorted(y.unique())}")
    print()

    # 2. データの分割
    print("[Step 2] 訓練データとテストデータへの分割")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    print(f"  [OK] 訓練データ: {len(X_train)} サンプル")
    print(f"  [OK] テストデータ: {len(X_test)} サンプル")
    print()

    # 3. モデルの訓練
    print("[Step 3] モデルの訓練")
    print(f"  パラメータ: max_depth={classifier.max_depth}")
    classifier.train(X_train, y_train)
    print("  [OK] モデル訓練完了")
    print()

    # 4. モデルの評価
    print("[Step 4] モデルの評価")

    # 訓練データでの評価
    train_accuracy = classifier.evaluate(X_train, y_train)
    print(f"  訓練データ正解率: {train_accuracy:.4f} ({train_accuracy * 100:.2f}%)")

    # テストデータでの評価
    test_accuracy = classifier.evaluate(X_test, y_test)
    print(f"  テストデータ正解率: {test_accuracy:.4f} ({test_accuracy * 100:.2f}%)")
    print()

    # 過学習チェック
    overfitting = train_accuracy - test_accuracy
    if overfitting > 0.05:
        print(f"  [WARNING] 過学習の可能性: {overfitting:.4f}")
    else:
        print(f"  [OK] 過学習なし: 差分 {overfitting:.4f}")
    print()

    # 5. 予測例
    print("[Step 5] 予測例")
    # テストデータから最初の 5 サンプルを予測
    sample_X = X_test.head(5)
    sample_y = y_test.head(5)
    predictions = classifier.predict(sample_X)

    print("  サンプル | 予測値      | 正解値      | 結果")
    print("  " + "-" * 50)
    for i, (pred, actual) in enumerate(zip(predictions, sample_y, strict=True), 1):
        result = "OK" if pred == actual else "NG"
        print(f"  {i:7} | {pred:11} | {actual:11} | {result}")
    print()

    # 6. モデルの保存
    print("[Step 6] モデルの保存")
    model_path = "model/iris_model.pkl"
    classifier.save_model(model_path)
    print(f"  [OK] モデル保存完了: {model_path}")
    print()

    print("=" * 60)
    print("訓練完了！")
    print("=" * 60)
    print()
    print("最終結果:")
    print(f"  - テストデータ正解率: {test_accuracy * 100:.2f}%")
    print(f"  - モデル保存先: {model_path}")
    print()


if __name__ == "__main__":
    main()
