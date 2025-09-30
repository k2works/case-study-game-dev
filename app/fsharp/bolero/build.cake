var target = Argument("target", "Default");
var configuration = Argument("configuration", "Release");

//////////////////////////////////////////////////////////////////////
// TASKS
//////////////////////////////////////////////////////////////////////

Task("Clean")
    .Does(() =>
{
    CleanDirectory("./src/bin");
    CleanDirectory("./src/obj");
    CleanDirectory("./tests/bin");
    CleanDirectory("./tests/obj");
});

Task("Build")
    .IsDependentOn("Clean")
    .Does(() =>
{
    DotNetBuild("./src/PuyoPuyo.fsproj", new DotNetBuildSettings
    {
        Configuration = configuration
    });

    DotNetBuild("./tests/PuyoPuyo.Tests.fsproj", new DotNetBuildSettings
    {
        Configuration = configuration
    });
});

Task("Test")
    .IsDependentOn("Build")
    .Does(() =>
{
    DotNetTest("./tests/PuyoPuyo.Tests.fsproj", new DotNetTestSettings
    {
        Configuration = configuration,
        NoBuild = true
    });
});

Task("Run")
    .IsDependentOn("Build")
    .Does(() =>
{
    DotNetRun("./src/PuyoPuyo.fsproj", new DotNetRunSettings
    {
        Configuration = configuration,
        NoBuild = true
    });
});

Task("All")
    .IsDependentOn("Clean")
    .IsDependentOn("Build")
    .IsDependentOn("Test");

Task("Default")
    .IsDependentOn("All");

//////////////////////////////////////////////////////////////////////
// EXECUTION
//////////////////////////////////////////////////////////////////////

RunTarget(target);