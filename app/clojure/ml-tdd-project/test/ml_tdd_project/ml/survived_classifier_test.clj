(ns ml-tdd-project.ml.survived-classifier-test
  "Survived 分類器のテスト"
  (:require [clojure.test :refer [deftest is testing]]
            [ml-tdd-project.ml.survived-classifier :as sc]
            [tablecloth.api :as tc]
            [clojure.java.io :as io]))

(deftest test-create-classifier
  (testing "分類器の初期化"
    (testing "デフォルトパラメータでの初期化"
      (let [classifier (sc/create-classifier)]
        (is (some? classifier))
        (is (= 9 (:max-nodes classifier)))
        (is (nil? (:model classifier)))))

    (testing "カスタムパラメータでの初期化"
      (let [classifier (sc/create-classifier {:max-nodes 5})]
        (is (= 5 (:max-nodes classifier)))))

    (testing "max-nodes が不正な値の場合エラー"
      (is (thrown? IllegalArgumentException
                   (sc/create-classifier {:max-nodes 0}))))))

(deftest test-load-data
  (testing "データ読み込み"
    (testing "CSV ファイルの読み込み"
      (let [test-data "Pclass,Age,SibSp,Parch,Fare,Sex,Survived\n1,22.0,1,0,7.25,male,0\n2,38.0,1,0,71.28,female,1\n3,26.0,0,0,7.92,male,0"
            temp-file (java.io.File/createTempFile "test-survived" ".csv")]
        (try
          (spit temp-file test-data)
          (let [[X y] (sc/load-data (.getPath temp-file) {:preprocess false})]
            (is (= 3 (tc/row-count X)))
            (is (= 3 (count y)))
            (is (not (contains? (set (tc/column-names X)) :Survived)))
            (is (vector? y)))
          (finally
            (.delete temp-file)))))

    (testing "ファイルが存在しない場合エラー"
      (is (thrown? java.io.FileNotFoundException
                   (sc/load-data "nonexistent.csv"))))

    (testing "必要な列が不足している場合エラー"
      (let [test-data "Pclass,Age,Sex\n1,22.0,male"
            temp-file (java.io.File/createTempFile "test-survived" ".csv")]
        (try
          (spit temp-file test-data)
          (is (thrown? IllegalArgumentException
                       (sc/load-data (.getPath temp-file) {:preprocess false})))
          (finally
            (.delete temp-file)))))))

(deftest test-preprocess-age
  (testing "Age 欠損値補完"
    (testing "欠損値がない場合は変更なし"
      (let [df (tc/dataset {:Pclass [1 2 3]
                            :Age [22.0 38.0 26.0]
                            :Survived [0 1 0]})
            df-processed (sc/preprocess-age df)]
        (is (= (tc/rows df :as-maps)
               (tc/rows df-processed :as-maps)))))

    (testing "1等客室死亡者の年齢補完"
      (let [df (tc/dataset {:Pclass [1 1]
                            :Age [nil 50.0]
                            :Survived [0 0]})
            df-processed (sc/preprocess-age df)]
        (is (= 43.0 (first (tc/column df-processed :Age))))
        (is (= 50.0 (second (tc/column df-processed :Age))))))

    (testing "1等客室生存者の年齢補完"
      (let [df (tc/dataset {:Pclass [1]
                            :Age [nil]
                            :Survived [1]})
            df-processed (sc/preprocess-age df)]
        (is (= 35.0 (first (tc/column df-processed :Age))))))

    (testing "全グループの年齢補完"
      (let [df (tc/dataset {:Pclass [1 1 2 2 3 3]
                            :Age [nil nil nil nil nil nil]
                            :Survived [0 1 0 1 0 1]})
            df-processed (sc/preprocess-age df)
            expected-ages [43.0 35.0 33.0 25.0 26.0 20.0]
            actual-ages (vec (tc/column df-processed :Age))]
        (is (= expected-ages actual-ages))))

    (testing "一部のみ欠損値がある場合"
      (let [df (tc/dataset {:Pclass [1 1 2 2]
                            :Age [nil 30.0 25.0 nil]
                            :Survived [0 1 0 1]})
            df-processed (sc/preprocess-age df)
            ages (vec (tc/column df-processed :Age))]
        (is (= 43.0 (nth ages 0)))   ; 補完
        (is (= 30.0 (nth ages 1)))   ; 元のまま
        (is (= 25.0 (nth ages 2)))   ; 元のまま
        (is (= 25.0 (nth ages 3)))))))

