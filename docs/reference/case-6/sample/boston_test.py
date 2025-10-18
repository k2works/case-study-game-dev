# %% [markdown]
# # 回帰2:住宅の平均価格の予測

# %%
import pickle
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import unittest
import doctest
import os

from domain import convert_categoricals, CategoricalData, DataVisualization
from app.repository import CSVRepository, SQLRepository
from domain import learn_with_std as learn

VISUALIZTION = True
path = os.path.dirname(os.path.abspath(__file__))
# repo = SQLRepository(table='Boston')
repo = CSVRepository(file=path + '/data/Boston.csv')
# %% [markdown]
# ## データの内容
# | 列名 | 内容 |
# | --- | --- |
# | CRIME | その地域の犯罪発生率(high,low,very_low)|
# | ZN | 25,000平方フィート以上の住居区画の占める割合 |
# | INDUS | 小売業以外の商業が占める面積の割合 |
# | CHAS | チャールズ川の付近かどうかによるダミー変数(1:川の周辺, 0:それ以外) |
# | NOX | 窒素酸化物の濃度 |
# | RM | 住居の平均部屋数 |
# | AGE | 1940年より前に建てられた物件の割合 |
# | DIS | ボストン市内の5つの雇用施設からの距離 |
# | RAD | 環状高速道路へのアクセスしやすさ |
# | TAX | $10,000ドルあたりの不動産税率の総計 |
# | PTRATIO | 町ごとの教員1人当たりの児童生徒数 |
# | B | 町ごとの黒人(Bk)の比率を次の式で表したもの。1000(Bk - 0.63)^2 |
# | LSTAT | 人口における低所得者の割合 |
# | PRICE | 住宅価格の平均価格 |

# %%
df = repo.get_data()
df.head(3)

# %% [markdown]
# ## 問題背景

# %% [markdown]
# ## データ分析の方法検討
# ボストン市内の特定の地域の住宅価格を予測する回帰式を作成し、どのような地域だと価格が高くなりやすいかを考察する。

# %% [markdown]
# 分析の実施

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
categorical_cols = ['CRIME']
df_conv = convert_categoricals(df, categorical_cols)
df_conv.corr()

# %% [markdown]
# ### データの数値変数確認

# %%
df.select_dtypes(include='number').columns

# %% [markdown]
# ### データのカテゴリ変数確認

# %%
df.select_dtypes(include='object').columns

# %% [markdown]
# ### CRIMEカテゴリ

# %%
crime = CategoricalData(df, 'CRIME')

# %%
crime.show()

# %%
crime.plot()

# %% [markdown]
# ### CRIMEカテゴリの数値変換

# %%
categorical_cols = ['CRIME']
df_conv = convert_categoricals(df, categorical_cols)
conv_species = CategoricalData(df_conv, 'CRIME')
conv_species.plot()

# %% [markdown]
# ### ダミー変数化

# %%
df_dummy = crime.dummy()
df_dummy

# %% [markdown]
# ### データの可視化

# %%
if VISUALIZTION:
    dv = DataVisualization(df)
    dv.df_all('PRICE')

# %%

if VISUALIZTION:
    for c in df.columns:
        plt.figure()
        if c == 'ID' or c == 'PRICE':
            continue
        sns.boxenplot(x=c, y='PRICE', data=df)


# %% [markdown]
# ## データの前処理
# %%
df = repo.get_data()
df.head(3)

# %%
crime = pd.get_dummies(df['CRIME'], drop_first=True)
df2 = pd.concat([df, crime], axis=1)
df2 = df2.drop('CRIME', axis=1)
df2.head(3)

# %%
train_val, test = train_test_split(df2, test_size=0.2, random_state=123)

# %% [markdown]
# ### 欠損値処理（行削除・全体代表値埋め、グループ代表値埋め）
# %%
train_val_mean = train_val.mean()
train_val2 = train_val.fillna(train_val_mean)

train_val2['low'] = train_val2['low'].astype(int)
train_val2['very_low'] = train_val2['very_low'].astype(int)

