// build.cake

///////////////////////////////////////////////////////////////////////////////
// 引数
///////////////////////////////////////////////////////////////////////////////

var target = Argument("target", "Default");
var configuration = Argument("configuration", "Release");

///////////////////////////////////////////////////////////////////////////////
// タスク定義
///////////////////////////////////////////////////////////////////////////////

Task("Clean")
    .Does(() =>
{
    DotNetClean("./PuyoPuyo.sln");
    CleanDirectories("./src/**/bin");
    CleanDirectories("./src/**/obj");
    CleanDirectories("./tests/**/bin");
    CleanDirectories("./tests/**/obj");
});

Task("Restore")
    .IsDependentOn("Clean")
    .Does(() =>
{
    DotNetRestore("./PuyoPuyo.sln");
});

Task("Build")
    .IsDependentOn("Restore")
    .Does(() =>
{
    DotNetBuild("./PuyoPuyo.sln", new DotNetBuildSettings
    {
        Configuration = configuration,
        NoRestore = true
    });
});

Task("Test")
    .IsDependentOn("Build")
    .Does(() =>
{
    DotNetTest("./PuyoPuyo.sln", new DotNetTestSettings
    {
        Configuration = configuration,
        NoBuild = true,
        NoRestore = true
    });
});

Task("Run")
    .Does(() =>
{
    DotNetRun("./src/bolero.Client/bolero.Client.fsproj");
});

Task("Watch")
    .Does(() =>
{
    StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "watch run --project ./src/bolero.Client/bolero.Client.fsproj"
    });
});

Task("Watch-Test")
    .Does(() =>
{
    StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "watch test --project ./tests/PuyoPuyo.Tests/PuyoPuyo.Tests.fsproj"
    });
});

///////////////////////////////////////////////////////////////////////////////
// ターゲット
///////////////////////////////////////////////////////////////////////////////

Task("Default")
    .IsDependentOn("Test");

Task("CI")
    .IsDependentOn("Clean")
    .IsDependentOn("Test");

///////////////////////////////////////////////////////////////////////////////
// 実行
///////////////////////////////////////////////////////////////////////////////

RunTarget(target);
