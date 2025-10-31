#!/usr/bin/env clojure

(require '[clojure.java.io :as io])
(require '[ml-tdd-project.ml.boston-predictor :as boston])
(require '[tablecloth.api :as tc])

(println "=== Boston 住宅価格予測器の実行 ===\n")

;; データの読み込み
(println "1. データ読み込み中...")
(def data-path "resources/data/Boston.csv")
(def loaded-data (boston/load-data data-path))
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

;; 予測器の作成
(println "\n3. 予測器作成中...")
(def predictor (boston/create-predictor))
(println "   - 線形回帰モデル（OLS）")

;; モデルの訓練
(println "\n4. モデル訓練中...")
(def trained-predictor (boston/train predictor X-train y-train))
(println "   - 訓練完了")

;; テストデータでの予測
(println "\n5. 予測実行中...")
(def predictions (boston/predict trained-predictor X-test))
(println (str "   - 予測数: " (count predictions)))

;; 結果表示
(println "\n6. 予測結果（最初の10件）:")
(doseq [i (range (min 10 (count predictions)))]
  (let [pred (nth predictions i)
        actual (nth y-test i)
        error (Math/abs (- pred actual))]
    (println (str "   " (inc i) ". 予測: " (format "%.1f" pred)
                  ", 実際: " (format "%.1f" actual)
                  ", 誤差: " (format "%.1f" error)))))

;; モデルの評価
(println "\n7. モデル評価中...")
(def metrics (boston/evaluate y-test predictions))
(println (str "   - RMSE: " (format "%.2f" (:rmse metrics))))
(println (str "   - R²: " (format "%.4f" (:r2 metrics))))

;; 予測値の統計
(println "\n8. 予測値の統計:")
(def pred-min (apply min predictions))
(def pred-max (apply max predictions))
(def pred-mean (/ (reduce + predictions) (count predictions)))
(println (str "   - 最小値: " (format "%.1f" pred-min)))
(println (str "   - 最大値: " (format "%.1f" pred-max)))
(println (str "   - 平均値: " (format "%.1f" pred-mean)))

;; 実際の値の統計
(println "\n9. 実際の値の統計:")
(def actual-min (apply min y-test))
(def actual-max (apply max y-test))
(def actual-mean (/ (reduce + y-test) (count y-test)))
(println (str "   - 最小値: " (format "%.1f" actual-min)))
(println (str "   - 最大値: " (format "%.1f" actual-max)))
(println (str "   - 平均値: " (format "%.1f" actual-mean)))

(println "\n=== 実行完了 ===")
