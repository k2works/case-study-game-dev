//! Survived 生存予測モデル
//!
//! Decision Tree を使用して、タイタニック号の乗客の生存を予測します。

use crate::error::{Error, Result};
use linfa::prelude::*;
use linfa_trees::DecisionTree;
use ndarray::prelude::*;
use std::path::Path;

/// Survived 生存予測器
pub struct SurvivedClassifier {
    max_depth: usize,
    model: Option<DecisionTree<f64, usize>>,
}

impl SurvivedClassifier {
    /// 新しい `SurvivedClassifier` を作成
    #[must_use]
    pub fn new(max_depth: usize) -> Self {
        Self {
            max_depth,
            model: None,
        }
    }

    /// CSV ファイルからデータを読み込む
    ///
    /// 欠損値は各列の平均値で補完されます。
    /// Sex（性別）は male=1.0, female=0.0 にエンコードされます。
    pub fn load_data<P: AsRef<Path>>(path: P) -> Result<(Array2<f64>, Array1<usize>)> {
        let mut reader = csv::Reader::from_path(path)?;

        let mut pclass_values = Vec::new();
        let mut sex_values = Vec::new();
        let mut age_values = Vec::new();
        let mut sibsp_values = Vec::new();
        let mut parch_values = Vec::new();
        let mut fare_values = Vec::new();
        let mut survived_values = Vec::new();

        // データを読み込む（欠損値は後で補完）
        for result in reader.records() {
            let record = result?;

            // PassengerId は 0, Survived は 1, Pclass は 2
            let survived = record[1].parse::<i32>().ok();
            let pclass = record[2].parse::<i32>().ok();
            let sex = &record[3];
            let age = record[4].parse::<f64>().ok();
            let sibsp = record[5].parse::<i32>().ok();
            let parch = record[6].parse::<i32>().ok();
            // Ticket は 7, Fare は 8
            let fare = record[8].parse::<f64>().ok();

            pclass_values.push(pclass);
            sex_values.push(sex.to_string());
            age_values.push(age);
            sibsp_values.push(sibsp);
            parch_values.push(parch);
            fare_values.push(fare);
            if let Some(s) = survived {
                survived_values.push(s);
            }
        }

        // 各列の平均値を計算（欠損値を除く）
        let age_mean = Self::calculate_mean_f64(&age_values);
        let fare_mean = Self::calculate_mean_f64(&fare_values);

        // 欠損値を平均値で補完
        let pclass_filled: Vec<f64> = pclass_values
            .iter()
            .map(|v| v.map(f64::from).unwrap_or(2.0))
            .collect();
        let sex_filled: Vec<f64> = sex_values.iter().map(|s| Self::encode_sex(s)).collect();
        let age_filled: Vec<f64> = age_values.iter().map(|v| v.unwrap_or(age_mean)).collect();
        let sibsp_filled: Vec<f64> = sibsp_values
            .iter()
            .map(|v| v.map(f64::from).unwrap_or(0.0))
            .collect();
        let parch_filled: Vec<f64> = parch_values
            .iter()
            .map(|v| v.map(f64::from).unwrap_or(0.0))
            .collect();
        let fare_filled: Vec<f64> = fare_values.iter().map(|v| v.unwrap_or(fare_mean)).collect();

        let n_samples = pclass_filled.len();

        // 特徴量行列を作成（6つの特徴量: Pclass, Sex, Age, SibSp, Parch, Fare）
        let mut features = Vec::with_capacity(n_samples * 6);
        for i in 0..n_samples {
            features.push(pclass_filled[i]);
            features.push(sex_filled[i]);
            features.push(age_filled[i]);
            features.push(sibsp_filled[i]);
            features.push(parch_filled[i]);
            features.push(fare_filled[i]);
        }

        let features_array = Array2::from_shape_vec((n_samples, 6), features)
            .map_err(|e| Error::Model(format!("Failed to create feature array: {e}")))?;

        let targets_array =
            Array1::from_vec(survived_values.iter().map(|&x| x as usize).collect());

        Ok((features_array, targets_array))
    }

