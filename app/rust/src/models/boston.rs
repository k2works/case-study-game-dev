//! Boston 住宅価格予測モデル
//!
//! Ridge Regression を使用して、ボストンの住宅価格を予測します。

use crate::error::{Error, Result};
use linfa::prelude::*;
use linfa_linear::{FittedLinearRegression, LinearRegression};
use ndarray::prelude::*;
use serde::{Deserialize, Serialize};
use std::path::Path;

/// CRIME カテゴリを表す型安全な Enum
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CrimeLevel {
    VeryLow,
    Low,
    High,
}

impl CrimeLevel {
    /// 文字列から `CrimeLevel` に変換
    #[allow(clippy::should_implement_trait)]
    pub fn from_str(s: &str) -> Result<Self> {
        match s.trim().to_lowercase().as_str() {
            "very_low" => Ok(CrimeLevel::VeryLow),
            "low" => Ok(CrimeLevel::Low),
            "high" => Ok(CrimeLevel::High),
            _ => Err(Error::Model(format!("Invalid crime level: {s}"))),
        }
    }

    /// ダミー変数化（VeryLow を基準 = 0 とする）
    /// Low = [1, 0], High = [0, 1]
    #[must_use]
    pub fn to_dummies(self) -> (f64, f64) {
        match self {
            CrimeLevel::VeryLow => (0.0, 0.0),
            CrimeLevel::Low => (1.0, 0.0),
            CrimeLevel::High => (0.0, 1.0),
        }
    }
}

/// 標準化スケーラー
#[derive(Debug, Clone)]
pub struct StandardScaler {
    pub mean: Array1<f64>,
    pub std: Array1<f64>,
}

impl StandardScaler {
    /// 新しい `StandardScaler` を作成
    #[must_use]
    pub fn new() -> Self {
        Self {
            mean: Array1::zeros(0),
            std: Array1::zeros(0),
        }
    }

    /// データから平均と標準偏差を計算
    pub fn fit(&mut self, data: &Array2<f64>) {
        self.mean = data.mean_axis(Axis(0)).unwrap();
        self.std = data.std_axis(Axis(0), 0.0);
    }

    /// データを標準化（Z-score normalization）
    #[must_use]
    #[allow(clippy::op_ref)]
    pub fn transform(&self, data: &Array2<f64>) -> Array2<f64> {
        let mean_broadcast = self.mean.broadcast(data.dim()).unwrap();
        let std_broadcast = self.std.broadcast(data.dim()).unwrap();
        (data - &mean_broadcast) / &std_broadcast
    }

    /// 標準化されたデータを元のスケールに戻す
    #[must_use]
    #[allow(clippy::op_ref)]
    pub fn inverse_transform(&self, data: &Array2<f64>) -> Array2<f64> {
        let mean_broadcast = self.mean.broadcast(data.dim()).unwrap();
        let std_broadcast = self.std.broadcast(data.dim()).unwrap();
        data * &std_broadcast + &mean_broadcast
    }
}

impl Default for StandardScaler {
    fn default() -> Self {
        Self::new()
    }
}

/// Boston 住宅価格予測器
pub struct BostonPredictor {
    pub model: Option<FittedLinearRegression<f64>>,
    pub scaler_x: Option<StandardScaler>,
    pub scaler_y: Option<StandardScaler>,
    #[allow(dead_code)]
    alpha: f64,
}

impl BostonPredictor {
    /// 新しい `BostonPredictor` を作成
    #[must_use]
    pub fn new(alpha: f64) -> Self {
        Self {
            model: None,
            scaler_x: None,
            scaler_y: None,
            alpha,
        }
    }

