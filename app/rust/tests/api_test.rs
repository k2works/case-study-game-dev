//! API 統合テスト
//!
//! Web API エンドポイントの統合テスト

use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use http_body_util::BodyExt;
use ml_tdd_rust::api::routes;
use serde_json::json;
use tower::util::ServiceExt;

/// レスポンスボディを JSON に変換するヘルパー関数
async fn body_to_json(body: Body) -> serde_json::Value {
    let bytes = body.collect().await.unwrap().to_bytes();
    serde_json::from_slice(&bytes).unwrap()
}

#[tokio::test]
async fn test_health_check() {
    // ルーターを作成
    let app = routes::create_router();

    // リクエストを作成
    let request = Request::builder()
        .uri("/health")
        .body(Body::empty())
        .unwrap();

    // リクエストを送信
    let response = app.oneshot(request).await.unwrap();

    // ステータスコードを確認
    assert_eq!(response.status(), StatusCode::OK);

    // レスポンスボディを確認
    let body = body_to_json(response.into_body()).await;

    assert_eq!(body["status"], "OK");
    assert_eq!(body["version"], env!("CARGO_PKG_VERSION"));
    assert!(body["models"].is_array());

    let models = body["models"].as_array().unwrap();
    assert_eq!(models.len(), 4);
    assert!(models.contains(&json!("iris")));
    assert!(models.contains(&json!("cinema")));
    assert!(models.contains(&json!("survived")));
    assert!(models.contains(&json!("boston")));
}

#[tokio::test]
async fn test_predict_iris_success() {
    let app = routes::create_router();

    // 正常なリクエストペイロード
    let payload = json!({
        "sepal_length": 5.1,
        "sepal_width": 3.5,
        "petal_length": 1.4,
        "petal_width": 0.2
    });

    let request = Request::builder()
        .uri("/predict/iris")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&payload).unwrap()))
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = body_to_json(response.into_body()).await;

    // species フィールドが存在することを確認
    assert!(body["species"].is_string());
    let species = body["species"].as_str().unwrap();
    assert!(
        species == "setosa" || species == "versicolor" || species == "virginica",
        "Invalid species: {}",
        species
    );

    // confidence フィールドが存在することを確認
    assert!(body["confidence"].is_number());
    let confidence = body["confidence"].as_f64().unwrap();
    assert!(confidence >= 0.0 && confidence <= 1.0);
}

#[tokio::test]
async fn test_predict_iris_validation_error() {
    let app = routes::create_router();

    // バリデーションエラーになるペイロード（範囲外の値）
    let payload = json!({
        "sepal_length": 100.0,  // 範囲外 (max 10.0)
        "sepal_width": 3.5,
        "petal_length": 1.4,
        "petal_width": 0.2
    });

    let request = Request::builder()
        .uri("/predict/iris")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&payload).unwrap()))
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);

    let body = body_to_json(response.into_body()).await;

    // エラーレスポンスの形式を確認
    assert!(body["error"].is_string());
    assert_eq!(body["error"], "ValidationError");
    assert!(body["message"].is_string());
}

#[tokio::test]
async fn test_predict_cinema_success() {
    let app = routes::create_router();

    let payload = json!({
        "sns1": 50,
        "sns2": 30,
        "actor": 70,
        "original": 1
    });

    let request = Request::builder()
        .uri("/predict/cinema")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&payload).unwrap()))
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = body_to_json(response.into_body()).await;

    // revenue フィールドが存在することを確認
    assert!(body["revenue"].is_number());
    let revenue = body["revenue"].as_f64().unwrap();
    assert!(revenue > 0.0, "Revenue should be positive");

    // unit フィールドが存在することを確認
    assert_eq!(body["unit"], "百万円");
}

#[tokio::test]
async fn test_predict_survived_success() {
    let app = routes::create_router();

    let payload = json!({
        "pclass": 1,
        "sex": "female",
        "age": 29.0,
        "sibsp": 0,
        "parch": 0,
        "fare": 211.3375
    });

    let request = Request::builder()
        .uri("/predict/survived")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&payload).unwrap()))
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = body_to_json(response.into_body()).await;

    // survived フィールドが存在することを確認
    assert!(body["survived"].is_boolean());

    // probability フィールドが存在することを確認
    assert!(body["probability"].is_number());
    let probability = body["probability"].as_f64().unwrap();
    assert!(probability >= 0.0 && probability <= 1.0);
}

#[tokio::test]
async fn test_predict_survived_invalid_sex() {
    let app = routes::create_router();

    let payload = json!({
        "pclass": 1,
        "sex": "invalid",  // 無効な性別
        "age": 29.0,
        "sibsp": 0,
        "parch": 0,
        "fare": 211.3375
    });

    let request = Request::builder()
        .uri("/predict/survived")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&payload).unwrap()))
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    // バリデーションエラーまたは内部エラー
    assert!(
        response.status() == StatusCode::BAD_REQUEST
            || response.status() == StatusCode::INTERNAL_SERVER_ERROR
    );
}

#[tokio::test]
async fn test_predict_boston_success() {
    let app = routes::create_router();

    let payload = json!({
        "rm": 6.575,
        "lstat": 4.98,
        "ptratio": 15.3,
        "crime": "low"
    });

    let request = Request::builder()
        .uri("/predict/boston")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&payload).unwrap()))
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = body_to_json(response.into_body()).await;

    // price フィールドが存在することを確認
    assert!(body["price"].is_number());
    let price = body["price"].as_f64().unwrap();
    assert!(price > 0.0, "Price should be positive");

    // unit フィールドが存在することを確認
    assert_eq!(body["unit"], "千ドル");
}

#[tokio::test]
async fn test_predict_boston_invalid_crime() {
    let app = routes::create_router();

    let payload = json!({
        "rm": 6.575,
        "lstat": 4.98,
        "ptratio": 15.3,
        "crime": "invalid"  // 無効な犯罪率カテゴリ
    });

    let request = Request::builder()
        .uri("/predict/boston")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_string(&payload).unwrap()))
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    // バリデーションエラーまたは内部エラー
    assert!(
        response.status() == StatusCode::BAD_REQUEST
            || response.status() == StatusCode::INTERNAL_SERVER_ERROR
    );
}

#[tokio::test]
async fn test_predict_boston_all_crime_levels() {
    // 全ての犯罪率カテゴリをテスト
    for crime_level in &["very_low", "low", "high"] {
        let app = routes::create_router();

        let payload = json!({
            "rm": 6.575,
            "lstat": 4.98,
            "ptratio": 15.3,
            "crime": crime_level
        });

        let request = Request::builder()
            .uri("/predict/boston")
            .method("POST")
            .header("content-type", "application/json")
            .body(Body::from(serde_json::to_string(&payload).unwrap()))
            .unwrap();

        let response = app.oneshot(request).await.unwrap();

        assert_eq!(
            response.status(),
            StatusCode::OK,
            "Failed for crime level: {}",
            crime_level
        );
    }
}
