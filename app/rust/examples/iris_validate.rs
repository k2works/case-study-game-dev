//! Iris 分類モデルの交差検証スクリプト

use ml_tdd_rust::models::iris::IrisClassifier;
use ml_tdd_rust::Result;
use ndarray::{Array1, Array2, Axis};
use std::path::PathBuf;

fn main() -> Result<()> {
    println!("=== Iris 分類モデルの K-Fold 交差検証 ===\n");

    // データを読み込む
    println!("1. データ読み込み中...");
    let classifier = IrisClassifier::new();
    let path = PathBuf::from("data/iris.csv");
    let (features, targets) = classifier.load_data(&path)?;
    println!("   データ件数: {} 件\n", features.nrows());

    // K-Fold 交差検証 (K=5)
    let k_folds = 5;
    println!("2. {}-Fold 交差検証実行中...", k_folds);

    let fold_size = features.nrows() / k_folds;
    let mut accuracies = Vec::new();

    for fold in 0..k_folds {
        let start = fold * fold_size;
        let end = if fold == k_folds - 1 {
            features.nrows()
        } else {
            (fold + 1) * fold_size
        };

        // テストデータとトレーニングデータに分割
        let test_features = features.slice(ndarray::s![start..end, ..]).to_owned();
        let test_targets = targets.slice(ndarray::s![start..end]).to_owned();

        // トレーニングデータを結合
        let train_features = if fold == 0 {
            features.slice(ndarray::s![end.., ..]).to_owned()
        } else if fold == k_folds - 1 {
            features.slice(ndarray::s![..start, ..]).to_owned()
        } else {
            let before = features.slice(ndarray::s![..start, ..]);
            let after = features.slice(ndarray::s![end.., ..]);
            concatenate_arrays(&before.to_owned(), &after.to_owned())
        };

        let train_targets = if fold == 0 {
            targets.slice(ndarray::s![end..]).to_owned()
        } else if fold == k_folds - 1 {
            targets.slice(ndarray::s![..start]).to_owned()
        } else {
            let before = targets.slice(ndarray::s![..start]);
            let after = targets.slice(ndarray::s![end..]);
            concatenate_targets(&before.to_owned(), &after.to_owned())
        };

        // モデルを訓練
        let mut fold_classifier = IrisClassifier::new();
        fold_classifier.train(&train_features, &train_targets)?;

        // テストデータで評価
        let accuracy = fold_classifier.evaluate(&test_features, &test_targets)?;
        accuracies.push(accuracy);

        println!(
            "   Fold {}: 精度 = {:.2}% (訓練: {} 件, テスト: {} 件)",
            fold + 1,
            accuracy * 100.0,
            train_features.nrows(),
            test_features.nrows()
        );
    }

    // 平均精度と標準偏差を計算
    let mean_accuracy = accuracies.iter().sum::<f64>() / accuracies.len() as f64;
    let variance = accuracies
        .iter()
        .map(|&x| (x - mean_accuracy).powi(2))
        .sum::<f64>()
        / accuracies.len() as f64;
    let std_dev = variance.sqrt();

    println!("\n3. 結果:");
    println!("   平均精度: {:.2}% (± {:.2}%)", mean_accuracy * 100.0, std_dev * 100.0);
    println!("   最高精度: {:.2}%", accuracies.iter().cloned().fold(f64::NEG_INFINITY, f64::max) * 100.0);
    println!("   最低精度: {:.2}%", accuracies.iter().cloned().fold(f64::INFINITY, f64::min) * 100.0);

    println!("\n検証完了！");

    Ok(())
}

// 配列を結合するヘルパー関数
fn concatenate_arrays(a: &Array2<f64>, b: &Array2<f64>) -> Array2<f64> {
    ndarray::concatenate(Axis(0), &[a.view(), b.view()]).unwrap()
}

fn concatenate_targets(a: &Array1<usize>, b: &Array1<usize>) -> Array1<usize> {
    let mut result = Array1::zeros(a.len() + b.len());
    result.slice_mut(ndarray::s![..a.len()]).assign(a);
    result.slice_mut(ndarray::s![a.len()..]).assign(b);
    result
}
