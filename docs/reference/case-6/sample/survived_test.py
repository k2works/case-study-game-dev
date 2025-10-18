# %% [markdown]
# # 分類2:客船沈没事故での生存予測

# %%
import pickle
import pandas as pd
from sklearn import tree
from sklearn.model_selection import train_test_split
import unittest
import doctest
import os

from domain import CategoricalData, DataVisualization, convert_categoricals, learn
from app.repository import CSVRepository, SQLRepository

path = os.path.dirname(os.path.abspath(__file__))
# repo = SQLRepository(table='Survived')
repo = CSVRepository(file=path + '/data/Survived.csv')

# %% [markdown]
# ## データの内容
# | 列名 | 内容 |
# | --- | --- |
# | PassengerId | 乗客ID |
# | Pclass | チケットクラス（1等、2等、3等）|
# | Age | 年齢 |
# | Parch | 同乗した、自身の親と子供の総数 |
# | Fare | 運賃 |
# | Embarked | 搭乗港 |
# | Survived | 1:生存,0:死亡 |
# | Sex | 性別 |
# | SibSp | 同乗した兄弟や配偶者の総数 |
# | Ticket | チケットID |
# | Cabin | 部屋番号 |

# %%
df = repo.get_data()
df.head(3)


# %% [markdown]
# ## 問題背景
# 客船沈没事故で、どのような人が生き残ったかを分析します。このデータを用いて、客船の乗客の特徴量から生存者を予測するモデルを作成します。

# %% [markdown]
# ## データ分析の方法検討
# - 乗客の特徴から沈没時に生存か死亡かに分類するモデルを作成する。また、その過程で、どのような特徴を持つ人が生き残れたかを考察する。
# - 特徴量を「チケットクラス、年齢、同乗した、自身の親と子供の総数、運賃、搭乗港、性別、同乗した兄弟や配偶者の総数、部屋番号」、目的変数を「生存」（1:生存,0:死亡）として、客船の乗客の生存を予測する。

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
categorical_cols = ['Sex', 'Ticket', 'Cabin', 'Embarked']
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
# ### 性別カテゴリ

# %%
sex = CategoricalData(df, 'Sex')

# %%
sex.show()

# %%
sex.plot()

# %% [markdown]
# ### 性別カテゴリの数値変換

# %%
categorical_cols = ['Sex']
df_conv = convert_categoricals(df, categorical_cols)
conv_species = CategoricalData(df_conv, 'Sex')
conv_species.plot()

# %% [markdown]
# ### チケットIDカテゴリ

# %%
ticket = CategoricalData(df, 'Ticket')

# %%
ticket.show()

# %%
ticket.plot()

# %% [markdown]
# ### チケットIDカテゴリの数値変換

# %%
categorical_cols = ['Ticket']
df_conv = convert_categoricals(df, categorical_cols)
conv_species = CategoricalData(df_conv, 'Ticket')
conv_species.plot()

# %% [markdown]
# ### 部屋番号カテゴリ

# %%
cabin = CategoricalData(df, 'Cabin')

# %%
cabin.show()

# %%
cabin.plot()

# %% [markdown]
# ### 部屋番号カテゴリの数値変換

# %%
categorical_cols = ['Cabin']
df_conv = convert_categoricals(df, categorical_cols)
conv_species = CategoricalData(df_conv, 'Cabin')
conv_species.plot()


# %% [markdown]
# ### 搭乗港カテゴリ

# %%
embarked = CategoricalData(df, 'Embarked')

# %%
embarked.show()

# %%
embarked.plot()

# %% [markdown]
# ### 搭乗港カテゴリの数値変換

# %%
categorical_cols = ['Embarked']
df_conv = convert_categoricals(df, categorical_cols)
conv_species = CategoricalData(df_conv, 'Embarked')
conv_species.plot()

# %% [markdown]
# ### ダミー変数化

# %%
df_dummy = pd.get_dummies(df, columns=['Survived'])
df_dummy

# %% [markdown]
# ### データの可視化

# %%
dv = DataVisualization(df)
dv.df_all('Survived')

# %% [markdown]
# ## データの前処理
# %%
df = repo.get_data()
df.head(2)

df['Survived'].value_counts()