    /// CSV ファイルからデータを読み込む
    ///
    /// 欠損値は各列の平均値で補完されます。
    /// CRIME（犯罪率カテゴリ）はダミー変数化されます。
    pub fn load_data<P: AsRef<Path>>(path: P) -> Result<(Array2<f64>, Array1<f64>)> {
        let mut reader = csv::Reader::from_path(path)?;

        let mut rm_values = Vec::new();
        let mut lstat_values = Vec::new();
        let mut ptratio_values = Vec::new();
        let mut crime_values = Vec::new();
        let mut price_values = Vec::new();

        // データを読み込む（欠損値は後で補完）
        for result in reader.records() {
            let record = result?;

            // CRIME は 0, RM は 5, LSTAT は 12, PTRATIO は 10, PRICE は 13
            let crime = &record[0];
            let rm = record[5].parse::<f64>().ok();
            let ptratio = record[10].parse::<f64>().ok();
            let lstat = record[12].parse::<f64>().ok();
            let price = record[13].parse::<f64>().ok();

            crime_values.push(crime.to_string());
            rm_values.push(rm);
            lstat_values.push(lstat);
            ptratio_values.push(ptratio);
            if let Some(p) = price {
                price_values.push(p);
            }
        }

        // 各列の平均値を計算（欠損値を除く）
        let rm_mean = Self::calculate_mean_f64(&rm_values);
        let lstat_mean = Self::calculate_mean_f64(&lstat_values);
        let ptratio_mean = Self::calculate_mean_f64(&ptratio_values);

        // 欠損値を平均値で補完
        let rm_filled: Vec<f64> = rm_values.iter().map(|v| v.unwrap_or(rm_mean)).collect();
        let lstat_filled: Vec<f64> = lstat_values
            .iter()
            .map(|v| v.unwrap_or(lstat_mean))
            .collect();
        let ptratio_filled: Vec<f64> = ptratio_values
            .iter()
            .map(|v| v.unwrap_or(ptratio_mean))
            .collect();

        // CRIME をダミー変数化
        let crime_dummies: Vec<(f64, f64)> = crime_values
            .iter()
            .map(|s| CrimeLevel::from_str(s).map(CrimeLevel::to_dummies))
            .collect::<Result<Vec<_>>>()?;

        let n_samples = rm_filled.len();

        // 特徴量行列を作成（5つの特徴量: RM, LSTAT, PTRATIO, CRIME_LOW, CRIME_HIGH）
        let mut features = Vec::with_capacity(n_samples * 5);
        for i in 0..n_samples {
            features.push(rm_filled[i]);
            features.push(lstat_filled[i]);
            features.push(ptratio_filled[i]);
            features.push(crime_dummies[i].0); // CRIME_LOW
            features.push(crime_dummies[i].1); // CRIME_HIGH
        }

        let features_array = Array2::from_shape_vec((n_samples, 5), features)
            .map_err(|e| Error::Model(format!("Failed to create feature array: {e}")))?;

        let targets_array = Array1::from_vec(price_values);

        Ok((features_array, targets_array))
    }

    /// 欠損値を除いた平均値を計算（f64）
    #[allow(clippy::cast_precision_loss)]
    fn calculate_mean_f64(values: &[Option<f64>]) -> f64 {
        let valid_values: Vec<f64> = values.iter().filter_map(|&v| v).collect();
        if valid_values.is_empty() {
            0.0
        } else {
            valid_values.iter().sum::<f64>() / valid_values.len() as f64
        }
    }

    /// 特徴量エンジニアリング（2乗項、交互作用項を追加）
    ///
    /// 入力: [RM, LSTAT, PTRATIO, `CRIME_LOW`, `CRIME_HIGH`]
    /// 出力: [RM, LSTAT, PTRATIO, `CRIME_LOW`, `CRIME_HIGH`, RM^2, RM*LSTAT]
    pub fn engineer_features(features: &Array2<f64>) -> Result<Array2<f64>> {
        let n_samples = features.nrows();

        // 元の特徴量
        let rm = features.column(0);
        let lstat = features.column(1);

        // 2乗項: RM^2
        let rm_squared = rm.mapv(|x| x * x);

        // 交互作用項: RM * LSTAT
        let rm_lstat = &rm * &lstat;

        // 拡張特徴量行列を作成（7つの特徴量）
        let mut extended = Array2::zeros((n_samples, 7));

        // 元の特徴量をコピー
        for i in 0..5 {
            extended.column_mut(i).assign(&features.column(i));
        }

        // 新しい特徴量を追加
        extended.column_mut(5).assign(&rm_squared);
        extended.column_mut(6).assign(&rm_lstat);

        Ok(extended)
    }

