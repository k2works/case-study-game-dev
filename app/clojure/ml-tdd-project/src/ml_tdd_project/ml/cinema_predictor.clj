(ns ml-tdd-project.ml.cinema-predictor
  "Cinema 興行収入予測器モジュール"
  (:require [tablecloth.api :as tc]
            [tech.v3.datatype.functional :as dfn]
            [clojure.java.io :as io])
  (:import [smile.regression OLS]))

(defn create-predictor
  "予測器を作成する
   Returns: 予測器マップ {:model OLS}"
  []
  {:model nil})

(defn- validate-dataset
  "データセットの妥当性を検証"
  [dataset]
  (let [required-columns [:SNS1 :SNS2 :actor :original :sales]
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

(defn remove-outliers
  "外れ値を除外する
   Args:
     df: 対象の DataFrame
   Returns:
     外れ値を除外した DataFrame
   Note:
     SNS2 が 1000 を超えているにも関わらず sales が 8500 未満のデータを
     異常値として除外します"
  [df]
  (tc/select-rows df
                  (fn [row]
                    (not (and (> (:SNS2 row) 1000)
                             (< (:sales row) 8500))))))

(defn load-data
  "CSV ファイルからデータを読み込む（外れ値処理追加）
   Args:
     file-path: CSV ファイルのパス
     options: オプションマップ {:remove-outliers? boolean (デフォルト: true)}
   Returns:
     [特徴量 DataFrame, 目的変数ベクトル]
   Raises:
     FileNotFoundException: ファイルが存在しない場合
     IllegalArgumentException: データの形式が不正な場合"
  ([file-path] (load-data file-path {:remove-outliers? true}))
  ([file-path {:keys [remove-outliers?] :or {remove-outliers? true}}]
   (when-not (.exists (io/file file-path))
     (throw (java.io.FileNotFoundException. (str "File not found: " file-path))))

   (let [dataset (tc/dataset file-path {:key-fn keyword})
         _ (validate-dataset dataset)
         feature-cols [:SNS1 :SNS2 :actor :original]
         dataset-filled (fill-missing-values dataset feature-cols)
         ;; 外れ値の除外（オプション）
         dataset-cleaned (if remove-outliers?
                          (remove-outliers dataset-filled)
                          dataset-filled)
         X (tc/select-columns dataset-cleaned feature-cols)
         y (vec (tc/column dataset-cleaned :sales))]
     [X y])))

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
