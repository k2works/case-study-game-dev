//! API スキーマ定義
//!
//! リクエスト・レスポンスの型定義とバリデーション

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use validator::Validate;

/// Iris 分類のリクエスト
#[derive(Debug, Clone, Deserialize, Serialize, Validate, ToSchema)]
pub struct IrisRequest {
    #[validate(range(min = 0.0, max = 10.0))]
    pub sepal_length: f64,
    #[validate(range(min = 0.0, max = 10.0))]
    pub sepal_width: f64,
    #[validate(range(min = 0.0, max = 10.0))]
    pub petal_length: f64,
    #[validate(range(min = 0.0, max = 10.0))]
    pub petal_width: f64,
}

/// Iris 分類のレスポンス
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct IrisResponse {
    pub species: String,
    pub confidence: f64,
}

/// Cinema 売上予測のリクエスト
#[derive(Debug, Clone, Deserialize, Serialize, Validate, ToSchema)]
pub struct CinemaRequest {
    #[validate(range(min = 0))]
    pub sns1: i32,
    #[validate(range(min = 0))]
    pub sns2: i32,
    #[validate(range(min = 0, max = 100))]
    pub actor: i32,
    #[validate(range(min = 0, max = 1))]
    pub original: i32,
}

/// Cinema 売上予測のレスポンス
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct CinemaResponse {
    pub revenue: f64,
    pub unit: String,
}

/// Survived 生存予測のリクエスト
#[derive(Debug, Clone, Deserialize, Serialize, Validate, ToSchema)]
pub struct SurvivedRequest {
    #[validate(range(min = 1, max = 3))]
    pub pclass: i32,
    #[validate(range(min = 0.0, max = 120.0))]
    pub age: f64,
    #[validate(range(min = 0, max = 10))]
    pub sibsp: i32,
    #[validate(range(min = 0, max = 10))]
    pub parch: i32,
    #[validate(range(min = 0.0))]
    pub fare: f64,
    #[validate(length(min = 1))]
    pub sex: String,
}

/// Survived 生存予測のレスポンス
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct SurvivedResponse {
    pub survived: bool,
    pub probability: f64,
}

/// Boston 住宅価格予測のリクエスト
#[derive(Debug, Clone, Deserialize, Serialize, Validate, ToSchema)]
pub struct BostonRequest {
    #[validate(range(min = 0.0, max = 20.0))]
    pub rm: f64,
    #[validate(range(min = 0.0, max = 100.0))]
    pub lstat: f64,
    #[validate(range(min = 0.0, max = 50.0))]
    pub ptratio: f64,
    #[validate(length(min = 1))]
    pub crime: String,
}

/// Boston 住宅価格予測のレスポンス
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct BostonResponse {
    pub price: f64,
    pub unit: String,
}

/// ヘルスチェックレスポンス
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
    pub models: Vec<String>,
}

/// エラーレスポンス
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_iris_request_valid() {
        let json_data = json!({
            "sepal_length": 5.1,
            "sepal_width": 3.5,
            "petal_length": 1.4,
            "petal_width": 0.2
        });

        let request: IrisRequest = serde_json::from_value(json_data).unwrap();
        assert!(request.validate().is_ok());
        assert_eq!(request.sepal_length, 5.1);
        assert_eq!(request.sepal_width, 3.5);
    }

    #[test]
    fn test_iris_request_negative_value() {
        let json_data = json!({
            "sepal_length": -1.0,
            "sepal_width": 3.5,
            "petal_length": 1.4,
            "petal_width": 0.2
        });

        let request: IrisRequest = serde_json::from_value(json_data).unwrap();
        assert!(request.validate().is_err());
    }

    #[test]
    fn test_cinema_request_valid() {
        let json_data = json!({
            "sns1": 500,
            "sns2": 300,
            "actor": 70,
            "original": 1
        });

        let request: CinemaRequest = serde_json::from_value(json_data).unwrap();
        assert!(request.validate().is_ok());
        assert_eq!(request.sns1, 500);
    }

    #[test]
    fn test_survived_request_valid() {
        let json_data = json!({
            "pclass": 3,
            "age": 22.0,
            "sibsp": 1,
            "parch": 0,
            "fare": 7.25,
            "sex": "male"
        });

        let request: SurvivedRequest = serde_json::from_value(json_data).unwrap();
        assert!(request.validate().is_ok());
        assert_eq!(request.pclass, 3);
    }

    #[test]
    fn test_boston_request_valid() {
        let json_data = json!({
            "rm": 6.5,
            "lstat": 4.98,
            "ptratio": 15.3,
            "crime": "low"
        });

        let request: BostonRequest = serde_json::from_value(json_data).unwrap();
        assert!(request.validate().is_ok());
        assert_eq!(request.rm, 6.5);
    }
}
