(ns puyo.score)

(def chain-bonus
  "連鎖ボーナステーブル"
  [0 8 16 32 64 96 128 160 192 224 256])

(defn calculate-score
  "スコアを計算"
  [erased-count chain-count]
  (let [chain-idx (min chain-count (dec (count chain-bonus)))
        bonus (nth chain-bonus chain-idx)]
    (* erased-count 10 (max 1 (+ 1 bonus)))))
