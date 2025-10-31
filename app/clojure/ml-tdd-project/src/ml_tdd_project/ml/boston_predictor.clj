(ns ml-tdd-project.ml.boston-predictor
  "Boston 住宅価格予測器モジュール"
  (:require [tablecloth.api :as tc]
            [tech.v3.datatype.functional :as dfn]
            [clojure.java.io :as io])
  (:import [smile.regression OLS]))

(defn create-predictor
  "予測器を作成する
   Returns: 予測器マップ {:model OLS}"
  []
  {:model nil})

(defn encode-categorical
  "CRIME をダミー変数に変換
   Args:
     dataset: 元の DataFrame
   Returns:
     CRIME がダミー変数化された DataFrame
   Note:
     CRIME_low と CRIME_high の2列を作成
     very_low は両方が 0 で表現（多重共線性回避）"
  [dataset]
  (let [crime-col (tc/column dataset :CRIME)
        ;; CRIME_low: low の場合 1, それ以外 0
        crime-low (mapv #(if (= % "low") 1 0) crime-col)
        ;; CRIME_high: high の場合 1, それ以外 0
        crime-high (mapv #(if (= % "high") 1 0) crime-col)
        ;; CRIME 列を削除
        dataset-without-crime (tc/drop-columns dataset [:CRIME])]
    ;; ダミー変数を追加
    (-> dataset-without-crime
        (tc/add-column :CRIME_low crime-low)
        (tc/add-column :CRIME_high crime-high))))

(defn- validate-dataset
  "データセットの妥当性を検証"
  [dataset]
  (let [required-columns [:CRIME :ZN :INDUS :CHAS :NOX :RM :AGE :DIS :RAD :TAX :PTRATIO :B :LSTAT :PRICE]
        actual-columns (set (tc/column-names dataset))
        missing-columns (remove actual-columns required-columns)]
    (when (seq missing-columns)
      (throw (IllegalArgumentException.
              (str "Missing columns: " missing-columns))))))

(defn- fill-missing-values
  "欠損値を平均値で補完"
  [dataset columns]
  (reduce (fn [ds col]
            (let [col-data (tc/column ds col)
                  non-nil-data (remove nil? col-data)]
              (if (< (count non-nil-data) (count col-data))
                (let [mean-val (dfn/mean non-nil-data)
                      filled-data (mapv #(if (nil? %) mean-val %) col-data)]
                  (tc/add-or-replace-column ds col filled-data))
                ds)))
          dataset
          columns))

(defn load-data
  "CSV ファイルからデータを読み込む
   Args:
     file-path: CSV ファイルのパス
   Returns:
     [特徴量 DataFrame, 目的変数ベクトル]
   Raises:
     FileNotFoundException: ファイルが存在しない場合
     IllegalArgumentException: データの形式が不正な場合"
  [file-path]
  (when-not (.exists (io/file file-path))
    (throw (java.io.FileNotFoundException. (str "File not found: " file-path))))

  (let [dataset (tc/dataset file-path {:key-fn keyword})
        _ (validate-dataset dataset)
        ;; 数値列の欠損値を補完
        numeric-cols [:ZN :INDUS :CHAS :NOX :RM :AGE :DIS :RAD :TAX :PTRATIO :B :LSTAT]
        dataset-filled (fill-missing-values dataset numeric-cols)
        ;; CRIME カテゴリカル変数をダミー変数化
        dataset-encoded (encode-categorical dataset-filled)
        ;; 特徴量列（PRICE と元の CRIME を除く）
        feature-cols [:ZN :INDUS :CHAS :NOX :RM :AGE :DIS :RAD :TAX :PTRATIO :B :LSTAT :CRIME_low :CRIME_high]
        X (tc/select-columns dataset-encoded feature-cols)
        y (vec (tc/column dataset-encoded :PRICE))]
    [X y]))

(defn- dataset->array
  "DataFrame を 2D 配列に変換"
  [df]
  (let [rows (tc/rows df :as-double-arrays)]
    (into-array (Class/forName "[D") rows)))

(defn train
  "予測器を訓練する
   Args:
     predictor: 予測器マップ
     X: 特徴量 DataFrame
     y: 目的変数ベクトル
   Returns:
     訓練済み予測器マップ"
  [predictor X y]
  (let [X-array (dataset->array X)
        y-array (double-array y)
        model (OLS. X-array y-array)]
    (assoc predictor :model model)))

(defn predict
  "訓練済み予測器で予測を行う
   Args:
     predictor: 訓練済み予測器マップ
     X: 特徴量 DataFrame
   Returns:
     予測値のベクトル"
  [predictor X]
  (let [model (:model predictor)
        X-array (dataset->array X)]
    (vec (map #(.predict model %) X-array))))

(defn evaluate
  "予測結果を評価する
   Args:
     y-true: 実際の値のベクトル
     y-pred: 予測値のベクトル
   Returns:
     評価メトリクスのマップ {:rmse double :r2 double}"
  [y-true y-pred]
  (let [n (count y-true)
        ;; RMSE (Root Mean Squared Error) の計算
        squared-errors (map #(* (- %1 %2) (- %1 %2)) y-true y-pred)
        mse (/ (reduce + squared-errors) n)
        rmse (Math/sqrt mse)
        ;; R² (Coefficient of Determination) の計算
        y-mean (/ (reduce + y-true) n)
        ss-total (reduce + (map #(* (- % y-mean) (- % y-mean)) y-true))
        ss-residual (reduce + squared-errors)
        r2 (- 1.0 (/ ss-residual ss-total))]
    {:rmse rmse
     :r2 r2}))
