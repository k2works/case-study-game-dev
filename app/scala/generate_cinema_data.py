#!/usr/bin/env python3
"""
Cinema 興行収入データセット生成スクリプト

回帰問題の学習用にシンプルな関係性を持つデータを生成します。
"""

import csv
import random
import numpy as np

# シード固定で再現性を確保
random.seed(42)
np.random.seed(42)

# ジャンル別の係数（興行収入への影響）
GENRE_MULTIPLIERS = {
    'Action': 1.5,
    'Comedy': 1.2,
    'Drama': 1.0,
    'Horror': 0.8
}

def generate_cinema_data(n_samples=500):
    """Cinema データセットを生成"""
    data = []

    for _ in range(n_samples):
        # 特徴量の生成
        budget = random.randint(1000, 50000)  # 予算（万円）
        popularity = random.uniform(0, 100)   # 人気度
        runtime = random.randint(60, 180)     # 上映時間（分）
        vote_average = round(random.uniform(1.0, 10.0), 1)  # 平均評価
        genre = random.choice(list(GENRE_MULTIPLIERS.keys()))

        # 興行収入の計算（線形回帰で学習可能な関係）
        genre_multiplier = GENRE_MULTIPLIERS[genre]

        # 基本収入計算
        revenue = (
            budget * 0.8 +                    # 予算の影響が大きい
            popularity * 50 +                 # 人気度も影響
            (runtime - 90) * 10 +            # 上映時間（90分を基準）
            (vote_average - 5) * 500         # 評価の影響
        ) * genre_multiplier

        # ノイズを追加（現実的なばらつき）
        noise = np.random.normal(0, revenue * 0.1)
        revenue = max(0, revenue + noise)  # 負の収入はありえない
        revenue = round(revenue)

        data.append({
            'budget': budget,
            'popularity': round(popularity, 2),
            'runtime': runtime,
            'vote_average': vote_average,
            'genre': genre,
            'revenue': revenue
        })

    return data

def save_to_csv(data, filename):
    """CSV ファイルに保存"""
    fieldnames = ['budget', 'popularity', 'runtime', 'vote_average', 'genre', 'revenue']

    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

    print(f"{len(data)} 件のデータを {filename} に保存しました")

def print_statistics(data):
    """データの統計情報を表示"""
    revenues = [d['revenue'] for d in data]
    budgets = [d['budget'] for d in data]

    print("\nデータセット統計:")
    print(f"  サンプル数: {len(data)}")
    print(f"  興行収入 平均: {np.mean(revenues):,.0f} 万円")
    print(f"  興行収入 最小: {np.min(revenues):,.0f} 万円")
    print(f"  興行収入 最大: {np.max(revenues):,.0f} 万円")
    print(f"  予算 平均: {np.mean(budgets):,.0f} 万円")

    print("\n  ジャンル別件数:")
    for genre in GENRE_MULTIPLIERS.keys():
        count = sum(1 for d in data if d['genre'] == genre)
        print(f"    {genre}: {count} 件")

if __name__ == '__main__':
    # データ生成
    print("Cinema データセットを生成中...")
    data = generate_cinema_data(n_samples=500)

    # 統計情報表示
    print_statistics(data)

    # CSV保存
    save_to_csv(data, 'app/scala/data/cinema.csv')

    # サンプルデータ表示
    print("\nデータサンプル（最初の5件）:")
    print("budget | popularity | runtime | vote_avg | genre  | revenue")
    print("-" * 70)
    for item in data[:5]:
        print(f"{item['budget']:6} | {item['popularity']:10.2f} | {item['runtime']:7} | "
              f"{item['vote_average']:8.1f} | {item['genre']:6} | {item['revenue']:7,}")
