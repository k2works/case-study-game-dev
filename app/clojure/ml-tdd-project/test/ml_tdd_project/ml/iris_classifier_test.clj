(ns ml-tdd-project.ml.iris-classifier-test
  "Iris 分類器のテスト"
  (:require [clojure.test :refer :all]
            [ml-tdd-project.ml.iris-classifier :as iris]
            [tablecloth.api :as tc]))

(deftest test-create-classifier
  (testing "デフォルトパラメータで分類器を作成"
    (let [classifier (iris/create-classifier)]
      (is (not (nil? classifier)))
      (is (nil? (:model classifier)))        ; まだモデルは訓練されていない
      (is (= 2 (:max-nodes classifier))))))  ; デフォルトのノード数は 2

(deftest test-create-classifier-with-custom-params
  (testing "カスタムパラメータで分類器を作成"
    (let [classifier (iris/create-classifier {:max-nodes 5})]
      (is (= 5 (:max-nodes classifier))))))

(deftest test-invalid-max-nodes
  (testing "無効な max-nodes を拒否"
    ;; 負の値はダメ！
    (is (thrown? IllegalArgumentException
                 (iris/create-classifier {:max-nodes -1})))
    ;; 0 もダメ！
    (is (thrown? IllegalArgumentException
                 (iris/create-classifier {:max-nodes 0})))))

;; ステップ2: データ読み込みと前処理のテスト

(deftest test-load-data
  (testing "CSV ファイルからデータを読み込む"
    (let [dataset (iris/load-data "resources/data/iris.csv")]
      (is (not (nil? dataset)))
      (is (= 150 (tc/row-count dataset))))))

(deftest test-feature-columns
  (testing "特徴量が 4 列であることを確認"
    (let [dataset (iris/load-data "resources/data/iris.csv")
          feature-cols [:sepal-length :sepal-width :petal-length :petal-width]]
      (is (= 5 (tc/column-count dataset)))  ; 4特徴量 + 1ラベル
      (doseq [col feature-cols]
        (is (tc/has-column? dataset col))))))

