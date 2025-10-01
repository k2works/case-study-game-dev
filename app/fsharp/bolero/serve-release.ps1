# Release ビルドをローカルサーバーで起動するスクリプト

Write-Host "Building Release configuration..." -ForegroundColor Cyan
dotnet publish -c Release

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nServing from: src/bin/Release/net8.0/publish/wwwroot" -ForegroundColor Green
    Write-Host "Opening browser at: http://localhost:8080" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

    Set-Location src/bin/Release/net8.0/publish/wwwroot

    # Python がインストールされている場合
    if (Get-Command python -ErrorAction SilentlyContinue) {
        python -m http.server 8080
    }
    # Node.js がインストールされている場合
    elseif (Get-Command npx -ErrorAction SilentlyContinue) {
        npx http-server -p 8080
    }
    # dotnet tool の dotnet-serve がインストールされている場合
    elseif (Get-Command dotnet-serve -ErrorAction SilentlyContinue) {
        dotnet-serve -p 8080
    }
    else {
        Write-Host "Error: HTTP server not found." -ForegroundColor Red
        Write-Host "Please install one of the following:" -ForegroundColor Yellow
        Write-Host "  - Python: https://www.python.org/" -ForegroundColor Yellow
        Write-Host "  - Node.js: https://nodejs.org/" -ForegroundColor Yellow
        Write-Host "  - dotnet serve: dotnet tool install --global dotnet-serve" -ForegroundColor Yellow
    }
}
else {
    Write-Host "Build failed!" -ForegroundColor Red
}