    /// 性別を数値にエンコード（male=1.0, female=0.0）
    fn encode_sex(sex: &str) -> f64 {
        match sex.trim().to_lowercase().as_str() {
            "male" => 1.0,
            "female" => 0.0,
            _ => 1.0, // デフォルトは male
        }
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

    /// モデルを訓練
    pub fn train(&mut self, features: &Array2<f64>, targets: &Array1<usize>) -> Result<()> {
        // linfa の Dataset を作成
        let dataset = Dataset::new(features.clone(), targets.clone()).with_feature_names(vec![
            "pclass", "sex", "age", "sibsp", "parch", "fare",
        ]);

        // Decision Tree モデルを訓練
        let model = DecisionTree::params()
            .max_depth(Some(self.max_depth))
            .fit(&dataset)
            .map_err(|e| Error::Linfa(format!("Failed to train model: {e}")))?;

        self.model = Some(model);
        Ok(())
    }

    /// 生存を予測
    pub fn predict(&self, features: &Array2<f64>) -> Result<Array1<usize>> {
        let model = self
            .model
            .as_ref()
            .ok_or_else(|| Error::Model("Model not trained yet".to_string()))?;

        let predictions = model.predict(features);
        Ok(predictions)
    }

    /// モデルの精度を評価
    #[allow(clippy::cast_precision_loss)]
    pub fn evaluate(&self, features: &Array2<f64>, targets: &Array1<usize>) -> Result<f64> {
        let predictions = self.predict(features)?;

        let correct = predictions
            .iter()
            .zip(targets.iter())
            .filter(|(pred, target)| pred == target)
            .count();

        let accuracy = correct as f64 / targets.len() as f64;
        Ok(accuracy)
    }
}

impl Default for SurvivedClassifier {
    fn default() -> Self {
        Self::new(9)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_survived_classifier_creation() {
        // SurvivedClassifier のインスタンスを作成できることを確認
        let classifier = SurvivedClassifier::new(9);
        assert!(classifier.model.is_none());
        assert_eq!(classifier.max_depth, 9);
    }

    #[test]
    fn test_custom_max_depth() {
        // カスタムの max_depth を設定できることを確認
        let classifier = SurvivedClassifier::new(5);
        assert_eq!(classifier.max_depth, 5);
    }

    #[test]
    fn test_load_data_from_csv() {
        // CSV ファイルからデータを読み込む
        let result = SurvivedClassifier::load_data("data/Survived.csv");
        assert!(result.is_ok());

        let (features, targets) = result.unwrap();

        // 特徴量の確認（6列: Pclass, Sex, Age, SibSp, Parch, Fare）
        assert_eq!(features.shape()[1], 6);
        assert!(features.shape()[0] > 0);

        // ターゲットの確認（0 または 1）
        for &target in targets.iter() {
            assert!(target == 0 || target == 1);
        }
    }

    #[test]
    fn test_no_nan_values() {
        // 欠損値が補完されていることを確認
        let result = SurvivedClassifier::load_data("data/Survived.csv");
        assert!(result.is_ok());

        let (features, _) = result.unwrap();

        // 特徴量に NaN がないことを確認
        for row in features.rows() {
            for &value in row.iter() {
                assert!(!value.is_nan(), "Found NaN value in features");
            }
        }
    }

    #[test]
    fn test_train_model() {
        // モデルを訓練できることを確認
        let mut classifier = SurvivedClassifier::new(9);
        let (features, targets) = SurvivedClassifier::load_data("data/Survived.csv").unwrap();

        let result = classifier.train(&features, &targets);
        assert!(result.is_ok());

        // モデルが設定されているか確認
        assert!(classifier.model.is_some());
    }

    #[test]
    fn test_predict() {
        // 予測が実行できることを確認
        let mut classifier = SurvivedClassifier::new(9);
        let (features, targets) = SurvivedClassifier::load_data("data/Survived.csv").unwrap();
        classifier.train(&features, &targets).unwrap();

        // 予測を実行
        let predictions = classifier.predict(&features).unwrap();

        // 予測数が入力と同じであることを確認
        assert_eq!(predictions.len(), features.nrows());

        // 予測値が 0 または 1 であることを確認
        for &pred in predictions.iter() {
            assert!(pred == 0 || pred == 1);
        }
    }

    #[test]
    fn test_predict_before_training() {
        // 訓練前の予測はエラーになるべき
        let classifier = SurvivedClassifier::new(9);
        let (features, _) = SurvivedClassifier::load_data("data/Survived.csv").unwrap();

        let result = classifier.predict(&features);
        assert!(result.is_err());
    }

    #[test]
    fn test_evaluate() {
        // モデルを評価できることを確認
        let mut classifier = SurvivedClassifier::new(9);
        let (features, targets) = SurvivedClassifier::load_data("data/Survived.csv").unwrap();
        classifier.train(&features, &targets).unwrap();

        // 評価を実行
        let accuracy = classifier.evaluate(&features, &targets).unwrap();

        // 精度は 0.0 から 1.0 の範囲
        assert!(accuracy >= 0.0 && accuracy <= 1.0);
        // 訓練データなので、ある程度の精度を期待
        assert!(accuracy > 0.5, "Accuracy should be > 0.5, found: {}", accuracy);
    }
}
