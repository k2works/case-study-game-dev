//! API ルーティング
//!
//! エンドポイントのルーティング設定

use super::{handlers, schema::*};
use axum::{
    routing::{get, post},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

/// OpenAPI ドキュメント定義
#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::health,
        handlers::predict_iris,
        handlers::predict_cinema,
        handlers::predict_survived,
        handlers::predict_boston,
    ),
    components(
        schemas(
            HealthResponse,
            IrisRequest, IrisResponse,
            CinemaRequest, CinemaResponse,
            SurvivedRequest, SurvivedResponse,
            BostonRequest, BostonResponse,
            ErrorResponse
        )
    ),
    tags(
        (name = "Health", description = "ヘルスチェック API"),
        (name = "Prediction", description = "機械学習予測 API")
    ),
    info(
        title = "Machine Learning API",
        version = "0.1.0",
        description = "Rust で実装した機械学習 Web API\n\n4つの機械学習モデルを提供しています：\n- Iris 分類（Decision Tree）\n- Cinema 興行収入予測（Linear Regression）\n- Survived 生存予測（Decision Tree）\n- Boston 住宅価格予測（Linear Regression）",
        contact(
            name = "ML TDD Rust Project",
        )
    )
)]
pub struct ApiDoc;

/// API ルーターを作成
pub fn create_router() -> Router {
    // CORS 設定
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        // Swagger UI
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        // ヘルスチェック
        .route("/health", get(handlers::health))
        // 予測エンドポイント
        .route("/predict/iris", post(handlers::predict_iris))
        .route("/predict/cinema", post(handlers::predict_cinema))
        .route("/predict/survived", post(handlers::predict_survived))
        .route("/predict/boston", post(handlers::predict_boston))
        // CORS を適用
        .layer(cors)
}
