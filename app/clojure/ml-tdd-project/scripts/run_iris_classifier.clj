#!/usr/bin/env clojure

(require '[clojure.java.io :as io])
(require '[ml-tdd-project.ml.iris-classifier :as iris])
(require '[tablecloth.api :as tc])

(println "=== Iris 分類器の実行 ===\n")

;; データの読み込み
(println "1. データ読み込み中...")
(def dataset (iris/load-data "resources/data/iris.csv"))
(println (str "   - 読み込んだデータ行数: " (tc/row-count dataset)))
(println (str "   - 列数: " (tc/column-count dataset)))

;; データを訓練用とテスト用に分割（80% 訓練、20% テスト）
;; シャッフルしてからランダムに分割
(println "\n2. データ分割中...")
(def shuffled-indices (shuffle (vec (range (tc/row-count dataset)))))
(def train-size (int (* 0.8 (tc/row-count dataset))))
(def train-indices (vec (take train-size shuffled-indices)))
(def test-indices (vec (drop train-size shuffled-indices)))
(def train-data (tc/select-rows dataset train-indices))
(def test-data (tc/select-rows dataset test-indices))
(println (str "   - 訓練データ: " (tc/row-count train-data) " 行"))
(println (str "   - テストデータ: " (tc/row-count test-data) " 行"))

;; 分類器の作成
(println "\n3. 分類器作成中...")
(def classifier (iris/create-classifier {:max-nodes 20}))
(println (str "   - 最大ノード数: " (:max-nodes classifier)))

;; モデルの訓練
(println "\n4. モデル訓練中...")
(def trained-classifier (iris/train classifier train-data))
(println "   - 訓練完了")

;; テストデータでの予測
(println "\n5. 予測実行中...")
(def predictions (iris/predict trained-classifier test-data))
(def actual-labels (vec (tc/column test-data :species)))
(println (str "   - 予測数: " (count predictions)))

;; 結果表示
(println "\n6. 予測結果（最初の10件）:")
(doseq [i (range (min 10 (count predictions)))]
  (let [pred (nth predictions i)
        actual (nth actual-labels i)
        match (if (= pred actual) "✓" "✗")]
    (println (str "   " (inc i) ". 予測: " pred
                  ", 実際: " actual
                  " " match))))

;; モデルの評価
(println "\n7. モデル評価中...")
(def accuracy (iris/evaluate trained-classifier test-data))
(println (str "   - 正解率: " (format "%.2f" (* 100 accuracy)) "%"))

;; 混同行列の作成
(println "\n8. 混同行列:")
(def species-names (sort (distinct actual-labels)))
(def confusion-matrix
  (reduce (fn [m [pred actual]]
            (update m [actual pred] (fnil inc 0)))
          {}
          (map vector predictions actual-labels)))

(print "           ")
(doseq [s species-names]
  (print (format "%-12s" s)))
(println)
(doseq [actual species-names]
  (print (format "%-10s " actual))
  (doseq [pred species-names]
    (print (format "%-12d" (get confusion-matrix [actual pred] 0))))
  (println))

(println "\n=== 実行完了 ===")
