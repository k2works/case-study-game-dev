//! Iris 分類モデルの訓練スクリプト

use ml_tdd_rust::models::iris::IrisClassifier;
use ml_tdd_rust::Result;
use ndarray::s;
use std::path::PathBuf;

fn main() -> Result<()> {
    println!("=== Iris 分類モデルの訓練 ===\n");

    // 分類器を作成
    let mut classifier = IrisClassifier::new();

    // データを読み込む
    println!("1. データ読み込み中...");
    let path = PathBuf::from("data/iris.csv");
    let (features, targets) = classifier.load_data(&path)?;
    println!("   データ件数: {} 件", features.nrows());
    println!("   特徴量数: {} 個", features.ncols());

    // 訓練データと検証データに分割（80:20）
    let n_samples = features.nrows();
    let train_size = (n_samples as f64 * 0.8) as usize;

    let train_features = features.slice(s![..train_size, ..]).to_owned();
    let train_targets = targets.slice(s![..train_size]).to_owned();
    let test_features = features.slice(s![train_size.., ..]).to_owned();
    let test_targets = targets.slice(s![train_size..]).to_owned();

    println!("   訓練データ: {} 件", train_features.nrows());
    println!("   検証データ: {} 件\n", test_features.nrows());

    // モデルを訓練
    println!("2. モデル訓練中...");
    classifier.train(&train_features, &train_targets)?;
    println!("   訓練完了\n");

    // 訓練データでの精度を評価
    println!("3. モデル評価:");
    let train_accuracy = classifier.evaluate(&train_features, &train_targets)?;
    println!("   訓練データ精度: {:.2}%", train_accuracy * 100.0);

    // 検証データでの精度を評価
    let test_accuracy = classifier.evaluate(&test_features, &test_targets)?;
    println!("   検証データ精度: {:.2}%\n", test_accuracy * 100.0);

    // サンプル予測
    println!("4. サンプル予測:");
    let sample_features = test_features.slice(s![0..5, ..]).to_owned();
    let sample_targets = test_targets.slice(s![0..5]).to_owned();
    let predictions = classifier.predict(&sample_features)?;

    for i in 0..5 {
        let actual = IrisClassifier::decode_species(sample_targets[i])?;
        let predicted = IrisClassifier::decode_species(predictions[i])?;
        let match_symbol = if sample_targets[i] == predictions[i] {
            "✓"
        } else {
            "✗"
        };
        println!(
            "   {} 実際: {:12} | 予測: {:12}",
            match_symbol, actual, predicted
        );
    }

    println!("\n訓練完了！");

    Ok(())
}
