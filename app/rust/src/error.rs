//! エラー型定義

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
}

// linfa のエラーを Error に変換
impl From<linfa::error::Error> for Error {
    fn from(err: linfa::error::Error) -> Self {
        Error::Linfa(err.to_string())
    }
}
