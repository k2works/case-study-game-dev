(ns run-cinema-predictor
  "Cinema 興行収入予測器の実行スクリプト"
  (:require [ml-tdd-project.ml.cinema-predictor :as cp]
            [tablecloth.api :as tc]))

(println "\n=== Cinema 興行収入予測器 ===\n")

;; 1. データの読み込み
(println "1. データの読み込み...")
(let [[X y] (cp/load-data "resources/data/cinema.csv")]
  (println (str "  データセットサイズ: " (tc/row-count X) " 行"))
  (println (str "  特徴量: " (vec (tc/column-names X))))
  (println (str "  目的変数の範囲: " (apply min y) " ~ " (apply max y)))

  ;; 2. データの分割（train/test split）
  (println "\n2. データの分割 (80% train, 20% test)...")
  (let [n (tc/row-count X)
        shuffled-indices (shuffle (vec (range n)))
        train-size (int (* 0.8 n))
        train-indices (vec (take train-size shuffled-indices))
        test-indices (vec (drop train-size shuffled-indices))

        X-train (tc/select-rows X train-indices)
        X-test (tc/select-rows X test-indices)
        y-train (vec (map #(nth y %) train-indices))
        y-test (vec (map #(nth y %) test-indices))]

    (println (str "  訓練データ: " (count y-train) " サンプル"))
    (println (str "  テストデータ: " (count y-test) " サンプル"))

    ;; 3. モデルの訓練
    (println "\n3. モデルの訓練...")
    (let [predictor (cp/create-predictor)
          trained-predictor (cp/train predictor X-train y-train)]
      (println "  OLS モデルの訓練が完了しました")

      ;; 4. 予測
      (println "\n4. 予測の実行...")
      (let [y-train-pred (cp/predict trained-predictor X-train)
            y-test-pred (cp/predict trained-predictor X-test)]

        ;; 5. 評価
        (println "\n5. 評価結果:")
        (let [train-metrics (cp/evaluate y-train y-train-pred)
              test-metrics (cp/evaluate y-test y-test-pred)]

          (println "\n  【訓練データ】")
          (println (str "    RMSE: " (format "%.2f" (:rmse train-metrics))))
          (println (str "    R²:   " (format "%.4f" (:r2 train-metrics))))

          (println "\n  【テストデータ】")
          (println (str "    RMSE: " (format "%.2f" (:rmse test-metrics))))
          (println (str "    R²:   " (format "%.4f" (:r2 test-metrics))))

          ;; 6. サンプル予測の表示
          (println "\n6. サンプル予測 (テストデータから5件):")
          (println "  実際値 | 予測値 | 誤差")
          (println "  -------|--------|-------")
          (doseq [i (take 5 (range (count y-test)))]
            (let [actual (nth y-test i)
                  predicted (nth y-test-pred i)
                  error (- actual predicted)]
              (println (format "  %7.1f | %6.1f | %6.1f"
                              actual predicted error)))))))))

(println "\n完了！")
