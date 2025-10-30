"""Boston 住宅価格予測モデルの訓練スクリプト."""

import os
from pathlib import Path

from sklearn.model_selection import train_test_split

from src.ml.boston_predictor import BostonPredictor


def main() -> None:
    """メイン処理."""
    # プロジェクトルートディレクトリを取得
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    data_path = project_root / "data" / "Boston.csv"
    model_dir = project_root / "model"

    # モデル保存ディレクトリが存在しない場合は作成
    os.makedirs(model_dir, exist_ok=True)

    # 予測器の作成
    predictor = BostonPredictor()
    print("BostonPredictor を作成しました")

    # データの読み込み
    df = predictor.load_data(str(data_path))
    print(f"データを読み込みました: {len(df)} サンプル")

    # CRIME 列のダミー変数化
    df = predictor._encode_crime(df)
    print("CRIME 列をダミー変数化しました")

    # 欠損値の補完
    df = predictor._fill_missing_values(df, fit=True)
    print("欠損値を補完しました")

    # 外れ値の除外
    df = predictor._remove_outliers(df)
    print(f"外れ値を除外しました: {len(df)} サンプル")

    # 特徴量と目的変数の分離
    feature_columns = ["RM", "LSTAT", "PTRATIO"]
    X = df[feature_columns]
    y = df[["PRICE"]]

    # 訓練データとテストデータに分割
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=0
    )
    print(f"訓練データ: {len(X_train)} サンプル")
    print(f"テストデータ: {len(X_test)} サンプル")

    # 特徴量エンジニアリング
    X_train_eng = predictor.feature_engineering(X_train)
    X_test_eng = predictor.feature_engineering(X_test)
    print(f"特徴量エンジニアリング完了: {X_train_eng.shape[1]} 特徴量")

    # 特徴量の標準化
    X_train_scaled = predictor.standardize_features(X_train_eng, fit=True)
    X_test_scaled = predictor.standardize_features(X_test_eng, fit=False)
    print("特徴量を標準化しました")

    # 目的変数の標準化
    y_train_scaled = predictor.standardize_target(y_train, fit=True)
    y_test_scaled = predictor.standardize_target(y_test, fit=False)
    print("目的変数を標準化しました")

    # モデルの訓練
    predictor.train(X_train_scaled, y_train_scaled)
    print("\nモデルの訓練が完了しました")

    # モデルの評価（標準化されたデータで）
    score = predictor.evaluate(X_test_scaled, y_test_scaled)
    print("\n[モデルの評価]")
    print(f"  決定係数（R^2）: {score:.4f}")

    # モデルとスケーラーの保存
    model_path = model_dir / "boston_model.pkl"
    scaler_x_path = model_dir / "boston_scaler_X.pkl"
    scaler_y_path = model_dir / "boston_scaler_y.pkl"

    predictor.save_models(
        str(model_path),
        str(scaler_x_path),
        str(scaler_y_path),
    )
    print("\nモデルとスケーラーを保存しました")
    print(f"  - {model_path}")
    print(f"  - {scaler_x_path}")
    print(f"  - {scaler_y_path}")

    # 予測例
    print("\n[予測例]")
    sample_test = X_test_eng.iloc[:5]
    sample_test_scaled = predictor.standardize_features(sample_test, fit=False)
    predictions_scaled = predictor.predict(sample_test_scaled)

    # 予測結果を元のスケールに戻す
    predictions = predictor.inverse_transform_prediction(
        predictions_scaled.reshape(-1, 1)
    )

    for i in range(len(sample_test)):
        actual = y_test.iloc[i, 0]
        predicted = predictions[i, 0]
        error = abs(actual - predicted)

        print(f"\nサンプル {i + 1}:")
        print(
            f"  特徴量: RM={X_test.iloc[i]['RM']:.2f}, "
            f"LSTAT={X_test.iloc[i]['LSTAT']:.2f}, "
            f"PTRATIO={X_test.iloc[i]['PTRATIO']:.2f}"
        )
        print(f"  実際の価格: ${actual:.2f}K")
        print(f"  予測価格:   ${predicted:.2f}K")
        print(f"  誤差:       ${error:.2f}K")


if __name__ == "__main__":
    main()
