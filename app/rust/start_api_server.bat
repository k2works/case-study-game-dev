@echo off
REM Machine Learning API Server 起動スクリプト (Windows)

echo ====================================
echo  Machine Learning API Server
echo ====================================
echo.

REM ログレベルを設定（debug にするとより詳細なログが表示されます）
set RUST_LOG=ml_tdd_rust=info,tower_http=debug

echo [INFO] データファイルの確認...
if not exist "data\iris.csv" (
    echo [ERROR] data\iris.csv が見つかりません
    echo [ERROR] カレントディレクトリを確認してください
    pause
    exit /b 1
)

echo [OK] データファイルが見つかりました
echo.
echo [INFO] API サーバーを起動しています...
echo.

cargo run --bin ml-api-server

pause
