# API Server Startup Script with Java 21
# このスクリプトは Java 21 を使用して ML API サーバーを起動します
# Usage: powershell -ExecutionPolicy Bypass -File run-api-server.ps1

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "ML API Server Startup with Java 21" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Java 21 のパスを取得（Scoop を使用している場合）
$java21Home = "$env:USERPROFILE\scoop\apps\openjdk21\current"
$java21Path = "$java21Home\bin"

if (Test-Path $java21Path) {
    Write-Host "Found Java 21 at: $java21Path" -ForegroundColor Green

    # 現在の環境変数を保存
    $originalPath = $env:PATH
    $originalJavaHome = $env:JAVA_HOME

    # Java 21 を設定
    $env:JAVA_HOME = $java21Home
    $env:PATH = "$java21Path;$env:PATH"

    # Java バージョンを確認
    Write-Host ""
    Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Yellow
    Write-Host "Using Java version:" -ForegroundColor Yellow
    & java -version

    Write-Host ""
    Write-Host "Starting ML API Server..." -ForegroundColor Cyan
    Write-Host "Note: Press Ctrl+C or RETURN in the server console to stop" -ForegroundColor Gray
    Write-Host ""

    # sbt で API サーバーを起動
    & sbt "runMain runServer"

    # 環境変数を元に戻す
    $env:PATH = $originalPath
    if ($originalJavaHome) {
        $env:JAVA_HOME = $originalJavaHome
    } else {
        Remove-Item Env:\JAVA_HOME -ErrorAction SilentlyContinue
    }

} else {
    Write-Host "Error: Java 21 not found at $java21Path" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Java 21 using Scoop:" -ForegroundColor Yellow
    Write-Host "  scoop install openjdk21" -ForegroundColor White
    Write-Host ""
    Write-Host "Or download from:" -ForegroundColor Yellow
    Write-Host "  https://adoptium.net/" -ForegroundColor White
    exit 1
}
