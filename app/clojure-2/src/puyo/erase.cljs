(ns puyo.erase
  (:require [puyo.config :as config]))

(defn get-neighbors
  "隣接する座標を取得"
  [y x]
  [[(dec y) x]    ; 上
   [(inc y) x]    ; 下
   [y (dec x)]    ; 左
   [y (inc x)]])  ; 右

(defn in-bounds?
  "座標がフィールド内かチェック"
  [y x]
  (and (>= y 0) (< y config/stage-rows)
       (>= x 0) (< x config/stage-cols)))

(defn find-connected
  "深さ優先探索で同じ色のぷよを探索"
  ([field y x]
   (find-connected field y x (get-in field [y x]) #{}))
  ([field y x target-color visited]
   (if (or (not (in-bounds? y x))
           (contains? visited [y x])
           (not= (get-in field [y x]) target-color)
           (zero? target-color))
     visited
     (let [visited' (conj visited [y x])]
       (reduce
        (fn [acc [ny nx]]
          (find-connected field ny nx target-color acc))
        visited'
        (get-neighbors y x))))))

(defn find-erasable-groups
  "消去可能なグループを全て見つける"
  [field]
  (let [all-positions (for [y (range config/stage-rows)
                            x (range config/stage-cols)
                            :when (pos? (get-in field [y x]))]
                        [y x])]
    (->> all-positions
         (reduce
          (fn [{:keys [visited groups]} [y x]]
            (if (contains? visited [y x])
              {:visited visited :groups groups}
              (let [group (find-connected field y x)]
                (if (>= (count group) 4)
                  {:visited (into visited group)
                   :groups (conj groups group)}
                  {:visited (into visited group)
                   :groups groups}))))
          {:visited #{} :groups []})
         :groups)))

(defn erase-puyos
  "ぷよを消去する"
  [field groups]
  (reduce
   (fn [f group]
     (reduce
      (fn [field' [y x]]
        (assoc-in field' [y x] 0))
      f
      group))
   field
   groups))

(defn apply-gravity
  "重力を適用してぷよを落とす"
  [field]
  (let [cols config/stage-cols
        rows config/stage-rows]
    (reduce
     (fn [f x]
       (let [col (map #(get-in f [% x]) (range rows))
             non-zero (filter pos? col)
             zeros (repeat (- rows (count non-zero)) 0)
             new-col (vec (concat zeros non-zero))]
         (reduce
          (fn [field' y]
            (assoc-in field' [y x] (nth new-col y)))
          f
          (range rows))))
     field
     (range cols))))
