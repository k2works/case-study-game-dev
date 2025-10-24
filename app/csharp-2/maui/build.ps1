##########################################################################
# Cake ビルドスクリプト（PowerShell版）
##########################################################################

[CmdletBinding()]
Param(
    [string]$Target = "Default",
    [string]$Configuration = "Debug"
)

Write-Host "Cake ビルドスクリプトを実行中..." -ForegroundColor Green
Write-Host "Target: $Target" -ForegroundColor Cyan
Write-Host "Configuration: $Configuration" -ForegroundColor Cyan
Write-Host ""

# Cake を実行
dotnet dotnet-cake build.cake --target=$Target --configuration=$Configuration

exit $LASTEXITCODE
