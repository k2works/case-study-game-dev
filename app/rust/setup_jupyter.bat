@echo off
REM Jupyter 環境セットアップスクリプト (Windows)

echo === Jupyter 環境のセットアップ ===
echo.

REM Python バージョンチェック
echo 1. Python バージョン確認...
python --version >nul 2>&1
if errorlevel 1 (
    echo エラー: Python がインストールされていません
    exit /b 1
)
python --version
echo.

REM 仮想環境の作成
echo 2. Python 仮想環境を作成...
if not exist venv (
    python -m venv venv
    echo    仮想環境を作成しました
) else (
    echo    仮想環境は既に存在します
)
echo.

REM 仮想環境のアクティベート
echo 3. 仮想環境をアクティベート...
call venv\Scripts\activate.bat
echo.

REM パッケージのインストール
echo 4. 必要なパッケージをインストール...
python -m pip install --upgrade pip
pip install -r requirements.txt
echo.

REM Jupyter カーネル登録
echo 5. Jupyter カーネルを登録...
python -m ipykernel install --user --name=ml-tdd-rust --display-name="ML TDD Rust"
echo.

echo === セットアップ完了 ===
echo.
echo Jupyter Notebook を起動するには:
echo   venv\Scripts\activate.bat
echo   jupyter notebook notebooks/
echo.
echo または Jupyter Lab を起動するには:
echo   venv\Scripts\activate.bat
echo   jupyter lab notebooks/
echo.
pause
