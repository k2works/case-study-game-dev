//! API ハンドラ
//!
//! 各エンドポイントのハンドラ関数を提供

use super::schema::*;
use crate::error::Result;
use crate::models::{boston::BostonPredictor, cinema::CinemaPredictor, iris::IrisClassifier, survived::SurvivedClassifier};
use axum::{extract::Json, http::StatusCode};
use ndarray::Array2;
use validator::Validate;

/// ヘルスチェック
#[utoipa::path(
    get,
    path = "/health",
    responses(
        (status = 200, description = "API ヘルスチェック成功", body = HealthResponse)
    ),
    tag = "Health"
)]
pub async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "OK".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        models: vec![
            "iris".to_string(),
            "cinema".to_string(),
            "survived".to_string(),
            "boston".to_string(),
        ],
    })
}

/// Iris 分類エンドポイント
#[utoipa::path(
    post,
    path = "/predict/iris",
    request_body = IrisRequest,
    responses(
        (status = 200, description = "Iris 品種の分類成功", body = IrisResponse),
        (status = 400, description = "バリデーションエラー", body = ErrorResponse),
        (status = 500, description = "内部サーバーエラー", body = ErrorResponse)
    ),
    tag = "Prediction"
)]
pub async fn predict_iris(
    Json(payload): Json<IrisRequest>,
) -> Result<(StatusCode, Json<IrisResponse>)> {
    // バリデーション
    payload.validate()?;

    // 特徴量を準備
    let features = Array2::from_shape_vec(
        (1, 4),
        vec![
            payload.sepal_length,
            payload.sepal_width,
            payload.petal_length,
            payload.petal_width,
        ],
    )
    .map_err(|e| crate::error::Error::Model(format!("Failed to create feature array: {e}")))?;

    // モデルで予測（簡易実装：毎回訓練）
    let classifier_loader = IrisClassifier::new();
    let (train_features, train_targets) = classifier_loader.load_data(std::path::Path::new("data/iris.csv"))?;

    let mut classifier = IrisClassifier::new();
    classifier.train(&train_features, &train_targets)?;

    let predictions = classifier.predict(&features)?;
    let species = IrisClassifier::decode_species(predictions[0])?;

    // 信頼度は固定値（実際のモデルでは確率を返す）
    let confidence = 0.95;

    Ok((
        StatusCode::OK,
        Json(IrisResponse {
            species,
            confidence,
        }),
    ))
}

/// Cinema 売上予測エンドポイント
#[utoipa::path(
    post,
    path = "/predict/cinema",
    request_body = CinemaRequest,
    responses(
        (status = 200, description = "Cinema 興行収入予測成功", body = CinemaResponse),
        (status = 400, description = "バリデーションエラー", body = ErrorResponse),
        (status = 500, description = "内部サーバーエラー", body = ErrorResponse)
    ),
    tag = "Prediction"
)]
pub async fn predict_cinema(
    Json(payload): Json<CinemaRequest>,
) -> Result<(StatusCode, Json<CinemaResponse>)> {
    // バリデーション
    payload.validate()?;

    // 特徴量を準備
    let features = Array2::from_shape_vec(
        (1, 4),
        vec![
            payload.sns1 as f64,
            payload.sns2 as f64,
            payload.actor as f64,
            payload.original as f64,
        ],
    )
    .map_err(|e| crate::error::Error::Model(format!("Failed to create feature array: {e}")))?;

    // モデルで予測（簡易実装：毎回訓練）
    let (train_features, train_targets) = CinemaPredictor::load_data("data/cinema.csv")?;
    let mut predictor = CinemaPredictor::new();
    predictor.train(&train_features, &train_targets)?;

    let predictions = predictor.predict(&features)?;
    let revenue = predictions[0];

    Ok((
        StatusCode::OK,
        Json(CinemaResponse {
            revenue,
            unit: "百万円".to_string(),
        }),
    ))
}

/// Survived 生存予測エンドポイント
#[utoipa::path(
    post,
    path = "/predict/survived",
    request_body = SurvivedRequest,
    responses(
        (status = 200, description = "Survived 生存予測成功", body = SurvivedResponse),
        (status = 400, description = "バリデーションエラー", body = ErrorResponse),
        (status = 500, description = "内部サーバーエラー", body = ErrorResponse)
    ),
    tag = "Prediction"
)]
pub async fn predict_survived(
    Json(payload): Json<SurvivedRequest>,
) -> Result<(StatusCode, Json<SurvivedResponse>)> {
    // バリデーション
    payload.validate()?;

    // Sex を数値化
    let sex_encoded = match payload.sex.to_lowercase().as_str() {
        "male" => 1.0,
        "female" => 0.0,
        _ => {
            return Err(crate::error::Error::Validation(
                "sex must be 'male' or 'female'".to_string(),
            ))
        }
    };

    // 特徴量を準備
    let features = Array2::from_shape_vec(
        (1, 6),
        vec![
            payload.pclass as f64,
            sex_encoded,
            payload.age,
            payload.sibsp as f64,
            payload.parch as f64,
            payload.fare,
        ],
    )
    .map_err(|e| crate::error::Error::Model(format!("Failed to create feature array: {e}")))?;

    // モデルで予測（簡易実装：毎回訓練）
    let mut classifier = SurvivedClassifier::new(9);
    let (train_features, train_targets) = SurvivedClassifier::load_data("data/Survived.csv")?;
    classifier.train(&train_features, &train_targets)?;

    let predictions = classifier.predict(&features)?;
    let survived = predictions[0] == 1;

    // 確率は固定値（実際のモデルでは確率を返す）
    let probability = if survived { 0.75 } else { 0.25 };

    Ok((
        StatusCode::OK,
        Json(SurvivedResponse {
            survived,
            probability,
        }),
    ))
}

/// Boston 住宅価格予測エンドポイント
#[utoipa::path(
    post,
    path = "/predict/boston",
    request_body = BostonRequest,
    responses(
        (status = 200, description = "Boston 住宅価格予測成功", body = BostonResponse),
        (status = 400, description = "バリデーションエラー", body = ErrorResponse),
        (status = 500, description = "内部サーバーエラー", body = ErrorResponse)
    ),
    tag = "Prediction"
)]
pub async fn predict_boston(
    Json(payload): Json<BostonRequest>,
) -> Result<(StatusCode, Json<BostonResponse>)> {
    // バリデーション
    payload.validate()?;

    // CRIME をダミー変数化
    let (crime_low, crime_high) = match payload.crime.to_lowercase().as_str() {
        "very_low" => (0.0, 0.0),
        "low" => (1.0, 0.0),
        "high" => (0.0, 1.0),
        _ => {
            return Err(crate::error::Error::Validation(
                "crime must be 'very_low', 'low', or 'high'".to_string(),
            ))
        }
    };

    // 特徴量を準備（5つの基本特徴量）
    let features = Array2::from_shape_vec(
        (1, 5),
        vec![payload.rm, payload.lstat, payload.ptratio, crime_low, crime_high],
    )
    .map_err(|e| crate::error::Error::Model(format!("Failed to create feature array: {e}")))?;

    // モデルで予測（簡易実装：毎回訓練）
    let mut predictor = BostonPredictor::new(1.0);
    let (train_features, train_targets) = BostonPredictor::load_data("data/Boston.csv")?;
    predictor.train(&train_features, &train_targets)?;

    let predictions = predictor.predict(&features)?;
    let price = predictions[0];

    Ok((
        StatusCode::OK,
        Json(BostonResponse {
            price,
            unit: "千ドル".to_string(),
        }),
    ))
}
