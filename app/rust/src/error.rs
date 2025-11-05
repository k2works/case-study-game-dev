//! エラー型定義

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Error, Debug)]
pub enum Error {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("CSV error: {0}")]
    Csv(#[from] csv::Error),

    #[error("Model error: {0}")]
    Model(String),

    #[error("Unknown species: {0}")]
    UnknownSpecies(String),

    #[error("Invalid encoded value: {0}")]
    InvalidEncoded(usize),

    #[error("Linfa error: {0}")]
    Linfa(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Internal server error: {0}")]
    InternalServer(String),
}

// linfa のエラーを Error に変換
impl From<linfa::error::Error> for Error {
    fn from(err: linfa::error::Error) -> Self {
        Error::Linfa(err.to_string())
    }
}

// validator のエラーを Error に変換
impl From<validator::ValidationErrors> for Error {
    fn from(err: validator::ValidationErrors) -> Self {
        Error::Validation(err.to_string())
    }
}

// Axum の IntoResponse トレイトを実装
impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let (status, error_type, message) = match self {
            Error::Validation(msg) => (StatusCode::BAD_REQUEST, "ValidationError", msg),
            Error::NotFound(msg) => (StatusCode::NOT_FOUND, "NotFound", msg),
            Error::Model(msg) | Error::Linfa(msg) => {
                (StatusCode::INTERNAL_SERVER_ERROR, "ModelError", msg)
            }
            Error::UnknownSpecies(msg) => (StatusCode::BAD_REQUEST, "UnknownSpecies", msg),
            Error::InvalidEncoded(val) => (
                StatusCode::BAD_REQUEST,
                "InvalidEncoded",
                format!("Invalid encoded value: {val}"),
            ),
            Error::InternalServer(msg) => (StatusCode::INTERNAL_SERVER_ERROR, "InternalError", msg),
            Error::Io(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "IOError",
                err.to_string(),
            ),
            Error::Csv(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "CSVError",
                err.to_string(),
            ),
        };

        let body = Json(json!({
            "error": error_type,
            "message": message,
        }));

        (status, body).into_response()
    }
}
