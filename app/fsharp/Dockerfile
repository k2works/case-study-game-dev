# マルチステージビルド

# ビルドステージ
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# プロジェクトファイルをコピーして依存関係を復元
COPY ["MlTddFSharp/MlTddFSharp.fsproj", "MlTddFSharp/"]
COPY ["MLWebApi.Domain/MLWebApi.Domain.fsproj", "MLWebApi.Domain/"]
COPY ["MLWebApi.Service/MLWebApi.Service.fsproj", "MLWebApi.Service/"]
COPY ["MLWebApi.Application/MLWebApi.Application.fsproj", "MLWebApi.Application/"]
RUN dotnet restore "MLWebApi.Application/MLWebApi.Application.fsproj"

# すべてのソースコードをコピー
COPY . .

# アプリケーションをビルド
WORKDIR "/src/MLWebApi.Application"
RUN dotnet build "MLWebApi.Application.fsproj" -c Release -o /app/build

# 公開ステージ
FROM build AS publish
RUN dotnet publish "MLWebApi.Application.fsproj" -c Release -o /app/publish /p:UseAppHost=false

# ランタイムステージ
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080

# ビルドした成果物をコピー
COPY --from=publish /app/publish .

# モデルファイルをコピー
COPY model /app/model

ENTRYPOINT ["dotnet", "MLWebApi.Application.dll"]
