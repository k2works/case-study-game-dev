//! Survived 生存予測モデルの訓練スクリプト
//!
//! データを 80:20 で分割して訓練・評価を行います。

use ml_tdd_rust::models::survived::SurvivedClassifier;
use ml_tdd_rust::Result;
use ndarray::s;
use std::path::PathBuf;

fn main() -> Result<()> {
    println!("=== Survived 生存予測モデルの訓練 ===\n");

    // 1. データ読み込み
    println!("1. データ読み込み中...");
    let path = PathBuf::from("data/Survived.csv");
    let (features, targets) = SurvivedClassifier::load_data(&path)?;

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
    let mut classifier = SurvivedClassifier::new(9);
    classifier.train(&train_features, &train_targets)?;
    println!("   訓練完了\n");

    // 4. モデル評価
    println!("3. モデル評価:");

    // 訓練データでの評価
    let train_accuracy = classifier.evaluate(&train_features, &train_targets)?;
    println!("   訓練データ精度: {:.2}%", train_accuracy * 100.0);

    // 検証データでの評価
    let test_accuracy = classifier.evaluate(&test_features, &test_targets)?;
    println!("   検証データ精度: {:.2}%\n", test_accuracy * 100.0);

    // 5. サンプル予測
    println!("4. サンプル予測:");
    let sample_predictions = classifier.predict(&test_features.slice(s![..10, ..]).to_owned())?;
    let sample_targets = test_targets.slice(s![..10]);

    for (i, (&pred, &actual)) in sample_predictions
        .iter()
        .zip(sample_targets.iter())
        .enumerate()
    {
        let pred_label = if pred == 1 { "生存" } else { "死亡" };
        let actual_label = if actual == 1 { "生存" } else { "死亡" };
        let symbol = if pred == actual { "✓" } else { "✗" };

        println!(
            "   {} サンプル {}: 実際 = {}  | 予測 = {}",
            symbol,
            i + 1,
            actual_label,
            pred_label
        );
    }

    println!("\n=== 訓練完了 ===");

    Ok(())
}
