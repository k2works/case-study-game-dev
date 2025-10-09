[CmdletBinding()]
Param(
    [string]$Target = "Default",
    [string]$Configuration = "Release"
)

& dotnet cake --target=$Target --configuration=$Configuration
