$env:JAVA_HOME = 'C:\Users\PC202411-1\scoop\apps\openjdk21\current'
$env:PATH = 'C:\Users\PC202411-1\scoop\apps\openjdk21\current\bin;' + $env:PATH

Write-Host "Java version check:"
java -version

Write-Host "`nRunning sbt test..."
sbt test
