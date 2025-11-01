(ns ml-tdd-project.ml.cinema-predictor-test
  "Cinema 予測器のテスト"
  (:require [clojure.test :refer [deftest is testing]]
            [ml-tdd-project.ml.cinema-predictor :as cp]
            [tablecloth.api :as tc]
            [clojure.java.io :as io]))

(deftest test-create-predictor
  (testing "予測器の初期化"
    (testing "デフォルトパラメータでの初期化"
      (let [predictor (cp/create-predictor)]
        (is (some? predictor))
        (is (nil? (:model predictor)))))

    (testing "初期化時の属性確認"
      (let [predictor (cp/create-predictor)]
        (is (contains? predictor :model))
        (is (nil? (:model predictor)))))))

(deftest test-load-data
  (testing "データ読み込み"
    (testing "CSV ファイルからのデータ読み込み"
      (let [[X y] (cp/load-data "resources/data/cinema.csv")]
        (is (some? X))
        (is (some? y))
        (is (tc/dataset? X))
        (is (vector? y))))

    (testing "特徴量の列数確認"
      (let [[X _] (cp/load-data "resources/data/cinema.csv")]
        (is (= 4 (tc/column-count X)))
        (is (= [:SNS1 :SNS2 :actor :original]
               (tc/column-names X)))))

    (testing "欠損値の補完"
      (let [test-data "cinema_id,SNS1,SNS2,actor,original,sales\n1,100,500,200,1,10000\n2,,600,250,0,11000\n3,150,,300,1,12000"
            temp-file (java.io.File/createTempFile "test-cinema" ".csv")]
        (try
          (spit temp-file test-data)
          (let [[X _] (cp/load-data (.getPath temp-file) {:remove-outliers? false})]
            ;; 欠損値が補完されていることを確認
            (is (every? some? (mapcat vals (tc/rows X :as-maps)))))
          (finally
            (.delete temp-file)))))

    (testing "目的変数の分離"
      (let [[X y] (cp/load-data "resources/data/cinema.csv")]
        (is (not (contains? (set (tc/column-names X)) :sales)))
        (is (vector? y))))))

(deftest test-remove-outliers
  (testing "外れ値除外"
    (testing "外れ値の検出"
      (let [df (tc/dataset {:cinema_id [1 2 3]
                            :SNS1 [100.0 150.0 120.0]
                            :SNS2 [500.0 1500.0 600.0]  ; 1500 が異常に高い
                            :actor [200.0 250.0 220.0]
                            :original [1 0 1]
                            :sales [10000.0 3000.0 11000.0]})  ; SNS2高いのに sales低い→外れ値
            df-cleaned (cp/remove-outliers df)]
        ;; 外れ値が除外されていることを確認
        (is (= 2 (tc/row-count df-cleaned)))
        (is (not (some #(= 1500.0 %) (tc/column df-cleaned :SNS2))))))

    (testing "正常データは保持される"
      (let [df (tc/dataset {:cinema_id [1 2 3]
                            :SNS1 [100.0 150.0 120.0]
                            :SNS2 [500.0 600.0 550.0]
                            :actor [200.0 250.0 220.0]
                            :original [1 0 1]
                            :sales [10000.0 11000.0 10500.0]})
            df-cleaned (cp/remove-outliers df)]
        ;; 全てのデータが保持される
        (is (= 3 (tc/row-count df-cleaned)))))

    (testing "外れ値除外の基準"
      (let [df (tc/dataset {:cinema_id [1 2 3 4]
                            :SNS1 [100.0 150.0 120.0 140.0]
                            :SNS2 [500.0 1500.0 600.0 700.0]
                            :actor [200.0 250.0 220.0 230.0]
                            :original [1 0 1 0]
                            :sales [10000.0 3000.0 11000.0 10500.0]})
            df-cleaned (cp/remove-outliers df)]
        ;; SNS2 > 1000 かつ sales < 8500 のデータが除外される
        (doseq [row (tc/rows df-cleaned :as-maps)]
          (when (> (:SNS2 row) 1000)
            (is (>= (:sales row) 8500))))))))

(deftest test-train
  (testing "モデルの訓練"
    (testing "OLS モデルの学習"
      (let [[X y] (cp/load-data "resources/data/cinema.csv")
            predictor (cp/create-predictor)
            trained-predictor (cp/train predictor X y)]
        ;; モデルが訓練されていることを確認
        (is (some? (:model trained-predictor)))
        (is (not (nil? (:model trained-predictor))))))

    (testing "訓練後のモデル属性"
      (let [[X y] (cp/load-data "resources/data/cinema.csv")
            predictor (cp/create-predictor)
            trained-predictor (cp/train predictor X y)]
        ;; モデルのタイプ確認
        (is (instance? smile.regression.OLS (:model trained-predictor)))))))

(deftest test-predict
  (testing "予測"
    (testing "訓練データでの予測"
      (let [[X y] (cp/load-data "resources/data/cinema.csv")
            predictor (cp/create-predictor)
            trained-predictor (cp/train predictor X y)
            predictions (cp/predict trained-predictor X)]
        ;; 予測結果が返されることを確認
        (is (some? predictions))
        (is (vector? predictions))
        (is (= (count predictions) (count y)))))

    (testing "予測値の型"
      (let [[X y] (cp/load-data "resources/data/cinema.csv")
            predictor (cp/create-predictor)
            trained-predictor (cp/train predictor X y)
            predictions (cp/predict trained-predictor X)]
        ;; すべての予測値が数値であることを確認
        (is (every? number? predictions))))))

(deftest test-evaluate
  (testing "評価"
    (testing "RMSE と R² の計算"
      (let [[X y] (cp/load-data "resources/data/cinema.csv")
            predictor (cp/create-predictor)
            trained-predictor (cp/train predictor X y)
            predictions (cp/predict trained-predictor X)
            metrics (cp/evaluate y predictions)]
        ;; メトリクスが返されることを確認
        (is (some? metrics))
        (is (contains? metrics :rmse))
        (is (contains? metrics :r2))))

    (testing "メトリクスの値の範囲"
      (let [[X y] (cp/load-data "resources/data/cinema.csv")
            predictor (cp/create-predictor)
            trained-predictor (cp/train predictor X y)
            predictions (cp/predict trained-predictor X)
            metrics (cp/evaluate y predictions)]
        ;; RMSE は正の値
        (is (>= (:rmse metrics) 0))
        ;; R² は通常 0 から 1 の範囲（訓練データなので高い値が期待される）
        (is (>= (:r2 metrics) 0))
        (is (<= (:r2 metrics) 1))))))