# %% [markdown]
# ### 欠損地処理（行削除・全体代表値埋め、グループ代表値埋め）
# %%
df.isnull().sum()
df.shape

df['Age'] = df['Age'].fillna(df['Age'].mean())
df['Embarked'] = df['Embarked'].fillna(df['Embarked'].mode()[0])

# %% [markdown]
# ### 各手法を必要に応じて実施

# %% [markdown]
# - 外れ値の除外
# - 多項式特徴量・交互作用特徴量の追加
# - 特徴量の絞り込み
# - 標準化

col = ['Pclass', 'Age', 'SibSp', 'Parch', 'Fare']

x = df[col]
y = df['Survived']

x_train, x_test, y_train, y_test = train_test_split(
    x, y, test_size=0.2, random_state=0)

x_train.shape

# %% [markdown]
# ## モデルの作成と学習

# %% [markdown]
# ### 未学習状態モデルの生成（分類なら決定木、回帰なら線形回帰）
# %%
model = tree.DecisionTreeClassifier(
    max_depth=5, random_state=0, class_weight='balanced')

# %% [markdown]
# ### 訓練データで学習（必要に応じて不均衡データ補正）
# %%
model.fit(x_train, y_train)

# %% [markdown]
# ## モデルの評価

# %% [markdown]
# ### 検証データで評価し指標確認（分類なら正解率、回帰なら決定係数）
# %%
model.score(x_test, y_test)

# %%


for j in range(1, 15):
    train_score, test_score, model = learn(x, y, depth=j)
    sentence = '訓練データの正解率{}'
    sentence2 = 'テストデータの正解率{}'
    total_sentence = '深さ{}:' + sentence + sentence2
    print(total_sentence.format(j, train_score, test_score))


# %% [markdown]
# ### NG:改善案検討前処理に戻る
# %%
# repo = SQLRepository(table='Survived')
repo = CSVRepository(file=path + '/data/Survived.csv')

# %% [markdown]
# #### Take1
# - Age列の平均値と中央値を確認する
# %%
# 前処理
df = repo.get_data()
df['Age'] = df['Age'].fillna(df['Age'].median())
df['Embarked'] = df['Embarked'].fillna(df['Embarked'].mode()[0])

col = ['Pclass', 'Age', 'SibSp', 'Parch', 'Fare']
x = df[col]
y = df['Survived']

x_train, x_test, y_train, y_test = train_test_split(
    x, y, test_size=0.2, random_state=0)

# モデルの作成と学習
model = tree.DecisionTreeClassifier(
    max_depth=5, random_state=0, class_weight='balanced')
model.fit(x_train, y_train)

# モデルの評価
model.score(x_test, y_test)

# %% [markdown]
# #### Take2
# - グループ別集計
# %%
df2 = repo.get_data()

categorical_cols = ['Sex', 'Ticket', 'Cabin', 'Embarked']
df_conv = convert_categoricals(df2, categorical_cols)
print(df_conv.groupby('Survived').mean()['Age'])
print(df_conv.groupby('Pclass').median()['Age'])
print(pd.pivot_table(df, index='Survived',
      columns='Pclass', values='Age', aggfunc='median'))
print(pd.pivot_table(df, index='Survived',
      columns='Pclass', values='Age', aggfunc=max))

# %%
# 前処理
is_null = df2['Age'].isnull()

df2.loc[(df2['Pclass'] == 1) & (df2['Survived'] == 0) & (is_null), 'Age'] = 43
df2.loc[(df2['Pclass'] == 1) & (df2['Survived'] == 1) & (is_null), 'Age'] = 35

df2.loc[(df2['Pclass'] == 2) & (df2['Survived'] == 0) & (is_null), 'Age'] = 33
df2.loc[(df2['Pclass'] == 2) & (df2['Survived'] == 1) & (is_null), 'Age'] = 25

df2.loc[(df2['Pclass'] == 3) & (df2['Survived'] == 0) & (is_null), 'Age'] = 26
df2.loc[(df2['Pclass'] == 3) & (df2['Survived'] == 1) & (is_null), 'Age'] = 20

col = ['Pclass', 'Age', 'SibSp', 'Parch', 'Fare']
x = df2[col]
y = df2['Survived']

