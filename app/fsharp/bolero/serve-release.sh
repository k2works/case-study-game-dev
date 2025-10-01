#!/bin/bash
# Release ビルドをローカルサーバーで起動するスクリプト

echo "Building Release configuration..."
dotnet publish -c Release

if [ $? -eq 0 ]; then
    echo ""
    echo "Serving from: src/bin/Release/net8.0/publish/wwwroot"
    echo "Opening browser at: http://localhost:8080"
    echo "Press Ctrl+C to stop the server"
    echo ""

    cd src/bin/Release/net8.0/publish/wwwroot

    # Python がインストールされている場合
    if command -v python3 &> /dev/null; then
        python3 -m http.server 8080
    elif command -v python &> /dev/null; then
        python -m http.server 8080
    # Node.js がインストールされている場合
    elif command -v npx &> /dev/null; then
        npx http-server -p 8080
    # dotnet tool の dotnet-serve がインストールされている場合
    elif command -v dotnet-serve &> /dev/null; then
        dotnet-serve -p 8080
    else
        echo "Error: HTTP server not found."
        echo "Please install one of the following:"
        echo "  - Python: https://www.python.org/"
        echo "  - Node.js: https://nodejs.org/"
        echo "  - dotnet serve: dotnet tool install --global dotnet-serve"
        exit 1
    fi
else
    echo "Build failed!"
    exit 1
fi
