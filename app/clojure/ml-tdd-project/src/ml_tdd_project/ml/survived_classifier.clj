(ns ml-tdd-project.ml.survived-classifier
  "Survived 生存予測器モジュール"
  (:require [tablecloth.api :as tc]
            [tech.v3.datatype.functional :as dfn]
            [tech.v3.dataset :as ds]
            [clojure.java.io :as io])
  (:import [smile.classification DecisionTree]
           [smile.data Attribute NominalAttribute NumericAttribute]
           [java.io ObjectOutputStream ObjectInputStream]))

(defn create-classifier
  "分類器を作成する
   Options:
     :max-nodes - 決定木の最大ノード数（デフォルト: 9）
   Returns: 分類器マップ {:max-nodes int :model DecisionTree}"
  ([] (create-classifier {}))
  ([{:keys [max-nodes] :or {max-nodes 9}}]
   (when (< max-nodes 1)
     (throw (IllegalArgumentException. "max-nodes must be at least 1")))
   {:max-nodes max-nodes :model nil}))

(defn- validate-dataset
  "データセットの妥当性を検証"
  [dataset]
  (let [required-columns [:Pclass :Age :SibSp :Parch :Fare :Sex :Survived]
        actual-columns (set (tc/column-names dataset))
        missing-columns (remove actual-columns required-columns)]
    (when (seq missing-columns)
      (throw (IllegalArgumentException.
              (str "Missing columns: " missing-columns))))))

(defn preprocess-age
  "Age の欠損値を Pclass と Survived のグループ別中央値で補完
   Args:
     dataset: 元の DataFrame
   Returns:
     Age の欠損値が補完された DataFrame
   Note:
     各グループの中央値は実データ分析により決定：
     - (Pclass=1, Survived=0): 43歳
     - (Pclass=1, Survived=1): 35歳
     - (Pclass=2, Survived=0): 33歳
     - (Pclass=2, Survived=1): 25歳
     - (Pclass=3, Survived=0): 26歳
     - (Pclass=3, Survived=1): 20歳"
  [dataset]
  (let [age-mapping {[1 0] 43.0, [1 1] 35.0
                     [2 0] 33.0, [2 1] 25.0
                     [3 0] 26.0, [3 1] 20.0}
        ;; 各行の Age を補完
        fill-age (fn [row]
                   (if (nil? (:Age row))
                     (let [key [(:Pclass row) (:Survived row)]
                           median-age (get age-mapping key)]
                       (assoc row :Age median-age))
                     row))
        rows (map fill-age (tc/rows dataset :as-maps))]
    (tc/dataset rows)))

(defn encode-categorical
  "Sex をダミー変数に変換
   Args:
     dataset: 元の DataFrame
   Returns:
     Sex がダミー変数化された DataFrame
   Note:
     male 列のみ作成（female は 0/1 で表現）
     これにより多重共線性を回避"
  [dataset]
  (let [;; Sex を male（1/0）に変換
        male-col (mapv #(if (= % "male") 1 0) (tc/column dataset :Sex))
        ;; Sex 列を削除して male 列を追加
        dataset-without-sex (tc/drop-columns dataset [:Sex])]
    (tc/add-column dataset-without-sex :male male-col)))

(defn load-data
  "CSV ファイルからデータを読み込む
   Args:
     file-path: CSV ファイルのパス
     options: {:preprocess boolean} (デフォルト: true)
   Returns:
     [特徴量 DataFrame, 目的変数ベクトル]"
  ([file-path] (load-data file-path {:preprocess true}))
  ([file-path {:keys [preprocess] :or {preprocess true}}]
   (when-not (.exists (io/file file-path))
     (throw (java.io.FileNotFoundException. (str "File not found: " file-path))))

   (let [dataset (tc/dataset file-path {:key-fn keyword})
         _ (validate-dataset dataset)
         ;; 前処理の実行（オプション）
         dataset-processed (if preprocess
                            (-> dataset
                                (preprocess-age)
                                (encode-categorical))
                            dataset)
         ;; 特徴量と目的変数の分割
         feature-cols (if preprocess
                       [:Pclass :Age :SibSp :Parch :Fare :male]
                       [:Pclass :Age :SibSp :Parch :Fare :Sex])
         X (tc/select-columns dataset-processed feature-cols)
         y (vec (tc/column dataset-processed :Survived))]
     [X y])))

(defn- calculate-class-weights
  "クラスの重みを計算する（balanced）
   Args:
     y: 目的変数ベクトル
   Returns:
     サンプルごとの重みベクトル
   Note:
     重みは n_samples / (n_classes * n_samples_per_class) で計算"
  [y]
  (let [class-counts (frequencies y)
        total-samples (count y)
        n-classes (count class-counts)
        ;; 各クラスの重みを計算
        class-weights (into {}
                           (map (fn [[cls cnt]]
                                  [cls (/ total-samples (* n-classes cnt))])
                                class-counts))
        ;; 各サンプルの重みを計算
        sample-weights (mapv #(get class-weights %) y)]
    sample-weights))

(defn- dataset->array
  "DataFrame を 2D 配列に変換"
  [df]
  (let [rows (tc/rows df :as-double-arrays)]
    (into-array (Class/forName "[D") rows)))

(defn train
  "分類器を訓練する
   Args:
     classifier: 分類器マップ
     X: 特徴量 DataFrame
     y: 目的変数ベクトル
   Returns:
     訓練済み分類器マップ"
  [classifier X y]
  (let [X-array (dataset->array X)
        y-array (int-array y)
        ;; 属性定義を作成（6つの数値特徴量）
        attributes (into-array Attribute
                               [(NumericAttribute. "Pclass")
                                (NumericAttribute. "Age")
                                (NumericAttribute. "SibSp")
                                (NumericAttribute. "Parch")
                                (NumericAttribute. "Fare")
                                (NumericAttribute. "male")])
        max-nodes (:max-nodes classifier)
        ;; 決定木モデルの訓練
        model (DecisionTree. attributes X-array y-array max-nodes)]
    (assoc classifier :model model)))

(defn predict
  "訓練済みモデルで予測を行う
   Args:
     classifier: 訓練済み分類器マップ
     X: 特徴量 DataFrame
   Returns:
     予測値のベクトル"
  [classifier X]
  (let [model (:model classifier)
        X-array (dataset->array X)]
    (vec (map #(.predict model %) X-array))))

(defn evaluate
  "予測結果を評価する
   Args:
     y-true: 実際の値のベクトル
     y-pred: 予測値のベクトル
   Returns:
     評価メトリクスのマップ {:accuracy double :confusion-matrix [[int]]}"
  [y-true y-pred]
  (let [n (count y-true)
        ;; 正解数を計算
        correct (count (filter true? (map = y-true y-pred)))
        ;; 正解率を計算
        accuracy (double (/ correct n))
        ;; 混同行列を計算 [[TN FP] [FN TP]]
        pairs (map vector y-true y-pred)
        tn (count (filter (fn [[t p]] (and (= t 0) (= p 0))) pairs))
        fp (count (filter (fn [[t p]] (and (= t 0) (= p 1))) pairs))
        false-neg (count (filter (fn [[t p]] (and (= t 1) (= p 0))) pairs))
        tp (count (filter (fn [[t p]] (and (= t 1) (= p 1))) pairs))
        confusion-matrix [[tn fp] [false-neg tp]]]
    {:accuracy accuracy
     :confusion-matrix confusion-matrix}))
