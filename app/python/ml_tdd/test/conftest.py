"""pytest の共通設定とフィクスチャ."""

import pytest
from fastapi.testclient import TestClient

from api.application import app


@pytest.fixture
def client():
    """TestClient フィクスチャ.

    各テストで FastAPI アプリケーションのテストクライアントを提供します。
    """
    return TestClient(app)


@pytest.fixture
def iris_sample_data():
    """Iris テスト用サンプルデータ."""
    return {
        "sepal_length": 5.1,
        "sepal_width": 3.5,
        "petal_length": 1.4,
        "petal_width": 0.2,
    }


@pytest.fixture
def cinema_sample_data():
    """Cinema テスト用サンプルデータ."""
    return {"sns1": 500, "sns2": 300, "actor": 70, "original": 1}


@pytest.fixture
def survived_sample_data():
    """Survived テスト用サンプルデータ."""
    return {"pclass": 1, "age": 30, "sex": "female"}


@pytest.fixture
def boston_sample_data():
    """Boston テスト用サンプルデータ."""
    return {"rm": 6.5, "lstat": 4.98, "ptratio": 15.3}
