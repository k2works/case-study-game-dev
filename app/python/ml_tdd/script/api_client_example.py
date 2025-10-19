"""API クライアント使用例."""

import httpx

BASE_URL = "http://127.0.0.1:8000"


def predict_iris() -> None:
    """Iris 分類の実行例."""
    print("\n【Iris 分類】")
    print("-" * 50)

    response = httpx.post(
        f"{BASE_URL}/iris",
        json={
            "sepal_length": 5.1,
            "sepal_width": 3.5,
            "petal_length": 1.4,
            "petal_width": 0.2,
        },
        timeout=10.0,
    )

    if response.status_code == 200:
        result = response.json()
        print(f"OK Iris 予測結果: {result}")
        print(f"  種名: {result['species']}")
    else:
        print(f"NG エラー: {response.status_code} - {response.text}")


def predict_cinema() -> None:
    """Cinema 売上予測の実行例."""
    print("\n【Cinema 売上予測】")
    print("-" * 50)

    response = httpx.post(
        f"{BASE_URL}/cinema",
        json={"sns1": 500, "sns2": 300, "actor": 70, "original": 1},
        timeout=10.0,
    )

    if response.status_code == 200:
        result = response.json()
        print(f"OK Cinema 予測結果: {result}")
        print(f"  売上予測: {result['predicted_sales']:.2f} 万円")
    else:
        print(f"NG エラー: {response.status_code} - {response.text}")


def predict_survived() -> None:
    """Survived 生存予測の実行例."""
    print("\n【Survived 生存予測】")
    print("-" * 50)

    passengers = [
        {"pclass": 1, "age": 30, "sex": "female"},
        {"pclass": 3, "age": 22, "sex": "male"},
    ]

    for passenger in passengers:
        response = httpx.post(
            f"{BASE_URL}/survived",
            json=passenger,
            timeout=10.0,
        )

        if response.status_code == 200:
            result = response.json()
            survival_status = "生存" if result["survived"] == 1 else "死亡"
            print(f"OK {passenger}")
            print(f"  -> {survival_status}")
        else:
            print(f"NG エラー: {response.status_code} - {response.text}")


def predict_boston() -> None:
    """Boston 住宅価格予測の実行例."""
    print("\n【Boston 住宅価格予測】")
    print("-" * 50)

    response = httpx.post(
        f"{BASE_URL}/boston",
        json={"rm": 6.5, "lstat": 4.98, "ptratio": 15.3},
        timeout=10.0,
    )

    if response.status_code == 200:
        result = response.json()
        print(f"OK Boston 予測結果: {result}")
        print(f"  住宅価格予測: ${result['predicted_price']:.2f}K")
    else:
        print(f"NG エラー: {response.status_code} - {response.text}")


def check_health() -> None:
    """ヘルスチェックの実行例."""
    print("\n【ヘルスチェック】")
    print("-" * 50)

    response = httpx.get(f"{BASE_URL}/health", timeout=10.0)

    if response.status_code == 200:
        result = response.json()
        print(f"OK ヘルスチェック: {result}")
    else:
        print(f"NG エラー: {response.status_code} - {response.text}")


def main() -> None:
    """メイン処理."""
    print("=" * 60)
    print("  ML API Client Example")
    print("=" * 60)
    print("")
    print("  サーバーが http://127.0.0.1:8000 で起動していることを確認してください。")
    print("  起動コマンド: python script/run_api.py")
    print("")

    try:
        # ヘルスチェック
        check_health()

        # 各エンドポイントのテスト
        predict_iris()
        predict_cinema()
        predict_survived()
        predict_boston()

        print("\n" + "=" * 60)
        print("  すべての API テストが完了しました！")
        print("=" * 60)

    except httpx.ConnectError:
        print("\n" + "=" * 60)
        print("  NG エラー: サーバーに接続できません")
        print("=" * 60)
        print("")
        print("  サーバーを起動してから再度実行してください：")
        print("  $ python script/run_api.py")
        print("")


if __name__ == "__main__":
    main()
