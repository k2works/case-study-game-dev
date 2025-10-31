#!/usr/bin/env clojure

(require '[clojure.java.io :as io])
(require '[ml-tdd-project.ml.survived-classifier :as survived])
(require '[tablecloth.api :as tc])

(println "=== Survived 生存予測器の実行 ===\n")

;; データの読み込み
(println "1. データ読み込み中...")
(def data-path "resources/data/Survived.csv")
(def loaded-data (survived/load-data data-path))
(def X (first loaded-data))
(def y (second loaded-data))
(println (str "   - 読み込んだデータ行数: " (tc/row-count X)))
(println (str "   - 特徴量数: " (tc/column-count X)))
(println (str "   - 特徴量: " (tc/column-names X)))

;; データを訓練用とテスト用に分割（80% 訓練、20% テスト）
(println "\n2. データ分割中...")
(def total-rows (tc/row-count X))
(def shuffled-indices (shuffle (vec (range total-rows))))
(def train-size (int (* 0.8 total-rows)))
(def train-indices (vec (take train-size shuffled-indices)))
(def test-indices (vec (drop train-size shuffled-indices)))
(def X-train (tc/select-rows X train-indices))
(def y-train (vec (map #(nth y %) train-indices)))
(def X-test (tc/select-rows X test-indices))
(def y-test (vec (map #(nth y %) test-indices)))
(println (str "   - 訓練データ: " (count y-train) " 行"))
(println (str "   - テストデータ: " (count y-test) " 行"))

;; 分類器の作成
(println "\n3. 分類器作成中...")
(def classifier (survived/create-classifier {:max-nodes 9}))
(println (str "   - 最大ノード数: " (:max-nodes classifier)))

;; モデルの訓練
(println "\n4. モデル訓練中...")
(def trained-classifier (survived/train classifier X-train y-train))
(println "   - 訓練完了")

;; テストデータでの予測
(println "\n5. 予測実行中...")
(def predictions (survived/predict trained-classifier X-test))
(println (str "   - 予測数: " (count predictions)))

;; 結果表示
(println "\n6. 予測結果（最初の10件）:")
(doseq [i (range (min 10 (count predictions)))]
  (let [pred (nth predictions i)
        actual (nth y-test i)
        match (if (= pred actual) "✓" "✗")
        label-pred (if (= pred 1) "生存" "死亡")
        label-actual (if (= actual 1) "生存" "死亡")]
    (println (str "   " (inc i) ". 予測: " label-pred
                  ", 実際: " label-actual
                  " " match))))

;; モデルの評価
(println "\n7. モデル評価中...")
(def metrics (survived/evaluate y-test predictions))
(println (str "   - 正解率: " (format "%.2f" (* 100 (:accuracy metrics))) "%"))

;; 混同行列の表示
(println "\n8. 混同行列:")
(def cm (:confusion-matrix metrics))
(def tn (get-in cm [0 0]))
(def fp (get-in cm [0 1]))
(def fn-val (get-in cm [1 0]))
(def tp (get-in cm [1 1]))

(println "                予測")
(println "            死亡    生存")
(println (str "実際 死亡    " (format "%4d" tn) "    " (format "%4d" fp)))
(println (str "     生存    " (format "%4d" fn-val) "    " (format "%4d" tp)))

;; 評価指標の詳細
(println "\n9. 評価指標:")
(def precision (if (= (+ tp fp) 0) 0.0 (double (/ tp (+ tp fp)))))
(def recall (if (= (+ tp fn-val) 0) 0.0 (double (/ tp (+ tp fn-val)))))
(def f1 (if (= (+ precision recall) 0) 0.0 (* 2 (/ (* precision recall) (+ precision recall)))))
(println (str "   - 適合率 (Precision): " (format "%.2f" (* 100 precision)) "%"))
(println (str "   - 再現率 (Recall):    " (format "%.2f" (* 100 recall)) "%"))
(println (str "   - F1スコア:           " (format "%.2f" (* 100 f1)) "%"))

(println "\n=== 実行完了 ===")
