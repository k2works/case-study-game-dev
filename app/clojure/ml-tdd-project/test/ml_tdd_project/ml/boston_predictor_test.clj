(ns ml-tdd-project.ml.boston-predictor-test
  "Boston 予測器のテスト"
  (:require [clojure.test :refer [deftest is testing]]
            [ml-tdd-project.ml.boston-predictor :as bp]
            [tablecloth.api :as tc]
            [clojure.java.io :as io]))

(deftest test-create-predictor
  (testing "予測器の初期化"
    (testing "デフォルトパラメータでの初期化"
      (let [predictor (bp/create-predictor)]
        (is (some? predictor))
        (is (nil? (:model predictor)))))))

(deftest test-encode-categorical
  (testing "カテゴリカル変数エンコーディング"
    (testing "CRIME 列がダミー変数に変換される"
      (let [df (tc/dataset {:CRIME ["very_low" "low" "high" "very_low"]
                            :ZN [0 10 20 30]})
            df-encoded (bp/encode-categorical df)]
        (is (contains? (set (tc/column-names df-encoded)) :CRIME_low))
        (is (contains? (set (tc/column-names df-encoded)) :CRIME_high))
        (is (not (contains? (set (tc/column-names df-encoded)) :CRIME)))))

    (testing "ダミー変数の値が正しい"
      (let [df (tc/dataset {:CRIME ["very_low" "low" "high" "very_low"]})
            df-encoded (bp/encode-categorical df)
            expected-low [0 1 0 0]
            expected-high [0 0 1 0]
            actual-low (vec (tc/column df-encoded :CRIME_low))
            actual-high (vec (tc/column df-encoded :CRIME_high))]
        (is (= expected-low actual-low))
        (is (= expected-high actual-high))))

    (testing "他の列は保持される"
      (let [df (tc/dataset {:CRIME ["very_low" "low"]
                            :ZN [0 10]
                            :RM [5.5 6.0]})
            df-encoded (bp/encode-categorical df)]
        (is (contains? (set (tc/column-names df-encoded)) :ZN))
        (is (contains? (set (tc/column-names df-encoded)) :RM))
        (is (= [0 10] (vec (tc/column df-encoded :ZN))))
        (is (= [5.5 6.0] (vec (tc/column df-encoded :RM))))))))

(deftest test-load-data
  (testing "データ読み込み"
    (testing "CSV ファイルの読み込み"
      (let [test-data "CRIME,ZN,INDUS,CHAS,NOX,RM,AGE,DIS,RAD,TAX,PTRATIO,B,LSTAT,PRICE\nvery_low,0,8.14,0,0.538,5.95,82,3.99,4,307,21,232.6,27.71,13.2\nlow,0,21.89,0,0.624,6.151,97.9,1.6687,4,437,21.2,396.9,18.46,17.8\nhigh,0,18.1,0,0.614,6.98,67.6,2.5329,24,666,20.2,374.68,11.66,29.8"
            temp-file (java.io.File/createTempFile "test-boston" ".csv")]
        (try
          (spit temp-file test-data)
          (let [[X y] (bp/load-data (.getPath temp-file))]
            (is (= 3 (tc/row-count X)))
            (is (= 3 (count y)))
            (is (not (contains? (set (tc/column-names X)) :PRICE)))
            (is (not (contains? (set (tc/column-names X)) :CRIME)))
            (is (contains? (set (tc/column-names X)) :CRIME_low))
            (is (contains? (set (tc/column-names X)) :CRIME_high))
            (is (vector? y)))
          (finally
            (.delete temp-file)))))

    (testing "ファイルが存在しない場合エラー"
      (is (thrown? java.io.FileNotFoundException
                   (bp/load-data "nonexistent.csv"))))))