colname = train_val2.columns
for name in colname:
    train_val2.plot(kind='scatter', x=name, y='PRICE')

# %% [markdown]
# ### 各手法を必要に応じて実施

# %% [markdown]
# - 外れ値の除外
# - 多項式特徴量・交互作用特徴量の追加
# - 特徴量の絞り込み
# - 標準化

# %%
out_line1 = train_val2[(train_val2['RM'] < 6) &
                       (train_val2['PRICE'] > 40)].index
out_line2 = train_val2[(train_val2['PTRATIO'] > 18) &
                       (train_val2['PRICE'] > 40)].index
print(out_line1, out_line2)
# %%
train_val3 = train_val2.drop(out_line1)
col = ['INDUS', 'NOX', 'RM', 'PTRATIO', 'LSTAT', 'PRICE']

train_val4 = train_val3[col]
train_val4.head(3)
# %%
train_cor = train_val4.corr()['PRICE']
abs_cor = train_cor.map(abs)
abs_cor.sort_values(ascending=False)

# %%
col = ['RM', 'LSTAT', 'PTRATIO']
x = train_val4[col]
t = train_val4[['PRICE']]

x_train, x_val, y_train, y_val = train_test_split(
    x, t, test_size=0.2, random_state=0)

# %%

sc_model_x = StandardScaler()
sc_model_x.fit(x_train)
sc_x = sc_model_x.transform(x_train)

sc_model_y = StandardScaler()
sc_model_y.fit(y_train)
sc_y = sc_model_y.transform(y_train)


# %% [markdown]
# ## モデルの作成と学習

# %% [markdown]
# ### 未学習状態モデルの生成（分類なら決定木、回帰なら線形回帰）
# %%
model = LinearRegression()


# %% [markdown]
# ### 訓練データで学習（必要に応じて不均衡データ補正）
# %%
model.fit(sc_x, sc_y)

# %% [markdown]
# ## モデルの評価

# %% [markdown]
# ### 検証データで評価し指標確認（分類なら正解率、回帰なら決定係数）
# %%
sc_x_val = sc_model_x.transform(x_val)
sc_y_val = sc_model_y.transform(y_val)
model.score(sc_x_val, sc_y_val)

# %% [markdown]
# ### NG:改善案検討前処理に戻る
# %% [markdown]
# ### Take1
# %%

path = os.path.dirname(os.path.abspath(__file__))
# repo = SQLRepository(table='Boston')
repo = CSVRepository(file=path + '/data/Boston.csv')

# モデルの作成と学習


# データの前処理
df = repo.get_data()

crime = pd.get_dummies(df['CRIME'], drop_first=True)
df2 = pd.concat([df, crime], axis=1)
df2 = df2.drop('CRIME', axis=1)

train_val, test = train_test_split(df2, test_size=0.2, random_state=0)

train_val_mean = train_val.mean()
train_val2 = train_val.fillna(train_val_mean)

out_line1 = train_val2[(train_val2['RM'] < 6) &
                       (train_val2['PRICE'] > 40)].index
out_line2 = train_val2[(train_val2['PTRATIO'] > 18) &
                       (train_val2['PRICE'] > 40)].index
train_val3 = train_val2.drop([76], axis=0)

col = ['INDUS', 'NOX', 'RM', 'PTRATIO', 'LSTAT', 'PRICE']
train_val4 = train_val3[col]
train_val4.head(3)

train_cor = train_val4.corr()['PRICE']
abs_cor = train_cor.map(abs)
abs_cor.sort_values(ascending=False)

# モデルの評価とチューニング
x = train_val3.loc[:, ['RM', 'LSTAT', 'PTRATIO']]
t = train_val3[['PRICE']]

s1, s2 = learn(x, t)
print(s1, s2)

# %% [markdown]
# ### Take1
# - 特徴量にINDUS列を追加
# %%
x = train_val3.loc[:, ['RM', 'LSTAT', 'PTRATIO', 'INDUS']]
t = train_val3[['PRICE']]
s1, s2 = learn(x, t)
print(s1, s2)