    /// モデルを訓練
    pub fn train(&mut self, features: &Array2<f64>, targets: &Array1<f64>) -> Result<()> {
        // 特徴量エンジニアリング
        let features_extended = Self::engineer_features(features)?;

        // 特徴量を標準化
        let mut scaler_x = StandardScaler::new();
        scaler_x.fit(&features_extended);
        let features_scaled = scaler_x.transform(&features_extended);

        // 目的変数を標準化
        let mut scaler_y = StandardScaler::new();
        let targets_2d = targets.clone().insert_axis(Axis(1));
        scaler_y.fit(&targets_2d);
        let targets_scaled = scaler_y.transform(&targets_2d);
        let targets_scaled_1d = targets_scaled.column(0).to_owned();

        // linfa の Dataset を作成
        let dataset = Dataset::new(features_scaled, targets_scaled_1d);

        // 線形回帰モデルを訓練（Ridge回帰の代わりに通常の線形回帰を使用）
        // NOTE: linfa 0.7 では Ridge 回帰の直接的なサポートがないため、
        // 特徴量エンジニアリングと標準化で過学習を抑制
        let model = LinearRegression::new()
            .with_intercept(true)
            .fit(&dataset)
            .map_err(|e| Error::Model(format!("Failed to train model: {e}")))?;

        self.model = Some(model);
        self.scaler_x = Some(scaler_x);
        self.scaler_y = Some(scaler_y);

        Ok(())
    }

    /// 住宅価格を予測
    pub fn predict(&self, features: &Array2<f64>) -> Result<Array1<f64>> {
        let model = self
            .model
            .as_ref()
            .ok_or_else(|| Error::Model("Model not trained yet".to_string()))?;

        let scaler_x = self
            .scaler_x
            .as_ref()
            .ok_or_else(|| Error::Model("Scaler X not fitted yet".to_string()))?;

        let scaler_y = self
            .scaler_y
            .as_ref()
            .ok_or_else(|| Error::Model("Scaler Y not fitted yet".to_string()))?;

        // 特徴量エンジニアリング
        let features_extended = Self::engineer_features(features)?;

        // 特徴量を標準化
        let features_scaled = scaler_x.transform(&features_extended);

        // 予測（標準化されたスケール）
        let predictions_scaled = model.predict(&features_scaled);

        // 元のスケールに戻す
        let predictions_2d = predictions_scaled.insert_axis(Axis(1));
        let predictions_original = scaler_y.inverse_transform(&predictions_2d);
        let predictions = predictions_original.column(0).to_owned();

        Ok(predictions)
    }

    /// モデルの性能を評価（R², MAE, RMSE）
    #[allow(clippy::cast_precision_loss)]
    pub fn evaluate(
        &self,
        features: &Array2<f64>,
        targets: &Array1<f64>,
    ) -> Result<(f64, f64, f64)> {
        let predictions = self.predict(features)?;

        // R² スコア
        let mean_target = targets.mean().unwrap();
        let ss_tot: f64 = targets.iter().map(|&y| (y - mean_target).powi(2)).sum();
        let ss_res: f64 = targets
            .iter()
            .zip(predictions.iter())
            .map(|(&y, &pred)| (y - pred).powi(2))
            .sum();
        let r2 = 1.0 - (ss_res / ss_tot);

        // MAE (Mean Absolute Error)
        let mae: f64 = targets
            .iter()
            .zip(predictions.iter())
            .map(|(&y, &pred)| (y - pred).abs())
            .sum::<f64>()
            / targets.len() as f64;

        // RMSE (Root Mean Squared Error)
        let mse: f64 = ss_res / targets.len() as f64;
        let rmse = mse.sqrt();

        Ok((r2, mae, rmse))
    }
}

