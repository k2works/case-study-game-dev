"""FastAPI サーバー起動スクリプト."""

import sys
from pathlib import Path

# プロジェクトルートをパスに追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))


def main() -> None:
    """FastAPI サーバーを起動."""
    import uvicorn

    print("=" * 60)
    print("  ML API Server Starting...")
    print("=" * 60)
    print("")
    print("  Server will run on: http://127.0.0.1:8000")
    print("  API Docs (Swagger): http://127.0.0.1:8000/docs")
    print("  API Docs (ReDoc):   http://127.0.0.1:8000/redoc")
    print("")
    print("  Press CTRL+C to stop the server")
    print("=" * 60)
    print("")

    uvicorn.run(
        "api.application:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info",
    )


if __name__ == "__main__":
    main()
