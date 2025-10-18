import pickle
import pandas as pd
import seaborn as sns
from sklearn import tree
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import os
path = os.path.dirname(os.path.abspath(__file__))


class CategoricalData:
    def __init__(self, df, col) -> None:
        self.df = df
        self.col = col

    def show(self):
        """カテゴリーデータの値の数を確認"""
        return self.df[self.col].value_counts()

    def plot(self):
        """カテゴリーデータの値の数を棒グラフで確認"""
        return self.df[self.col].value_counts().plot(kind='bar')

    def convert(self):
        """カテゴリーデータを数値に変換"""
        from sklearn.preprocessing import LabelEncoder

        encoder = LabelEncoder()
        return encoder.fit_transform(self.df[self.col])

    def pivot(self, index, value):
        """ピボットテーブルによる集計"""
        return self.df.pivot_table(index=index, columns=self.col, values=value, aggfunc='count')

    def dummy(self):
        """ダミー変数化"""
        return pd.get_dummies(self.df, columns=[self.col])


class DataVisualization:
    def __init__(self, df) -> None:
        self.df = df

    def df_hist(self):
        """データフレームのヒストグラム表示"""
        return self.df.hist(figsize=(12, 12))

    def df_scatter(self):
        """データフレームの散布図表示"""
        return pd.plotting.scatter_matrix(self.df, figsize=(12, 12))

    def df_box(self):
        """データフレームの箱ひげ図表示"""
        return self.df.boxplot(figsize=(12, 12))

    def df_pairplot(self, hue=None):
        """データフレームのペアプロット表示"""
        return sns.pairplot(self.df, hue=hue)

    def df_all(self, hue):
        """データフレームの全ての表示"""
        self.df_hist()
        self.df_scatter()
        self.df_box()
        self.df_pairplot(hue)


def convert_categoricals(df, cols):
    df_conv = df.copy()
    for c in cols:
        df_conv[c] = CategoricalData(df_conv, c).convert()
    return df_conv


def learn(x, t, depth=3):
    x_train, x_test, y_train, y_test = train_test_split(
        x, t, test_size=0.2, random_state=0)
    model = tree.DecisionTreeClassifier(
        max_depth=depth, random_state=0, class_weight='balanced')
    model.fit(x_train, y_train)

    score = model.score(x_train, y_train)
    score2 = model.score(x_test, y_test)
    return round(score, 3), round(score2, 3), model


def learn_with_std(x, t):
    x_train, x_val, y_train, y_val = train_test_split(
        x, t, test_size=0.2, random_state=0)
    # 訓練データを標準化
    sc_model_x = StandardScaler()
    sc_model_y = StandardScaler()
    sc_model_x.fit(x_train)
    sc_x_train = sc_model_x.transform(x_train)
    sc_model_y.fit(y_train)
    sc_y_train = sc_model_y.transform(y_train)
    # 学習
    model = LinearRegression()
    model.fit(sc_x_train, sc_y_train)

    # 検証データを標準化
    sc_x_val = sc_model_x.transform(x_val)
    sc_y_val = sc_model_y.transform(y_val)
    # 訓練データと検証データの決定係数計算
    train_score = model.score(sc_x_train, sc_y_train)
    val_score = model.score(sc_x_val, sc_y_val)

    return train_score, val_score


class Iris:
    def __init__(self) -> None:
        self.load()

    def load(self):
        with open(file=path + '/model/iris.pkl', mode='rb') as f:
            self.model = pickle.load(f)

    def predict(self, x):
        return self.model.predict(x)


class Cinema:
    def __init__(self) -> None:
        self.load()

    def load(self):
        with open(file=path + '/model/cinema.pkl', mode='rb') as f:
            self.model = pickle.load(f)

    def predict(self, x):
        return self.model.predict(x)


class Survived:
    def __init__(self) -> None:
        self.load()

    def load(self):
        with open(file=path + '/model/survived.pkl', mode='rb') as f:
            self.model = pickle.load(f)

    def predict(self, x):
        return self.model.predict(x)


class Boston:
    def __init__(self) -> None:
        self.load()

    def load(self):
        with open(file=path + '/model/boston.pkl', mode='rb') as f:
            self.model = pickle.load(f)
        with open(file=path + '/model/boston_scx.pkl', mode='rb') as f:
            self.model_scx = pickle.load(f)
        with open(file=path + '/model/boston_scy.pkl', mode='rb') as f:
            self.model_scy = pickle.load(f)

    def predict(self, rm, lstat, ptratio):
        rm2 = rm ** 2
        lstat2 = lstat ** 2
        ptratio2 = ptratio ** 2
        rm_lstat = rm * lstat
        x_test = [[rm, lstat, ptratio, rm2, lstat2, ptratio2, rm_lstat]]
        sc_x_test = self.model_scx.transform(x_test)
        result = self.model.predict(sc_x_test)

        return result