for j in range(1, 15):
    s1, s2, m = learn(x, y, depth=j)
    sentence = '深さ{}:訓練データの精度{}::テストデータの精度{}'
    print(sentence.format(j, s1, s2))

x_train, x_test, y_train, y_test = train_test_split(
    x, y, test_size=0.2, random_state=0)

# モデルの作成と学習
model = tree.DecisionTreeClassifier(
    max_depth=6, random_state=0, class_weight='balanced')
model.fit(x_train, y_train)

# モデルの評価
model.score(x_test, y_test)


# %% [markdown]
# #### Take3
# - グループ別集計
# - 特徴量に性別を追加
# %%
df3 = repo.get_data()

categorical_cols = ['Sex', 'Ticket', 'Cabin', 'Embarked']
df_conv = convert_categoricals(df3, categorical_cols)
sex = df_conv.groupby('Sex').mean()
sex['Survived']
sex['Survived'].plot(kind='bar')

# %%
# 前処理
is_null = df3['Age'].isnull()

df3.loc[(df3['Pclass'] == 1) & (df3['Survived'] == 0) & (is_null), 'Age'] = 43
df3.loc[(df3['Pclass'] == 1) & (df3['Survived'] == 1) & (is_null), 'Age'] = 35

df3.loc[(df3['Pclass'] == 2) & (df3['Survived'] == 0) & (is_null), 'Age'] = 33
df3.loc[(df3['Pclass'] == 2) & (df3['Survived'] == 1) & (is_null), 'Age'] = 25

df3.loc[(df3['Pclass'] == 3) & (df3['Survived'] == 0) & (is_null), 'Age'] = 26
df3.loc[(df3['Pclass'] == 3) & (df3['Survived'] == 1) & (is_null), 'Age'] = 20

col = ['Pclass', 'Age', 'SibSp', 'Parch', 'Fare', 'Sex']
x = df3[col]
y = df3['Survived']

male = pd.get_dummies(df3['Sex'], drop_first=True)
x_temp = pd.concat([x, male], axis=1)
x_new = x_temp.drop('Sex', axis=1)

# モデルの評価
for j in range(1, 15):
    s1, s2, m = learn(x_new, y, depth=j)
    sentence = '深さ{}:訓練データの精度{}::テストデータの精度{}'
    print(sentence.format(j, s1, s2))

# %% [markdown]
# ### OK:最終性能評価（テストデータで評価）
# #### Take3
# %%
# 前処理
df = repo.get_data()
is_null = df['Age'].isnull()

df.loc[(df['Pclass'] == 1) & (df['Survived'] == 0) & (is_null), 'Age'] = 43
df.loc[(df['Pclass'] == 1) & (df['Survived'] == 1) & (is_null), 'Age'] = 35

df.loc[(df['Pclass'] == 2) & (df['Survived'] == 0) & (is_null), 'Age'] = 33
df.loc[(df['Pclass'] == 2) & (df['Survived'] == 1) & (is_null), 'Age'] = 25

df.loc[(df['Pclass'] == 3) & (df['Survived'] == 0) & (is_null), 'Age'] = 26
df.loc[(df['Pclass'] == 3) & (df['Survived'] == 1) & (is_null), 'Age'] = 20

col = ['Pclass', 'Age', 'SibSp', 'Parch', 'Fare', 'Sex']
x = df[col]
y = df['Survived']

male = pd.get_dummies(df['Sex'], drop_first=True)
x_temp = pd.concat([x, male], axis=1)
x_new = x_temp.drop('Sex', axis=1)

# モデルの作成と学習
s1, s2, model = learn(x_new, y, depth=9)
# モデルの評価
print(f'テストデータの精度:{s2}')

# %%
# モデルの保存
with open(path + '/model/survived.pkl', 'wb') as f:
    pickle.dump(model, f)

# %% [markdown]
# ## 決定木における特徴量の考察
# %%
# 特徴量重要度の確認
model.feature_importances_
# %%
# データフレームに変換
pd.DataFrame(model.feature_importances_, index=x_new.columns)


# %%
doctest.testmod(verbose=True)
unittest.main(argv=[''], verbosity=2, exit=False)
