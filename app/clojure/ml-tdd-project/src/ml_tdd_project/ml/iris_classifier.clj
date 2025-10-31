(ns ml-tdd-project.ml.iris-classifier
  "Iris データセットを分類する決定木モデル"
  (:require [tablecloth.api :as tc]
            [tech.v3.datatype.functional :as dfn])
  (:import [smile.classification DecisionTree]
           [smile.data Attribute NominalAttribute NumericAttribute]))

(defn create-classifier
  "分類器を作成する

   Args:
     opts: オプションマップ
       :max-nodes - 決定木の最大ノード数（デフォルト: 2）

   Returns:
     分類器マップ

   Raises:
     IllegalArgumentException - max-nodes が 1 未満の場合"
  ([]
   (create-classifier {}))
  ([{:keys [max-nodes] :or {max-nodes 2}}]
   (when (< max-nodes 1)
     (throw (IllegalArgumentException. "max-nodes must be at least 1")))
   {:max-nodes max-nodes
    :model nil}))

;; ステップ2: データ読み込みと前処理

(defn- validate-dataset
  "データセットの妥当性を検証

   Args:
     dataset: 検証する dataset

   Raises:
     IllegalArgumentException - 必要な列が不足している場合"
  [dataset]
  (let [required-columns #{:sepal-length :sepal-width
                           :petal-length :petal-width :species}
        actual-columns (set (tc/column-names dataset))
        missing-columns (clojure.set/difference required-columns actual-columns)]
    (when (seq missing-columns)
      (throw (IllegalArgumentException.
              (str "Missing columns: " missing-columns))))))

(defn fill-missing-values
  "欠損値を平均値で補完する

   Args:
     dataset: tablecloth dataset
     columns: 補完する列のベクトル（省略時は全数値列）

   Returns:
     補完後の dataset"
  ([dataset]
   (fill-missing-values dataset [:sepal-length :sepal-width
                                  :petal-length :petal-width]))
  ([dataset columns]
   (reduce (fn [ds col]
             (if (tc/has-column? ds col)
               (let [mean-val (dfn/mean (tc/column ds col))]
                 (tc/replace-missing ds col mean-val))
               ds))
           dataset
           columns)))

(defn load-data
  "CSV ファイルからデータを読み込む

   Args:
     file-path: CSV ファイルのパス

   Returns:
     tablecloth dataset

   Raises:
     Exception - ファイルが存在しない、またはデータの形式が不正な場合"
  [file-path]
  (when-not (.exists (clojure.java.io/file file-path))
    (throw (java.io.FileNotFoundException. (str "File not found: " file-path))))

  (let [dataset (tc/dataset file-path {:key-fn keyword})]
    (validate-dataset dataset)
    (fill-missing-values dataset)))

;; ステップ3: モデル訓練

(defn train
  "モデルを訓練する

   Args:
     classifier: 分類器マップ
     dataset: 訓練用データセット（tablecloth dataset）

   Returns:
     訓練済みモデルを含む分類器マップ

   Raises:
     IllegalArgumentException - データが空、または形式が不正な場合"
  [classifier dataset]
  ;; データの妥当性チェック
  (when (zero? (tc/row-count dataset))
    (throw (IllegalArgumentException. "Training data cannot be empty")))

  (validate-dataset dataset)

  ;; 特徴量列
  (let [feature-cols [:sepal-length :sepal-width :petal-length :petal-width]
        ;; データを行のマップとして取得
        rows (tc/rows dataset :as-maps)
        ;; 特徴量を 2次元配列に変換
        X (into-array (Class/forName "[D")
                      (map (fn [row]
                             (double-array (mapv row feature-cols)))
                           rows))
        ;; ラベルを String から整数にマッピング
        species-list (vec (tc/column dataset :species))
        unique-species (vec (distinct species-list))
        species-to-int (zipmap unique-species (range))
        ;; ラベルを整数配列に変換
        y (int-array (map species-to-int species-list))
        ;; 属性定義を作成（4つの数値特徴量）
        attributes (into-array Attribute
                               [(NumericAttribute. "sepal-length")
                                (NumericAttribute. "sepal-width")
                                (NumericAttribute. "petal-length")
                                (NumericAttribute. "petal-width")])
        max-nodes (:max-nodes classifier 2)
        ;; 決定木モデルの訓練（コンストラクタを使用）
        model (DecisionTree. attributes X y max-nodes)]
    (assoc (assoc classifier :model model)
           :species-mapping (zipmap (range) unique-species))))

;; ステップ4: 予測

(defn predict
  "予測を実行する

   Args:
     classifier: 訓練済み分類器マップ
     dataset: テスト用データセット（tablecloth dataset）

   Returns:
     予測されたクラスラベルのベクトル

   Raises:
     IllegalStateException - モデルが未訓練の場合"
  [classifier dataset]
  (when (nil? (:model classifier))
    (throw (IllegalStateException. "Model has not been trained yet")))

  (let [feature-cols [:sepal-length :sepal-width :petal-length :petal-width]
        ;; データを行のマップとして取得
        rows (tc/rows dataset :as-maps)
        ;; 特徴量を 2次元配列に変換
        X (into-array (map (fn [row]
                             (double-array (mapv row feature-cols)))
                           rows))
        model (:model classifier)
        species-mapping (:species-mapping classifier)
        ;; 予測（整数を返す）
        int-predictions (.predict model X)]
    ;; 整数を元のラベルに戻す
    (vec (map #(get species-mapping %) int-predictions))))

;; ステップ5: モデル評価

(defn evaluate
  "モデルの正解率を計算する

   Args:
     classifier: 訓練済み分類器マップ
     test-dataset: テスト用データセット（species 列を含む）

   Returns:
     正解率（0.0 〜 1.0）

   Raises:
     IllegalStateException - モデルが未訓練の場合"
  [classifier test-dataset]
  (let [predictions (predict classifier test-dataset)
        actual-labels (vec (tc/column test-dataset :species))
        correct-count (count (filter true? (map = predictions actual-labels)))
        total-count (count predictions)]
    (if (zero? total-count)
      0.0
      (double (/ correct-count total-count)))))
