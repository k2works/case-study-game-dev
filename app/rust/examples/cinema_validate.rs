//! Cinema 興行収入予測モデルの交差検証スクリプト

use ml_tdd_rust::models::cinema::CinemaPredictor;
use ml_tdd_rust::Result;
use ndarray::{Array1, Array2, Axis};
use std::path::PathBuf;

fn main() -> Result<()> {
    println!("=== Cinema 興行収入予測モデルの K-Fold 交差検証 ===\n");

    // データを読み込む
    println!("1. データ読み込み中...");
    let path = PathBuf::from("data/cinema.csv");
    let (features, targets) = CinemaPredictor::load_data(&path)?;
    println!("   データ件数: {} 件\n", features.nrows());

    // K-Fold 交差検証 (K=5)
    let k_folds = 5;
    println!("2. {}-Fold 交差検証実行中...", k_folds);

    let fold_size = features.nrows() / k_folds;
    let mut r2_scores = Vec::new();
    let mut mae_scores = Vec::new();
    let mut rmse_scores = Vec::new();

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
        let mut predictor = CinemaPredictor::new();
        predictor.train(&train_features, &train_targets)?;

        // テストデータで評価
        let (r2, mae, rmse) = predictor.evaluate(&test_features, &test_targets)?;
        r2_scores.push(r2);
        mae_scores.push(mae);
        rmse_scores.push(rmse);

        println!(
            "   Fold {}: R² = {:.4}, MAE = {:.2}, RMSE = {:.2} (訓練: {} 件, テスト: {} 件)",
            fold + 1,
            r2,
            mae,
            rmse,
            train_features.nrows(),
            test_features.nrows()
        );
    }

    // 統計量を計算
    println!("\n3. 結果:");

    // R² の統計
    let mean_r2 = r2_scores.iter().sum::<f64>() / r2_scores.len() as f64;
    let std_r2 = calculate_std(&r2_scores, mean_r2);
    println!("\n   R² スコア:");
    println!("     平均: {:.4} (± {:.4})", mean_r2, std_r2);
    println!("     最高: {:.4}", r2_scores.iter().cloned().fold(f64::NEG_INFINITY, f64::max));
    println!("     最低: {:.4}", r2_scores.iter().cloned().fold(f64::INFINITY, f64::min));

    // MAE の統計
    let mean_mae = mae_scores.iter().sum::<f64>() / mae_scores.len() as f64;
    let std_mae = calculate_std(&mae_scores, mean_mae);
    println!("\n   MAE (平均絶対誤差):");
    println!("     平均: {:.2} 万円 (± {:.2})", mean_mae, std_mae);
    println!("     最良: {:.2} 万円", mae_scores.iter().cloned().fold(f64::INFINITY, f64::min));
    println!("     最悪: {:.2} 万円", mae_scores.iter().cloned().fold(f64::NEG_INFINITY, f64::max));

    // RMSE の統計
    let mean_rmse = rmse_scores.iter().sum::<f64>() / rmse_scores.len() as f64;
    let std_rmse = calculate_std(&rmse_scores, mean_rmse);
    println!("\n   RMSE (二乗平均平方根誤差):");
    println!("     平均: {:.2} 万円 (± {:.2})", mean_rmse, std_rmse);
    println!("     最良: {:.2} 万円", rmse_scores.iter().cloned().fold(f64::INFINITY, f64::min));
    println!("     最悪: {:.2} 万円", rmse_scores.iter().cloned().fold(f64::NEG_INFINITY, f64::max));

    println!("\n検証完了！");

    Ok(())
}

// 配列を結合するヘルパー関数
fn concatenate_arrays(a: &Array2<f64>, b: &Array2<f64>) -> Array2<f64> {
    ndarray::concatenate(Axis(0), &[a.view(), b.view()]).unwrap()
}

fn concatenate_targets(a: &Array1<f64>, b: &Array1<f64>) -> Array1<f64> {
    let mut result = Array1::zeros(a.len() + b.len());
    result.slice_mut(ndarray::s![..a.len()]).assign(a);
    result.slice_mut(ndarray::s![a.len()..]).assign(b);
    result
}

// 標準偏差を計算
fn calculate_std(values: &[f64], mean: f64) -> f64 {
    let variance = values
        .iter()
        .map(|&x| (x - mean).powi(2))
        .sum::<f64>()
        / values.len() as f64;
    variance.sqrt()
}
