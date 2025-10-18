# %% [markdown]
# # 回帰1:映画の興行収入の予測

# %%
import pickle
import pandas as pd
from sklearn.metrics import mean_absolute_error
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import unittest
import doctest
import os
from domain import CategoricalData, DataVisualization, convert_categoricals
from app.repository import CSVRepository, SQLRepository

path = os.path.dirname(os.path.abspath(__file__))
# repo = SQLRepository(table='Cinema')
repo = CSVRepository(file=path + '/data/cinema.csv')

# %% [markdown]
# ## データの内容
# | 列名 | 内容 |
# | --- | --- |
# | cinema_id | 映画作品のID |
# | SNS1 | 公開後10日以内にSNS1でつぶやかれた数 |
# | SNS2 | 公開後10日以内にSNS2でつぶやかれた数 |
# | actor | 主演俳優の昨年のメディア露出度。actorの値が大きいほど露出している |
# | original | 原作があるかどうか（あるなら1,ないなら0） |
# | sales | 最終的な興行収入（単位:万円） |

# %%
df = repo.get_data()
df.head(3)

# %% [markdown]
# ## 問題背景

# %% [markdown]
# ## データ分析の方法検討
# - 特徴量を「公開後10日以内にSNS1でつぶやかれた数、公開後10日以内にSNS2でつぶやかれた数、主演俳優の昨年のメディア露出度、原作があるかどうか」、目的変数を「最終的な興行収入」として、映画の興行収入を予測する。

# %% [markdown]
# # 分析の実施

# %% [markdown]
# ### データの概要

# %%
df.info()

# %% [markdown]
# ### データの統計量

# %%
df.describe()

# %% [markdown]
# ### データの特徴量の相関確認

# %%
categorical_cols = ['sales']
df_conv = convert_categoricals(df, categorical_cols)
df_conv.corr()

# %% [markdown]
# ### データの数値変数確認

# %%
df.select_dtypes(include='number').columns

# %% [markdown]
# ### originalカテゴリ

# %%
original = CategoricalData(df, 'original')

# %%
original.show()

# %%
original.plot()

# %% [markdown]
# ### 種類カテゴリの数値変換

# %%
categorical_cols = ['original']
df_conv = convert_categoricals(df, categorical_cols)
conv_species = CategoricalData(df_conv, 'sales')
conv_species.plot()

# %% [markdown]
# ### ピボットテーブルによる集計

# %%
original.pivot('sales', 'SNS1')
# %%
original.pivot('sales', 'SNS2')
# %%
original.pivot('sales', 'actor')

# %%

# %% [markdown]
# ### ダミー変数化

# %%
df_dummy = original.dummy()
df_dummy

# %% [markdown]
# ### データのカテゴリ変数確認

# %%
df.select_dtypes(include='object').columns

# %% [markdown]
# ### データの可視化

# %%
dv = DataVisualization(df)
dv.df_all('sales')

# %% [markdown]
# ## データの前処理
# %%
df = repo.get_data()
df.head(3)

# %% [markdown]
# ### 欠損地処理（行削除・全体代表値埋め、グループ代表値埋め）
# %%
df.isnull().any(axis=0)

# %%
df2 = df.fillna(df.mean())
df2.isnull().any(axis=0)

# %%
for name in df2.columns:
    if name == 'cinema_id' or name == 'sales':
        continue

    df2.plot.scatter(x=name, y='sales')

# %% [markdown]
# ### 各手法を必要に応じて実施

# %% [markdown]
# - 外れ値の除外
# - 多項式特徴量・交互作用特徴量の追加
# - 特徴量の絞り込み
# - 標準化

# %%
no = df2[(df2['SNS2'] > 1000) & (df2['sales'] < 8500)].index
df3 = df2.drop(no, axis=0)
df3.shape

# %%
x = df3[['SNS1', 'SNS2', 'actor', 'original']]
t = df3['sales']
x_train, x_test, y_train, y_test = train_test_split(
    x, t, test_size=0.2, random_state=0)

# %% [markdown]
# ## モデルの作成と学習

# %% [markdown]
# ### 未学習状態モデルの生成（分類なら決定木、回帰なら線形回帰）
# %%
model = LinearRegression()

# %% [markdown]
# ### 訓練データで学習（必要に応じて不均衡データ補正）
# %%
model.fit(x_train, y_train)

new = [[150, 700, 300, 0]]
model.predict(new)

# %% [markdown]
# ## モデルの評価

# %% [markdown]
# ### 検証データで評価し指標確認（分類なら正解率、回帰なら決定係数）
# %%
model.score(x_test, y_test)

# %%
# MAEを求める

pred = model.predict(x_test)

mean_absolute_error(y_pred=pred, y_true=y_test)

# %%
# 決定係数を求める
model.score(x_test, y_test)

# %% [markdown]
# ### NG:改善案検討前処理に戻る
# ### OK:最終性能評価（テストデータで評価）
# #### Take1
# - 特徴量を「公開後10日以内にSNS1でつぶやかれた数、公開後10日以内にSNS2でつぶやかれた数、主演俳優の昨年のメディア露出度、原作があるかどうか」、目的変数を「最終的な興行収入」として、映画の興行収入を予測する。
# - 欠損データは代表値埋めを行う。
# - 外れ値データは削除する。
# %%
# 前処理
# repo = SQLRepository(table='Cinema')
repo = CSVRepository(file=path + '/data/cinema.csv')

df = repo.get_data()
df2 = df.fillna(df.mean())
no = df2[(df2['SNS2'] > 1000) & (df2['sales'] < 8500)].index
df3 = df2.drop(no, axis=0)

# モデルの作成と学習
x = df3[['SNS1', 'SNS2', 'actor', 'original']]
t = df3['sales']
x_train, x_test, y_train, y_test = train_test_split(
    x, t, test_size=0.2, random_state=0)

model = LinearRegression()
model.fit(x_train, y_train)

# モデルの評価

score = model.score(x_test, y_test)
print(f'決定係数:{score}')

coef = pd.DataFrame(model.coef_)
coef.index = x_train.columns
print(f'回帰式: {coef[0][0]}*SNS1 + {coef[0][1]}*SNS2 + {coef[0][2]}*actor + {coef[0][3]}*original + {model.intercept_}')

pred = model.predict(x_test)
mae = mean_absolute_error(y_pred=pred, y_true=y_test)
print(f'平均絶対誤差: {mae}')

# %%
# モデルの保存
with open(path + '/model/cinema.pkl', 'wb') as f:
    pickle.dump(model, f)

# %% [markdown]
# ## 回帰式による影響度の分析
# %%
# 係数と切片を確認
tmp = pd.DataFrame(model.coef_)
tmp.index = x_train.columns
print('係数: ')
print(tmp)
print('切片: ', model.intercept_)


# %%
doctest.testmod(verbose=True)
unittest.main(argv=[''], verbosity=2, exit=False)
