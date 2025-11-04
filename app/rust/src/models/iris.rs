//! Iris 分類モデル

use crate::{Error, Result};
use linfa::prelude::*;
use linfa_trees::DecisionTree;
use ndarray::{Array1, Array2};
use std::path::Path;

/// Iris 分類器
pub struct IrisClassifier {
    model: Option<DecisionTree<f64, usize>>,
}

impl IrisClassifier {
    /// 新しい IrisClassifier を作成
    pub fn new() -> Self {
        Self { model: None }
    }

    /// CSV ファイルからデータを読み込む
    pub fn load_data(&self, path: &Path) -> Result<(Array2<f64>, Array1<usize>)> {
        let mut reader = csv::Reader::from_path(path)?;
        let mut features = Vec::new();
        let mut targets = Vec::new();

        for result in reader.records() {
            let record = result?;

            // 特徴量（4つ）を読み込む
            let sepal_length: f64 = record[0].parse().map_err(|_| {
                Error::Model("Failed to parse sepal_length".to_string())
            })?;
            let sepal_width: f64 = record[1].parse().map_err(|_| {
                Error::Model("Failed to parse sepal_width".to_string())
            })?;
            let petal_length: f64 = record[2].parse().map_err(|_| {
                Error::Model("Failed to parse petal_length".to_string())
            })?;
            let petal_width: f64 = record[3].parse().map_err(|_| {
                Error::Model("Failed to parse petal_width".to_string())
            })?;

            features.extend_from_slice(&[sepal_length, sepal_width, petal_length, petal_width]);

            // ターゲット（種類）をエンコード
            let species = &record[4];
            let encoded = Self::encode_species(species)?;
            targets.push(encoded);
        }

        let n_samples = targets.len();
        let features_array = Array2::from_shape_vec((n_samples, 4), features)
            .map_err(|e| Error::Model(format!("Failed to create features array: {}", e)))?;
        let targets_array = Array1::from_vec(targets);

        Ok((features_array, targets_array))
    }

    /// 種類名を数値にエンコード
    pub fn encode_species(species: &str) -> Result<usize> {
        match species {
            "setosa" => Ok(0),
            "versicolor" => Ok(1),
            "virginica" => Ok(2),
            _ => Err(Error::UnknownSpecies(species.to_string())),
        }
    }

    /// 数値を種類名にデコード
    pub fn decode_species(encoded: usize) -> Result<String> {
        match encoded {
            0 => Ok("setosa".to_string()),
            1 => Ok("versicolor".to_string()),
            2 => Ok("virginica".to_string()),
            _ => Err(Error::InvalidEncoded(encoded)),
        }
    }

    /// モデルをトレーニング
    pub fn train(&mut self, features: &Array2<f64>, targets: &Array1<usize>) -> Result<()> {
        // Dataset を作成
        let dataset = Dataset::new(features.clone(), targets.clone())
            .with_feature_names(vec!["sepal_length", "sepal_width", "petal_length", "petal_width"]);

        // Decision Tree でトレーニング
        let model = DecisionTree::params()
            .max_depth(Some(5))
            .fit(&dataset)?;

        self.model = Some(model);
        Ok(())
    }

    /// 予測を実行
    pub fn predict(&self, features: &Array2<f64>) -> Result<Array1<usize>> {
        let model = self
            .model
            .as_ref()
            .ok_or_else(|| Error::Model("Model not trained".to_string()))?;

        let predictions = model.predict(features);
        Ok(predictions)
    }

    /// モデルの精度を評価
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

impl Default for IrisClassifier {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn test_new() {
        let classifier = IrisClassifier::new();
        assert!(classifier.model.is_none());
    }

    #[test]
    fn test_encode_species() {
        assert_eq!(IrisClassifier::encode_species("setosa").unwrap(), 0);
        assert_eq!(IrisClassifier::encode_species("versicolor").unwrap(), 1);
        assert_eq!(IrisClassifier::encode_species("virginica").unwrap(), 2);
    }

    #[test]
    fn test_encode_species_unknown() {
        let result = IrisClassifier::encode_species("unknown");
        assert!(result.is_err());
    }

    #[test]
    fn test_decode_species() {
        assert_eq!(IrisClassifier::decode_species(0).unwrap(), "setosa");
        assert_eq!(IrisClassifier::decode_species(1).unwrap(), "versicolor");
        assert_eq!(IrisClassifier::decode_species(2).unwrap(), "virginica");
    }

    #[test]
    fn test_decode_species_invalid() {
        let result = IrisClassifier::decode_species(999);
        assert!(result.is_err());
    }

    #[test]
    fn test_load_data() {
        let classifier = IrisClassifier::new();
        let path = PathBuf::from("data/iris.csv");

        let result = classifier.load_data(&path);
        assert!(result.is_ok());

        let (features, targets) = result.unwrap();
        assert_eq!(features.nrows(), 150); // Iris データセットは 150 行
        assert_eq!(features.ncols(), 4); // 4 つの特徴量
        assert_eq!(targets.len(), 150);
    }

    #[test]
    fn test_train_and_predict() {
        let mut classifier = IrisClassifier::new();
        let path = PathBuf::from("data/iris.csv");

        // データを読み込む
        let (features, targets) = classifier.load_data(&path).unwrap();

        // トレーニング
        let result = classifier.train(&features, &targets);
        assert!(result.is_ok());
        assert!(classifier.model.is_some());

        // 予測
        let predictions = classifier.predict(&features).unwrap();
        assert_eq!(predictions.len(), targets.len());
    }

    #[test]
    fn test_evaluate() {
        let mut classifier = IrisClassifier::new();
        let path = PathBuf::from("data/iris.csv");

        // データを読み込む
        let (features, targets) = classifier.load_data(&path).unwrap();

        // トレーニング
        classifier.train(&features, &targets).unwrap();

        // 評価
        let accuracy = classifier.evaluate(&features, &targets).unwrap();
        assert!(accuracy > 0.9); // 精度は 90% 以上であることを期待
        println!("Accuracy: {:.2}%", accuracy * 100.0);
    }

    #[test]
    fn test_predict_without_training() {
        let classifier = IrisClassifier::new();
        let features = Array2::zeros((1, 4));

        let result = classifier.predict(&features);
        assert!(result.is_err());
    }
}