(deftest test-encode-categorical
  (testing "カテゴリカル変数エンコーディング"
    (testing "Sex 列が male 列に変換される"
      (let [df (tc/dataset {:Pclass [1 2 3]
                            :Sex ["male" "female" "male"]
                            :Survived [0 1 0]})
            df-encoded (sc/encode-categorical df)]
        (is (contains? (set (tc/column-names df-encoded)) :male))
        (is (not (contains? (set (tc/column-names df-encoded)) :Sex)))))

    (testing "male 列の値が正しい"
      (let [df (tc/dataset {:Sex ["male" "female" "male" "female"]})
            df-encoded (sc/encode-categorical df)
            expected-male-values [1 0 1 0]
            actual-male-values (vec (tc/column df-encoded :male))]
        (is (= expected-male-values actual-male-values))))

    (testing "他の列は保持される"
      (let [df (tc/dataset {:Pclass [1 2]
                            :Age [22.0 38.0]
                            :Sex ["male" "female"]
                            :Survived [0 1]})
            df-encoded (sc/encode-categorical df)]
        (is (contains? (set (tc/column-names df-encoded)) :Pclass))
        (is (contains? (set (tc/column-names df-encoded)) :Age))
        (is (contains? (set (tc/column-names df-encoded)) :Survived))
        (is (= [1 2] (vec (tc/column df-encoded :Pclass))))
        (is (= [22.0 38.0] (vec (tc/column df-encoded :Age)))))))

(deftest test-train
  (testing "モデルの訓練"
    (testing "訓練データで学習できる"
      (let [test-data "Pclass,Age,SibSp,Parch,Fare,Sex,Survived\n1,22.0,1,0,7.25,male,0\n2,38.0,1,0,71.28,female,1\n3,26.0,0,0,7.92,male,0\n1,35.0,0,1,53.1,female,1"
            temp-file (java.io.File/createTempFile "test-survived" ".csv")]
        (try
          (spit temp-file test-data)
          (let [[X y] (sc/load-data (.getPath temp-file))
                classifier (sc/create-classifier)
                trained-classifier (sc/train classifier X y)]
            (is (some? (:model trained-classifier)))
            (is (= 9 (:max-nodes trained-classifier))))
          (finally
            (.delete temp-file)))))

    (testing "max-nodes パラメータが適用される"
      (let [test-data "Pclass,Age,SibSp,Parch,Fare,Sex,Survived\n1,22.0,1,0,7.25,male,0\n2,38.0,1,0,71.28,female,1\n3,26.0,0,0,7.92,male,0\n1,35.0,0,1,53.1,female,1"
            temp-file (java.io.File/createTempFile "test-survived" ".csv")]
        (try
          (spit temp-file test-data)
          (let [[X y] (sc/load-data (.getPath temp-file))
                classifier (sc/create-classifier {:max-nodes 5})
                trained-classifier (sc/train classifier X y)]
            (is (some? (:model trained-classifier)))
            (is (= 5 (:max-nodes trained-classifier))))
          (finally
            (.delete temp-file)))))))

(deftest test-predict
  (testing "予測"
    (testing "訓練済みモデルで予測できる"
      (let [test-data "Pclass,Age,SibSp,Parch,Fare,Sex,Survived\n1,22.0,1,0,7.25,male,0\n2,38.0,1,0,71.28,female,1\n3,26.0,0,0,7.92,male,0\n1,35.0,0,1,53.1,female,1"
            temp-file (java.io.File/createTempFile "test-survived" ".csv")]
        (try
          (spit temp-file test-data)
          (let [[X y] (sc/load-data (.getPath temp-file))
                classifier (sc/create-classifier)
                trained-classifier (sc/train classifier X y)
                predictions (sc/predict trained-classifier X)]
            (is (vector? predictions))
            (is (= (count y) (count predictions)))
            (is (every? #(or (= % 0) (= % 1)) predictions)))
          (finally
            (.delete temp-file)))))))

(deftest test-evaluate
  (testing "評価"
    (testing "正解率と混同行列を計算できる"
      (let [y-true [0 1 1 0 1]
            y-pred [0 1 0 0 1]
            metrics (sc/evaluate y-true y-pred)]
        (is (number? (:accuracy metrics)))
        (is (<= 0.0 (:accuracy metrics) 1.0))
        (is (contains? metrics :confusion-matrix))
        (is (= 2 (count (:confusion-matrix metrics))))
        (is (= 2 (count (first (:confusion-matrix metrics)))))))

    (testing "完全一致の場合は正解率1.0"
      (let [y-true [0 1 1 0]
            y-pred [0 1 1 0]
            metrics (sc/evaluate y-true y-pred)]
        (is (= 1.0 (:accuracy metrics)))))))
)