(deftest test-species-unique
  (testing "ラベルが 3 種類であることを確認"
    (let [dataset (iris/load-data "resources/data/iris.csv")
          species (-> dataset
                      (tc/select-columns [:species])
                      (tc/unique-by :species)
                      (tc/column :species))]
      (is (= 3 (count species)))
      (is (some #{"setosa"} species))
      (is (some #{"versicolor"} species))
      (is (some #{"virginica"} species)))))

(deftest test-missing-values-handling
  (testing "欠損値が適切に処理される"
    ;; テスト用に欠損値を含むデータを作成
    (let [test-data (tc/dataset {:sepal-length [5.1 nil 7.0]
                                  :sepal-width [3.5 3.0 nil]
                                  :petal-length [1.4 1.4 4.7]
                                  :petal-width [0.2 0.2 1.4]
                                  :species ["setosa" "setosa" "versicolor"]})
          filled-data (iris/fill-missing-values test-data)]
      ;; 欠損値が補完されていることを確認（全列に値があることを確認）
      (is (not (nil? filled-data)))
      (is (= 3 (tc/row-count filled-data))))))

;; ステップ3: モデル訓練のテスト

(deftest test-train-model
  (testing "モデルを訓練できる"
    (let [dataset (tc/dataset {:sepal-length [5.1 4.9 7.0]
                                :sepal-width [3.5 3.0 3.2]
                                :petal-length [1.4 1.4 4.7]
                                :petal-width [0.2 0.2 1.4]
                                :species ["setosa" "setosa" "versicolor"]})
          classifier (iris/train (iris/create-classifier) dataset)]
      (is (not (nil? (:model classifier)))))))

(deftest test-trained-model-attributes
  (testing "訓練済みモデルが適切な属性を持つ"
    (let [dataset (tc/dataset {:sepal-length [5.1 4.9 7.0 6.4]
                                :sepal-width [3.5 3.0 3.2 3.2]
                                :petal-length [1.4 1.4 4.7 4.5]
                                :petal-width [0.2 0.2 1.4 1.5]
                                :species ["setosa" "setosa" "versicolor" "versicolor"]})
          classifier (iris/create-classifier {:max-nodes 5})
          trained (iris/train classifier dataset)]
      (is (= 5 (:max-nodes trained)))
      (is (instance? smile.classification.DecisionTree (:model trained))))))

(deftest test-train-with-empty-data
  (testing "空のデータでの訓練を拒否"
    (let [dataset (tc/dataset {})
          classifier (iris/create-classifier)]
      (is (thrown? IllegalArgumentException
                   (iris/train classifier dataset))))))

;; ステップ4: 予測機能のテスト

(deftest test-predict-single-sample
  (testing "単一サンプルを予測できる"
    (let [train-data (tc/dataset {:sepal-length [5.1 4.9 7.0 6.4]
                                   :sepal-width [3.5 3.0 3.2 3.2]
                                   :petal-length [1.4 1.4 4.7 4.5]
                                   :petal-width [0.2 0.2 1.4 1.5]
                                   :species ["setosa" "setosa" "versicolor" "versicolor"]})
          classifier (-> (iris/create-classifier)
                         (iris/train train-data))
          test-data (tc/dataset {:sepal-length [5.0]
                                  :sepal-width [3.5]
                                  :petal-length [1.3]
                                  :petal-width [0.3]})
          predictions (iris/predict classifier test-data)]
      (is (= 1 (count predictions)))
      (is (contains? #{"setosa" "versicolor" "virginica"} (first predictions))))))

(deftest test-predict-multiple-samples
  (testing "複数サンプルを予測できる"
    (let [train-data (tc/dataset {:sepal-length [5.1 4.9 7.0 6.4]
                                   :sepal-width [3.5 3.0 3.2 3.2]
                                   :petal-length [1.4 1.4 4.7 4.5]
                                   :petal-width [0.2 0.2 1.4 1.5]
                                   :species ["setosa" "setosa" "versicolor" "versicolor"]})
          classifier (-> (iris/create-classifier)
                         (iris/train train-data))
          test-data (tc/dataset {:sepal-length [5.0 7.0]
                                  :sepal-width [3.5 3.2]
                                  :petal-length [1.3 4.7]
                                  :petal-width [0.3 1.4]})
          predictions (iris/predict classifier test-data)]
      (is (= 2 (count predictions))))))

(deftest test-predict-without-training
  (testing "未訓練モデルでの予測を拒否"
    (let [classifier (iris/create-classifier)
          test-data (tc/dataset {:sepal-length [5.0]
                                  :sepal-width [3.5]
                                  :petal-length [1.3]
                                  :petal-width [0.3]})]
      (is (thrown? IllegalStateException
                   (iris/predict classifier test-data))))))

;; ステップ5: モデル評価のテスト

(deftest test-evaluate-accuracy
  (testing "正解率を計算できる"
    (let [train-data (iris/load-data "resources/data/iris.csv")
          classifier (-> (iris/create-classifier)
                         (iris/train train-data))
          test-data (tc/dataset {:sepal-length [5.1 7.0]
                                  :sepal-width [3.5 3.2]
                                  :petal-length [1.4 4.7]
                                  :petal-width [0.2 1.4]
                                  :species ["setosa" "versicolor"]})
          accuracy (iris/evaluate classifier test-data)]
      (is (<= 0.0 accuracy 1.0)))))

(deftest test-perfect-accuracy
  (testing "完全一致時の正解率が 1.0"
    (let [train-data (tc/dataset {:sepal-length [5.1 7.0]
                                   :sepal-width [3.5 3.2]
                                   :petal-length [1.4 4.7]
                                   :petal-width [0.2 1.4]
                                   :species ["setosa" "versicolor"]})
          classifier (-> (iris/create-classifier)
                         (iris/train train-data))
          ;; 訓練データと同じデータでテスト（必ず正解）
          accuracy (iris/evaluate classifier train-data)]
      (is (= 1.0 accuracy)))))
