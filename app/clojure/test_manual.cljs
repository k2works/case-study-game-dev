;; 手動テスト: 浮遊ぷよの落下
(ns test-manual
  (:require [puyo.core :as core]))

(def test-board
  (-> (core/create-empty-board)
      ;; 最下段
      (assoc-in [11 3] 1)
      ;; 浮遊ぷよ（下が空）
      (assoc-in [8 3] 2)))

(println "Before:")
(doseq [y (range 8 12)]
  (println "y=" y " col3=" (get-in test-board [y 3])))

(def after (core/drop-floating-puyos test-board))

(println "\nAfter:")
(doseq [y (range 8 12)]
  (println "y=" y " col3=" (get-in after [y 3])))
