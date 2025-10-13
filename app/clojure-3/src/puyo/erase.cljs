(ns puyo.erase
  (:require [puyo.config :as config]))

(defn 隣接セル取得
  "隣接する座標を取得"
  [y座標 x座標]
  [[(dec y座標) x座標]    ; 上
   [(inc y座標) x座標]    ; 下
   [y座標 (dec x座標)]    ; 左
   [y座標 (inc x座標)]])  ; 右

(defn 範囲内判定?
  "座標がフィールド内かチェック"
  [盤面 y座標 x座標]
  (let [行数 (count 盤面)
        列数 (if (pos? 行数) (count (first 盤面)) 0)]
    (and (>= y座標 0) (< y座標 行数)
         (>= x座標 0) (< x座標 列数))))

(defn 接続探索
  "深さ優先探索で同じ色のぷよを探索"
  ([盤面 y座標 x座標]
   (接続探索 盤面 y座標 x座標 (get-in 盤面 [y座標 x座標]) #{}))
  ([盤面 y座標 x座標 target-色 visited]
   (if (or (not (範囲内判定? 盤面 y座標 x座標))
           (contains? visited [y座標 x座標])
           (not= (get-in 盤面 [y座標 x座標]) target-色)
           (zero? target-色))
     visited
     (let [visited' (conj visited [y座標 x座標])]
       (reduce
        (fn [acc [ny nx]]
          (接続探索 盤面 ny nx target-色 acc))
        visited'
        (隣接セル取得 y座標 x座標))))))

(defn 消去可能グループ探索
  "消去可能なグループを全て見つける"
  [盤面]
  (let [行数 (count 盤面)
        列数 (if (pos? 行数) (count (first 盤面)) 0)
        all-positions (for [y座標 (range 行数)
                            x座標 (range 列数)
                            :when (pos? (get-in 盤面 [y座標 x座標]))]
                        [y座標 x座標])]
    (->> all-positions
         (reduce
          (fn [{:keys [visited グループ]} [y座標 x座標]]
            (if (contains? visited [y座標 x座標])
              {:visited visited :グループ グループ}
              (let [group (接続探索 盤面 y座標 x座標)]
                (if (>= (count group) 4)
                  {:visited (into visited group)
                   :グループ (conj グループ group)}
                  {:visited (into visited group)
                   :グループ グループ}))))
          {:visited #{} :グループ []})
         :グループ)))

(defn ぷよ消去
  "ぷよを消去する"
  [盤面 グループ]
  (reduce
   (fn [f group]
     (reduce
      (fn [field' [y座標 x座標]]
        (assoc-in field' [y座標 x座標] 0))
      f
      group))
   盤面
   グループ))

(defn 重力適用
  "重力を適用してぷよを落とす"
  [盤面]
  (let [行数 (count 盤面)
        列数 (if (pos? 行数) (count (first 盤面)) 0)]
    (reduce
     (fn [f x座標]
       (let [列 (map #(get-in f [% x座標]) (range 行数))
             non-zero (filter pos? 列)
             zeros (repeat (- 行数 (count non-zero)) 0)
             新規列 (vec (concat zeros non-zero))]
         (reduce
          (fn [field' y座標]
            (assoc-in field' [y座標 x座標] (nth 新規列 y座標)))
          f
          (range 行数))))
     盤面
     (range 列数))))
