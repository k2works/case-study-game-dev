//! Machine Learning API Server
//!
//! Axum による機械学習 Web API サーバー

use ml_tdd_rust::api::routes;
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    // ロギング設定
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "ml_tdd_rust=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // ルーター作成
    let app = routes::create_router();

    // アドレス設定
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::info!("Machine Learning API サーバー起動: http://{}", addr);
    tracing::info!("Swagger UI: http://{}/swagger-ui", addr);
    tracing::info!("OpenAPI Spec: http://{}/api-docs/openapi.json", addr);
    tracing::info!("ヘルスチェック: http://{}/health", addr);
    tracing::info!("Iris 分類: POST http://{}/predict/iris", addr);
    tracing::info!("Cinema 予測: POST http://{}/predict/cinema", addr);
    tracing::info!("Survived 予測: POST http://{}/predict/survived", addr);
    tracing::info!("Boston 予測: POST http://{}/predict/boston", addr);

    // サーバー起動
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
