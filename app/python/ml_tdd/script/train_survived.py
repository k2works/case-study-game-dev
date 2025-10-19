"""Survived 生存予測モデルの訓練スクリプト."""

from sklearn.model_selection import train_test_split

from src.ml.survived_classifier import SurvivedClassifier


def main() -> None:
    """メイン処理."""
    # 分類器の作成
    classifier = SurvivedClassifier(max_depth=9, class_weight="balanced")
    print("SurvivedClassifier を作成しました")

    # データの読み込みと前処理
    X, y = classifier.load_data("data/Survived.csv", preprocess=True)
    print(f"データを読み込みました: {len(X)} サンプル")

    # 訓練データとテストデータに分割
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=0
    )
    print(f"訓練データ: {len(X_train)} サンプル")
    print(f"テストデータ: {len(X_test)} サンプル")

    # クラス分布の確認
    survived_count = int(y_train.sum())
    total_count = len(y_train)
    print("\n[訓練データのクラス分布]")
    print(
        f"  生存: {survived_count} ({survived_count/total_count*100:.1f}%)"
    )
    print(
        f"  死亡: {total_count - survived_count} "
        f"({(total_count-survived_count)/total_count*100:.1f}%)"
    )

    # モデルの訓練
    classifier.train(X_train, y_train)
    print("\nモデルの訓練が完了しました")

    # 特徴量の重要度表示
    print("\n[特徴量の重要度]")
    feature_names = ["Pclass", "Age", "SibSp", "Parch", "Fare", "male"]
    if classifier.model is None:
        raise RuntimeError("Model has not been trained yet")

    importances = classifier.model.feature_importances_

    # 重要度でソート
    sorted_indices = sorted(
        range(len(importances)), key=lambda i: importances[i], reverse=True
    )

    for idx in sorted_indices:
        print(f"  {feature_names[idx]}: {importances[idx]:.4f}")

    # モデルの評価
    accuracy = classifier.evaluate(X_test, y_test)
    print("\n[モデルの評価]")
    print(f"  正解率（Accuracy）: {accuracy:.4f}")

    # モデルの保存
    classifier.save_model("model/survived.pkl")
    print("\nモデルを model/survived.pkl に保存しました")

    # 予測例
    print("\n[予測例]")
    sample = X_test.iloc[:5]
    predictions = classifier.predict(sample)

    for i, (_idx, row) in enumerate(sample.iterrows()):
        actual = y_test.iloc[i]
        predicted = predictions[i]
        result = "O" if actual == predicted else "X"

        print(f"\nサンプル {i+1}: {result}")
        print(
            f"  Pclass: {int(row['Pclass'])}, Age: {row['Age']:.0f}, "
            f"Sex: {'male' if row['male'] == 1 else 'female'}"
        )
        print(
            f"  SibSp: {int(row['SibSp'])}, Parch: {int(row['Parch'])}, "
            f"Fare: {row['Fare']:.2f}"
        )
        print(f"  実際: {'生存' if actual == 1 else '死亡'}")
        print(f"  予測: {'生存' if predicted == 1 else '死亡'}")


if __name__ == "__main__":
    main()
