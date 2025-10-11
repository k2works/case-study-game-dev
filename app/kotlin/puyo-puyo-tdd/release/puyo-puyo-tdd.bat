@echo off
REM ぷよぷよ TDD 起動スクリプト

REM Java のバージョンチェック
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo エラー: Java が見つかりません。
    echo Java 21 以上をインストールしてください。
    echo.
    echo ダウンロード: https://adoptium.net/
    pause
    exit /b 1
)

REM JAR ファイルのパスを取得
set JAR_DIR=%~dp0
set JAR_FILE=%JAR_DIR%puyo-puyo-tdd-windows-x64-1.0.0.jar

REM JAR ファイルの存在確認
if not exist "%JAR_FILE%" (
    echo エラー: JAR ファイルが見つかりません。
    echo 場所: %JAR_FILE%
    pause
    exit /b 1
)

REM ゲームを起動
echo ぷよぷよ TDD を起動しています...
start "" javaw -jar "%JAR_FILE%"

REM 起動成功
echo ゲームを起動しました。
timeout /t 2 >nul
exit /b 0