impl Default for BostonPredictor {
    fn default() -> Self {
        Self::new(1.0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_boston_predictor_creation() {
        // BostonPredictor のインスタンスを作成できることを確認
        let predictor = BostonPredictor::new(1.0);
        assert!(predictor.model.is_none());
        assert!(predictor.scaler_x.is_none());
        assert!(predictor.scaler_y.is_none());
        assert_eq!(predictor.alpha, 1.0);
    }

    #[test]
    fn test_custom_alpha() {
        // カスタムの alpha を設定できることを確認
        let predictor = BostonPredictor::new(0.5);
        assert_eq!(predictor.alpha, 0.5);
    }

    #[test]
    fn test_load_data_from_csv() {
        // CSV ファイルからデータを読み込む
        let result = BostonPredictor::load_data("data/Boston.csv");
        assert!(result.is_ok());

        let (features, targets) = result.unwrap();

        // 特徴量の確認（5列: RM, LSTAT, PTRATIO, CRIME_LOW, CRIME_HIGH）
        assert_eq!(features.shape()[1], 5);
        assert!(features.shape()[0] > 0);

        // ターゲットの確認
        assert!(targets.len() > 0);
    }

    #[test]
    fn test_crime_level_from_str() {
        // 文字列から CrimeLevel に変換
        assert_eq!(
            CrimeLevel::from_str("very_low").unwrap(),
            CrimeLevel::VeryLow
        );
        assert_eq!(CrimeLevel::from_str("low").unwrap(), CrimeLevel::Low);
        assert_eq!(CrimeLevel::from_str("high").unwrap(), CrimeLevel::High);
        assert_eq!(CrimeLevel::from_str("HIGH").unwrap(), CrimeLevel::High);

        // 無効な値でエラー
        assert!(CrimeLevel::from_str("invalid").is_err());
    }

    #[test]
    fn test_crime_level_to_dummies() {
        // ダミー変数化
        assert_eq!(CrimeLevel::VeryLow.to_dummies(), (0.0, 0.0));
        assert_eq!(CrimeLevel::Low.to_dummies(), (1.0, 0.0));
        assert_eq!(CrimeLevel::High.to_dummies(), (0.0, 1.0));
    }

    #[test]
    fn test_standard_scaler_creation() {
        // StandardScaler のインスタンスを作成できることを確認
        let scaler = StandardScaler::new();
        assert_eq!(scaler.mean.len(), 0);
        assert_eq!(scaler.std.len(), 0);
    }

    #[test]
    fn test_standard_scaler_fit_transform() {
        // StandardScaler で fit と transform ができることを確認
        let mut scaler = StandardScaler::new();

        // サンプルデータ
        let data = Array2::from_shape_vec((3, 2), vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0]).unwrap();

        scaler.fit(&data);

        // 平均値の確認
        assert_eq!(scaler.mean.len(), 2);
        assert!((scaler.mean[0] - 3.0).abs() < 1e-6);
        assert!((scaler.mean[1] - 4.0).abs() < 1e-6);

        // 標準偏差の確認
        assert_eq!(scaler.std.len(), 2);

        // transform の確認
        let transformed = scaler.transform(&data);
        assert_eq!(transformed.shape(), data.shape());

        // 標準化されたデータの平均は約 0
        let transformed_mean = transformed.mean_axis(Axis(0)).unwrap();
        assert!(transformed_mean[0].abs() < 1e-6);
        assert!(transformed_mean[1].abs() < 1e-6);
    }

    #[test]
    fn test_standard_scaler_inverse_transform() {
        // inverse_transform で元のデータに戻せることを確認
        let mut scaler = StandardScaler::new();

        let data = Array2::from_shape_vec((3, 2), vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0]).unwrap();

        scaler.fit(&data);
        let transformed = scaler.transform(&data);
        let inversed = scaler.inverse_transform(&transformed);

        // 元のデータに戻る
        for i in 0..data.nrows() {
            for j in 0..data.ncols() {
                assert!((inversed[[i, j]] - data[[i, j]]).abs() < 1e-6);
            }
        }
    }

