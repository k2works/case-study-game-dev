(ns puyo.core-test
  (:require [cljs.test :refer-macros [deftest is testing run-tests]]
            [puyo.core :as core]))

(deftest 初期化テスト
  (testing "初期化関数が存在する"
    (is (not (nil? core/init)))))

;; テスト実行
(run-tests)