(deftest test-train
  (testing "モデルの訓練"
    (testing "訓練データで学習できる"
      (let [test-data "CRIME,ZN,INDUS,CHAS,NOX,RM,AGE,DIS,RAD,TAX,PTRATIO,B,LSTAT,PRICE\nvery_low,0,8.14,0,0.538,5.95,82,3.99,4,307,21,232.6,27.71,13.2\nlow,0,21.89,0,0.624,6.151,97.9,1.6687,4,437,21.2,396.9,18.46,17.8\nhigh,0,18.1,0,0.614,6.98,67.6,2.5329,24,666,20.2,374.68,11.66,29.8\nvery_low,0,5.96,0,0.499,5.966,30.2,3.8473,5,279,19.2,393.43,10.13,24.7\nlow,0,9.9,0,0.544,6.113,58.8,4.0019,4,304,18.4,396.23,12.73,21\nhigh,0,18.1,0,0.583,5.905,53.2,3.1523,24,666,20.2,388.22,11.45,20.6\nvery_low,0,7.87,0,0.524,6.009,82.9,6.2267,5,311,15.2,396.9,13.27,18.9\nlow,0,6.2,0,0.507,6.086,61.5,3.6519,8,307,17.4,376.75,10.88,24\nhigh,0,18.1,0,0.614,6.461,93.3,2.0026,24,666,20.2,27.49,18.05,9.6\nvery_low,22,5.86,0,0.431,6.438,8.9,7.3967,7,330,19.1,377.07,3.59,24.8\nlow,0,4.39,0,0.442,6.014,48.5,8.0136,3,352,18.8,385.64,10.53,17.5\nhigh,0,18.1,0,0.74,6.461,93.3,2.0026,24,666,20.2,27.49,18.05,9.6\nvery_low,40,6.41,1,0.447,6.826,27.6,4.8628,4,254,17.6,393.45,4.16,33.1\nlow,22,5.86,0,0.431,6.226,79.2,8.0555,7,330,19.1,376.14,10.15,20.5\nvery_low,0,7.38,0,0.493,6.083,43.7,5.4159,5,287,19.6,396.9,12.79,22.2\nhigh,0,18.1,0,0.74,6.461,93.3,2.0026,24,666,20.2,27.49,18.05,9.6"
            temp-file (java.io.File/createTempFile "test-boston" ".csv")]
        (try
          (spit temp-file test-data)
          (let [[X y] (bp/load-data (.getPath temp-file))
                predictor (bp/create-predictor)
                trained-predictor (bp/train predictor X y)]
            (is (some? (:model trained-predictor))))
          (finally
            (.delete temp-file)))))))

(deftest test-predict
  (testing "予測"
    (testing "訓練済みモデルで予測できる"
      (let [test-data "CRIME,ZN,INDUS,CHAS,NOX,RM,AGE,DIS,RAD,TAX,PTRATIO,B,LSTAT,PRICE\nvery_low,0,8.14,0,0.538,5.95,82,3.99,4,307,21,232.6,27.71,13.2\nlow,0,21.89,0,0.624,6.151,97.9,1.6687,4,437,21.2,396.9,18.46,17.8\nhigh,0,18.1,0,0.614,6.98,67.6,2.5329,24,666,20.2,374.68,11.66,29.8\nvery_low,0,5.96,0,0.499,5.966,30.2,3.8473,5,279,19.2,393.43,10.13,24.7\nlow,0,9.9,0,0.544,6.113,58.8,4.0019,4,304,18.4,396.23,12.73,21\nhigh,0,18.1,0,0.583,5.905,53.2,3.1523,24,666,20.2,388.22,11.45,20.6\nvery_low,0,7.87,0,0.524,6.009,82.9,6.2267,5,311,15.2,396.9,13.27,18.9\nlow,0,6.2,0,0.507,6.086,61.5,3.6519,8,307,17.4,376.75,10.88,24\nhigh,0,18.1,0,0.614,6.461,93.3,2.0026,24,666,20.2,27.49,18.05,9.6\nvery_low,22,5.86,0,0.431,6.438,8.9,7.3967,7,330,19.1,377.07,3.59,24.8\nlow,0,4.39,0,0.442,6.014,48.5,8.0136,3,352,18.8,385.64,10.53,17.5\nhigh,0,18.1,0,0.74,6.461,93.3,2.0026,24,666,20.2,27.49,18.05,9.6\nvery_low,40,6.41,1,0.447,6.826,27.6,4.8628,4,254,17.6,393.45,4.16,33.1\nlow,22,5.86,0,0.431,6.226,79.2,8.0555,7,330,19.1,376.14,10.15,20.5\nvery_low,0,7.38,0,0.493,6.083,43.7,5.4159,5,287,19.6,396.9,12.79,22.2\nhigh,0,18.1,0,0.74,6.461,93.3,2.0026,24,666,20.2,27.49,18.05,9.6"
            temp-file (java.io.File/createTempFile "test-boston" ".csv")]
        (try
          (spit temp-file test-data)
          (let [[X y] (bp/load-data (.getPath temp-file))
                predictor (bp/create-predictor)
                trained-predictor (bp/train predictor X y)
                predictions (bp/predict trained-predictor X)]
            (is (vector? predictions))
            (is (= (count y) (count predictions)))
            (is (every? number? predictions)))
          (finally
            (.delete temp-file)))))))

(deftest test-evaluate
  (testing "評価"
    (testing "RMSE と R² を計算できる"
      (let [y-true [13.2 17.8 29.8 24.7]
            y-pred [15.0 18.0 28.0 25.0]
            metrics (bp/evaluate y-true y-pred)]
        (is (number? (:rmse metrics)))
        (is (number? (:r2 metrics)))
        (is (pos? (:rmse metrics)))
        (is (<= -1.0 (:r2 metrics) 1.0))))

    (testing "完全一致の場合は RMSE=0, R²=1"
      (let [y-true [10.0 20.0 30.0]
            y-pred [10.0 20.0 30.0]
            metrics (bp/evaluate y-true y-pred)]
        (is (< (:rmse metrics) 0.001))
        (is (> (:r2 metrics) 0.999))))))