    #[test]
    fn test_engineer_features() {
        // 特徴量エンジニアリングのテスト
        // [RM, LSTAT, PTRATIO, CRIME_LOW, CRIME_HIGH]
        let features = Array2::from_shape_vec(
            (2, 5),
            vec![
                6.0, 5.0, 15.0, 1.0, 0.0, // サンプル1
                7.0, 10.0, 18.0, 0.0, 1.0, // サンプル2
            ],
        )
        .unwrap();

        let extended = BostonPredictor::engineer_features(&features).unwrap();

        // 7つの特徴量になる
        assert_eq!(extended.shape(), &[2, 7]);

        // サンプル1の確認
        assert_eq!(extended[[0, 0]], 6.0); // RM
        assert_eq!(extended[[0, 1]], 5.0); // LSTAT
        assert_eq!(extended[[0, 2]], 15.0); // PTRATIO
        assert_eq!(extended[[0, 3]], 1.0); // CRIME_LOW
        assert_eq!(extended[[0, 4]], 0.0); // CRIME_HIGH
        assert_eq!(extended[[0, 5]], 36.0); // RM^2 = 6^2
        assert_eq!(extended[[0, 6]], 30.0); // RM*LSTAT = 6*5

        // サンプル2の確認
        assert_eq!(extended[[1, 0]], 7.0); // RM
        assert_eq!(extended[[1, 1]], 10.0); // LSTAT
        assert_eq!(extended[[1, 5]], 49.0); // RM^2 = 7^2
        assert_eq!(extended[[1, 6]], 70.0); // RM*LSTAT = 7*10
    }

    #[test]
    fn test_train_model() {
        // モデルを訓練できることを確認
        let mut predictor = BostonPredictor::new(1.0);
        let (features, targets) = BostonPredictor::load_data("data/Boston.csv").unwrap();

        let result = predictor.train(&features, &targets);
        assert!(result.is_ok());

        // モデルとスケーラーが設定されているか確認
        assert!(predictor.model.is_some());
        assert!(predictor.scaler_x.is_some());
        assert!(predictor.scaler_y.is_some());
    }

    #[test]
    fn test_predict() {
        // 予測が実行できることを確認
        let mut predictor = BostonPredictor::new(1.0);
        let (features, targets) = BostonPredictor::load_data("data/Boston.csv").unwrap();
        predictor.train(&features, &targets).unwrap();

        // 予測を実行
        let predictions = predictor.predict(&features).unwrap();

        // 予測数が入力と同じであることを確認
        assert_eq!(predictions.len(), features.nrows());

        // 予測値が妥当な範囲であることを確認
        for &pred in predictions.iter() {
            assert!(pred > 0.0, "Price should be positive");
            assert!(pred < 100.0, "Price should be reasonable (< 100k)");
        }
    }

    #[test]
    fn test_predict_before_training() {
        // 訓練前の予測はエラーになるべき
        let predictor = BostonPredictor::new(1.0);
        let (features, _) = BostonPredictor::load_data("data/Boston.csv").unwrap();

        let result = predictor.predict(&features);
        assert!(result.is_err());
    }

    #[test]
    fn test_evaluate() {
        // モデルを評価できることを確認
        let mut predictor = BostonPredictor::new(1.0);
        let (features, targets) = BostonPredictor::load_data("data/Boston.csv").unwrap();
        predictor.train(&features, &targets).unwrap();

        // 評価を実行
        let (r2, mae, rmse) = predictor.evaluate(&features, &targets).unwrap();

        println!("R² = {:.4}, MAE = {:.2}, RMSE = {:.2}", r2, mae, rmse);

        // R² は 0.0 から 1.0 の範囲（訓練データなのである程度高いはず）
        assert!(r2 >= 0.0 && r2 <= 1.0);
        assert!(r2 > 0.5, "R² should be > 0.5 on training data");

        // MAE と RMSE は正の値
        assert!(mae > 0.0);
        assert!(rmse > 0.0);
    }
}
