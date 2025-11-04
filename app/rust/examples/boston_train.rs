//! Boston 住宅価格予測モデルの訓練スクリプト
//!
//! データを 80:20 で分割して訓練・評価を行います。

use ml_tdd_rust::models::boston::BostonPredictor;
use ml_tdd_rust::Result;
use ndarray::s;
use std::path::PathBuf;

fn main() -> Result<()> {
    println!("=== Boston 住宅価格予測モデルの訓練 ===\n");

    // 1. データ読み込み
    println!("1. データ読み込み中...");
    let path = PathBuf::from("data/Boston.csv");
    let (features, targets) = BostonPredictor::load_data(&path)?;

    println!("   データ件数: {} 件", features.nrows());
    println!("   特徴量数: {} 個", features.ncols());

    // 2. データ分割（80:20）
    let train_size = (features.nrows() as f64 * 0.8) as usize;
    let train_features = features.slice(s![..train_size, ..]).to_owned();
    let train_targets = targets.slice(s![..train_size]).to_owned();
    let test_features = features.slice(s![train_size.., ..]).to_owned();
    let test_targets = targets.slice(s![train_size..]).to_owned();

    println!("   訓練データ: {} 件", train_size);
    println!("   検証データ: {} 件\n", features.nrows() - train_size);

    // 3. モデル訓練
    println!("2. モデル訓練中...");
    let mut predictor = BostonPredictor::new(1.0);
    predictor.train(&train_features, &train_targets)?;
    println!("   訓練完了\n");

    // 4. モデル評価
    println!("3. モデル評価:");

    // 訓練データでの評価
    let (train_r2, train_mae, train_rmse) =
        predictor.evaluate(&train_features, &train_targets)?;
    println!("   訓練データ:");
    println!("     R² スコア: {:.4}", train_r2);
    println!("     MAE: {:.2}", train_mae);
    println!("     RMSE: {:.2}", train_rmse);

    // 検証データでの評価
    let (test_r2, test_mae, test_rmse) = predictor.evaluate(&test_features, &test_targets)?;
    println!("\n   検証データ:");
    println!("     R² スコア: {:.4}", test_r2);
    println!("     MAE: {:.2}", test_mae);
    println!("     RMSE: {:.2}", test_rmse);

    // 5. サンプル予測
    println!("\n4. サンプル予測:");
    let sample_predictions = predictor.predict(&test_features.slice(s![..10, ..]).to_owned())?;
    let sample_targets = test_targets.slice(s![..10]);

    for (i, (&pred, &actual)) in sample_predictions
        .iter()
        .zip(sample_targets.iter())
        .enumerate()
    {
        let error = (pred - actual).abs();
        let symbol = if error < 3.0 { "✓" } else { "✗" };

        println!(
            "   {} サンプル {}: 実際 = {:.1} 千ドル | 予測 = {:.1} 千ドル | 誤差 = {:.1} 千ドル",
            symbol,
            i + 1,
            actual,
            pred,
            error
        );
    }

    println!("\n=== 訓練完了 ===");

    Ok(())
}