# %% [markdown]
# ### Take2
# - RM列のデータを2乗した新しい列を追加
# %%
x = train_val3.loc[:, ['RM', 'LSTAT', 'PTRATIO']]
t = train_val3[['PRICE']]
x['RM2'] = x['RM'] ** 2
s1, s2 = learn(x, t)
print(s1, s2)

# %% [markdown]
# ### Take3
# - RM列のデータを2乗した新しい列を追加
# - LSTAT列のデータを2乗した新しい列を追加
# %%
x = train_val3.loc[:, ['RM', 'LSTAT', 'PTRATIO']]
t = train_val3[['PRICE']]
x['RM2'] = x['RM'] ** 2
x['LSTAT2'] = x['LSTAT'] ** 2
s1, s2 = learn(x, t)
print(s1, s2)


# %% [markdown]
# ### Take4
# - RM列のデータを2乗した新しい列を追加
# - LSTAT列のデータを2乗した新しい列を追加
# - PTRATIO列のデータを2乗した新しい列を追加
# %%
x = train_val3.loc[:, ['RM', 'LSTAT', 'PTRATIO']]
t = train_val3[['PRICE']]
x['RM2'] = x['RM'] ** 2
x['LSTAT2'] = x['LSTAT'] ** 2
x['PTRATIO2'] = x['PTRATIO'] ** 2
s1, s2 = learn(x, t)
print(s1, s2)

# %% [markdown]
# ### Take5
# - RM列のデータを2乗した新しい列を追加
# - LSTAT列のデータを2乗した新しい列を追加
# - PTRATIO列のデータを2乗した新しい列を追加
# - 交差作用特徴量を追加
# %%
x = train_val3.loc[:, ['RM', 'LSTAT', 'PTRATIO']]
t = train_val3[['PRICE']]
x['RM2'] = x['RM'] ** 2
x['LSTAT2'] = x['LSTAT'] ** 2
x['PTRATIO2'] = x['PTRATIO'] ** 2
x['RM * LSTAT'] = x['RM'] * x['LSTAT']
s1, s2 = learn(x, t)
print(s1, s2)

# %% [markdown]
# ### OK:最終性能評価（テストデータで評価）
# %% [markdown]
# ### Take5
# - RM列のデータを2乗した新しい列を追加
# - LSTAT列のデータを2乗した新しい列を追加
# - PTRATIO列のデータを2乗した新しい列を追加
# - 交差作用特徴量を追加
# %%
sc_model_x2 = StandardScaler()
sc_model_x2.fit(x)
sc_x = sc_model_x2.transform(x)

sc_model_y2 = StandardScaler()
sc_model_y2.fit(t)
sc_y = sc_model_y2.transform(t)
model = LinearRegression()
model.fit(sc_x, sc_y)

# %%
test2 = test.fillna(train_val.mean())
x_test = test2.loc[:, ['RM', 'LSTAT', 'PTRATIO']]
y_test = test2[['PRICE']]

x_test['RM2'] = x_test['RM'] ** 2
x_test['LSTAT2'] = x_test['LSTAT'] ** 2
x_test['PTRATIO2'] = x_test['PTRATIO'] ** 2

x_test['RM * LSTAT'] = x_test['RM'] * x_test['LSTAT']

sc_x_test = sc_model_x2.transform(x_test)
sc_y_test = sc_model_y2.transform(y_test)

# %%
model.score(sc_x_test, sc_y_test)

# %%
with open(path + '/model/boston.pkl', mode='wb') as fp:
    pickle.dump(model, fp)
with open(path + '/model/boston_scx.pkl', mode='wb') as fp:
    pickle.dump(sc_model_x2, fp)
with open(path + '/model/boston_scy.pkl', mode='wb') as fp:
    pickle.dump(sc_model_y2, fp)

# %%
doctest.testmod(verbose=True)
unittest.main(argv=[''], verbosity=2, exit=False)
