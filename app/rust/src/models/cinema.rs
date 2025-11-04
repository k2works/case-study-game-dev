//! Cinema 興行収入予測モデル
//!
//! 線形回帰を使用して、映画の SNS 露出度から興行収入を予測します。

use ndarray::prelude::*;
use linfa::prelude::*;
use linfa_linear::{LinearRegression, FittedLinearRegression};
use std::path::Path;
use crate::error::{Error, Result};

/// Cinema 興行収入予測器
pub struct CinemaPredictor {
    model: Option<FittedLinearRegression<f64>>,
}

impl CinemaPredictor {
    /// 新しい CinemaPredictor を作成
    pub fn new() -> Self {
        Self { model: None }
    }

    /// CSV ファイルからデータを読み込む
    ///
    /// 欠損値は各列の平均値で補完されます。
    pub fn load_data<P: AsRef<Path>>(path: P) -> Result<(Array2<f64>, Array1<f64>)> {
        let mut reader = csv::Reader::from_path(path)?;

        let mut sns1_values = Vec::new();
        let mut sns2_values = Vec::new();
        let mut actor_values = Vec::new();
        let mut original_values = Vec::new();
        let mut sales_values = Vec::new();

        // データを読み込む（欠損値は後で補完）
        for result in reader.records() {
            let record = result?;

            // 各フィールドをパースし、欠損値は None として保存
            let sns1 = record[1].parse::<f64>().ok();
            let sns2 = record[2].parse::<f64>().ok();
            let actor = record[3].parse::<f64>().ok();
            let original = record[4].parse::<i32>().ok().map(|x| x as f64);
            let sales = record[5].parse::<f64>().ok();

            sns1_values.push(sns1);
            sns2_values.push(sns2);
            actor_values.push(actor);
            original_values.push(original);
            if let Some(s) = sales {
                sales_values.push(s);
            }
        }

        // 各列の平均値を計算（欠損値を除く）
        let sns1_mean = Self::calculate_mean(&sns1_values);
        let sns2_mean = Self::calculate_mean(&sns2_values);
        let actor_mean = Self::calculate_mean(&actor_values);

        // 欠損値を平均値で補完
        let sns1_filled: Vec<f64> = sns1_values.iter().map(|v| v.unwrap_or(sns1_mean)).collect();
        let sns2_filled: Vec<f64> = sns2_values.iter().map(|v| v.unwrap_or(sns2_mean)).collect();
        let actor_filled: Vec<f64> = actor_values.iter().map(|v| v.unwrap_or(actor_mean)).collect();
        let original_filled: Vec<f64> = original_values.iter().map(|v| v.unwrap_or(0.0)).collect();

        let n_samples = sns1_filled.len();

        // 特徴量行列を作成（4つの特徴量）
        let mut features = Vec::with_capacity(n_samples * 4);
        for i in 0..n_samples {
            features.push(sns1_filled[i]);
            features.push(sns2_filled[i]);
            features.push(actor_filled[i]);
            features.push(original_filled[i]);
        }

        let features_array = Array2::from_shape_vec((n_samples, 4), features)
            .map_err(|e| Error::Model(format!("Failed to create feature array: {}", e)))?;

        let targets_array = Array1::from_vec(sales_values);

        Ok((features_array, targets_array))
    }

    /// 欠損値を除いた平均値を計算
    fn calculate_mean(values: &[Option<f64>]) -> f64 {
        let valid_values: Vec<f64> = values.iter().filter_map(|&v| v).collect();
        if valid_values.is_empty() {
            0.0
        } else {
            valid_values.iter().sum::<f64>() / valid_values.len() as f64
        }
    }

    /// モデルを訓練
    pub fn train(&mut self, features: &Array2<f64>, targets: &Array1<f64>) -> Result<()> {
        // linfa の Dataset を作成
        let dataset = Dataset::new(features.clone(), targets.clone());

        // 線形回帰モデルを訓練
        let model = LinearRegression::default().fit(&dataset)
            .map_err(|e| Error::Linfa(format!("Failed to train model: {}", e)))?;

        self.model = Some(model);
        Ok(())
    }

}

impl Default for CinemaPredictor {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cinema_predictor_creation() {
        // CinemaPredictor のインスタンスを作成できることを確認
        let predictor = CinemaPredictor::new();
        assert!(predictor.model.is_none());
    }

    #[test]
    fn test_load_data_from_csv() {
        // CSV ファイルからデータを読み込む
        let result = CinemaPredictor::load_data("data/cinema.csv");
        assert!(result.is_ok());

        let (features, targets) = result.unwrap();

        // データの形状を確認（4つの特徴量: SNS1, SNS2, actor, original）
        assert_eq!(features.shape()[1], 4);
        assert!(features.shape()[0] > 0);

        // ターゲットの長さが特徴量の行数と一致
        assert_eq!(features.shape()[0], targets.len());
    }

    #[test]
    fn test_no_nan_values() {
        // 欠損値が補完されていることを確認
        let result = CinemaPredictor::load_data("data/cinema.csv");
        assert!(result.is_ok());

        let (features, targets) = result.unwrap();

        // 特徴量に NaN がないことを確認
        for row in features.rows() {
            for &value in row.iter() {
                assert!(!value.is_nan(), "Found NaN value in features");
            }
        }

        // ターゲットに NaN がないことを確認
        for &value in targets.iter() {
            assert!(!value.is_nan(), "Found NaN value in targets");
        }
    }

    #[test]
    fn test_positive_sales() {
        // 興行収入が正の値であることを確認
        let result = CinemaPredictor::load_data("data/cinema.csv");
        assert!(result.is_ok());

        let (_, targets) = result.unwrap();

        for &value in targets.iter() {
            assert!(value > 0.0, "Sales should be positive, found: {}", value);
        }
    }

    #[test]
    fn test_train_model() {
        let mut predictor = CinemaPredictor::new();

        // データを読み込む
        let (features, targets) = CinemaPredictor::load_data("data/cinema.csv").unwrap();

        // モデルを訓練
        let result = predictor.train(&features, &targets);
        assert!(result.is_ok());

        // モデルが設定されているか確認
        assert!(predictor.model.is_some());
    }
}
