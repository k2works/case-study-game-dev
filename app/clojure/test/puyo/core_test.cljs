(ns puyo.core-test
  (:require [cljs.test :refer-macros [deftest is testing]]
            [puyo.core :as core]))

;; ========== Phase 1: 基盤システム ==========

;; T001: ゲームボード作成
(deftest board-test
  (testing "ボード作成"
    (let [board (core/create-empty-board)]
      (is (vector? board) "ボードはベクター")
      (is (= 12 (count board)) "高さ12")
      (is (= 8 (count (first board))) "幅8")
      (is (every? #(every? zero? %) board) "全セルが空"))))

(deftest coordinate-validation-test
  (testing "座標検証"
    (is (true? (core/valid-position? 0 0)) "左上角有効")
    (is (true? (core/valid-position? 7 11)) "右下角有効")
    (is (false? (core/valid-position? -1 0)) "左境界外無効")
    (is (false? (core/valid-position? 8 0)) "右境界外無効")
    (is (false? (core/valid-position? 0 -1)) "上境界外無効")
    (is (false? (core/valid-position? 0 12)) "下境界外無効")))

(deftest get-puyo-test
  (testing "ぷよ取得"
    (let [board (core/create-empty-board)]
      (is (= 0 (core/get-puyo-at board 0 0)) "空セル")
      (is (nil? (core/get-puyo-at board -1 0)) "範囲外はnil")
      (is (nil? (core/get-puyo-at board 0 12)) "範囲外はnil"))))

;; T002: ぷよの基本データ構造
(deftest color-system-test
  (testing "色システム"
    (is (true? (core/valid-color? 1)) "赤は有効")
    (is (true? (core/valid-color? 5)) "紫は有効")
    (is (false? (core/valid-color? 0)) "0は無効")
    (is (false? (core/valid-color? 6)) "6は無効")
    (is (string? (core/get-puyo-color 1)) "カラーコード取得")
    (is (= "#ffffff" (core/get-puyo-color 0)) "空は白")))

;; T003: 組ぷよ（2個セット）の実装
(deftest puyo-creation-test
  (testing "ぷよ作成"
    (let [pair (core/create-puyo-pair 1 2 3 0)]
      (is (map? pair) "組ぷよはマップ")
      (is (= 1 (get-in pair [:puyo1 :color])) "puyo1の色")
      (is (= 2 (get-in pair [:puyo2 :color])) "puyo2の色")
      (is (= 3 (get-in pair [:puyo1 :x])) "puyo1のx座標")
      (is (= 0 (get-in pair [:puyo1 :y])) "puyo1のy座標")
      (is (= 0 (:rotation pair)) "初期回転状態"))))

(deftest rotation-test
  (testing "回転機能"
    (let [pair (core/create-puyo-pair 1 2 3 1)
          rotated (core/rotate-puyo-pair pair)]
      (is (= 1 (:rotation rotated)) "回転状態が1")
      (let [rotated-4 (-> pair
                          core/rotate-puyo-pair
                          core/rotate-puyo-pair
                          core/rotate-puyo-pair
                          core/rotate-puyo-pair)]
        (is (= 0 (:rotation rotated-4)) "4回転で元に戻る")))))

(deftest puyo-pair-positions-test
  (testing "組ぷよの座標計算"
    (let [positions-0 (core/get-puyo-pair-positions 3 1 0)
          positions-1 (core/get-puyo-pair-positions 3 1 1)
          positions-2 (core/get-puyo-pair-positions 3 1 2)
          positions-3 (core/get-puyo-pair-positions 3 1 3)]
      (is (= 2 (count positions-0)) "2つの座標")
      (is (= {:x 3 :y 1} (first positions-0)) "回転0: puyo1位置")
      (is (= {:x 3 :y 2} (second positions-0)) "回転0: puyo2下")
      (is (= {:x 4 :y 1} (second positions-1)) "回転1: puyo2右")
      (is (= {:x 3 :y 0} (second positions-2)) "回転2: puyo2上")
      (is (= {:x 2 :y 1} (second positions-3)) "回転3: puyo2左"))))

;; ========== Phase 2: ぷよ管理システム ==========

;; T005: ランダムなぷよ生成
(deftest random-generation-test
  (testing "ランダム色生成"
    (let [color (core/generate-random-color)]
      (is (core/valid-color? color) "有効な色")
      (is (>= color 1) "1以上")
      (is (<= color 5) "5以下")))
  (testing "ランダム組ぷよ生成"
    (let [pair (core/generate-random-puyo-pair 3 0)]
      (is (map? pair) "組ぷよマップ")
      (is (core/valid-color? (get-in pair [:puyo1 :color])) "puyo1有効色")
      (is (core/valid-color? (get-in pair [:puyo2 :color])) "puyo2有効色"))))

(deftest spawn-puyo-test
  (testing "新規ぷよ生成"
    (let [pair (core/spawn-new-puyo-pair)]
      (is (= 4 (get-in pair [:puyo1 :x])) "中央x座標")
      (is (= 0 (get-in pair [:puyo1 :y])) "上部y座標"))))

;; T006-T007: 組ぷよの移動と回転
(deftest movement-check-test
  (testing "移動可能判定"
    (let [board (core/create-empty-board)
          pair (core/create-puyo-pair 1 2 3 1)]
      (is (true? (core/can-move-puyo-pair? pair board :left)) "左移動可能")
      (is (true? (core/can-move-puyo-pair? pair board :right)) "右移動可能"))))

(deftest left-movement-test
  (testing "左移動"
    (let [board (core/create-empty-board)
          pair (core/create-puyo-pair 1 2 3 1)
          moved (core/move-puyo-pair-left pair board)]
      (is (= 2 (get-in moved [:puyo1 :x])) "x座標-1"))))

(deftest right-movement-test
  (testing "右移動"
    (let [board (core/create-empty-board)
          pair (core/create-puyo-pair 1 2 3 1)
          moved (core/move-puyo-pair-right pair board)]
      (is (= 4 (get-in moved [:puyo1 :x])) "x座標+1"))))

(deftest boundary-movement-test
  (testing "境界での移動制限"
    (let [board (core/create-empty-board)
          left-pair (core/create-puyo-pair 1 2 0 1)
          right-pair (core/create-puyo-pair 1 2 7 1)]
      (is (= left-pair (core/move-puyo-pair-left left-pair board)) "左端で移動不可")
      (is (= right-pair (core/move-puyo-pair-right right-pair board)) "右端で移動不可"))))

;; T008: 重力システム
(deftest fall-check-test
  (testing "落下可能判定"
    (let [board (core/create-empty-board)
          pair (core/create-puyo-pair 1 2 3 1)]
      (is (true? (core/can-fall? pair board)) "落下可能"))))

(deftest fall-movement-test
  (testing "落下処理"
    (let [board (core/create-empty-board)
          pair (core/create-puyo-pair 1 2 3 1)
          fallen (core/move-puyo-pair-down pair board)]
      (is (= 2 (get-in fallen [:puyo1 :y])) "y座標+1"))))

(deftest hard-drop-test
  (testing "ハードドロップ"
    (let [board (core/create-empty-board)
          pair (core/create-puyo-pair 1 2 3 0)
          dropped (core/hard-drop pair board)]
      (is (= 10 (get-in dropped [:puyo1 :y])) "底まで落下"))))

;; T009: ぷよの固定処理
(deftest fix-puyo-test
  (testing "ぷよ固定"
    (let [board (core/create-empty-board)
          pair (core/create-puyo-pair 1 2 3 10)
          fixed-board (core/fix-puyo-pair pair board)]
      (is (= 1 (core/get-puyo-at fixed-board 3 10)) "puyo1固定")
      (is (= 2 (core/get-puyo-at fixed-board 3 11)) "puyo2固定"))))

(deftest drop-floating-test
  (testing "浮遊ぷよ落下"
    (let [board (-> (core/create-empty-board)
                    (assoc-in [5 3] 1)
                    (assoc-in [3 3] 2))
          dropped (core/drop-floating-puyos board)]
      (is (= 0 (core/get-puyo-at dropped 3 3)) "浮遊位置が空")
      (is (= 1 (core/get-puyo-at dropped 3 11)) "底に1が落下")
      (is (= 2 (core/get-puyo-at dropped 3 10)) "2がその上に落下"))))

;; ========== Phase 3: ゲームロジック ==========

;; T010: 隣接ぷよの検索
(deftest adjacent-puyos-test
  (testing "隣接ぷよ検索"
    (let [board (-> (core/create-empty-board)
                    (assoc-in [11 3] 1)
                    (assoc-in [11 4] 1)
                    (assoc-in [10 3] 1)
                    (assoc-in [10 4] 1))
          adjacent (core/find-adjacent-puyos board 3 11)]
      (is (= 4 (count adjacent)) "4つ接続")
      (is (contains? (set adjacent) [3 11]) "起点を含む"))))

(deftest no-adjacent-test
  (testing "隣接なし"
    (let [board (-> (core/create-empty-board)
                    (assoc-in [11 3] 1)
                    (assoc-in [11 5] 2))
          adjacent (core/find-adjacent-puyos board 3 11)]
      (is (= 1 (count adjacent)) "単独"))))

;; T011: ぷよ消去の実行
(deftest find-groups-test
  (testing "消去グループ検索"
    (let [board (-> (core/create-empty-board)
                    (assoc-in [11 3] 1)
                    (assoc-in [11 4] 1)
                    (assoc-in [10 3] 1)
                    (assoc-in [10 4] 1))
          groups (core/find-groups-to-clear board)]
      (is (= 1 (count groups)) "1グループ")
      (is (= 4 (count (first groups))) "4つ接続"))))

(deftest clear-groups-test
  (testing "グループ消去"
    (let [board (-> (core/create-empty-board)
                    (assoc-in [11 3] 1)
                    (assoc-in [11 4] 1)
                    (assoc-in [10 3] 1)
                    (assoc-in [10 4] 1))
          groups (core/find-groups-to-clear board)
          cleared (core/clear-puyo-groups board groups)]
      (is (= 0 (core/get-puyo-at cleared 3 11)) "消去済み")
      (is (= 0 (core/get-puyo-at cleared 4 11)) "消去済み"))))

;; T012: 連鎖システム
(deftest chain-execution-test
  (testing "連鎖実行"
    (let [board (-> (core/create-empty-board)
                    ;; 1段目：4つ接続（消える）
                    (assoc-in [11 3] 1)
                    (assoc-in [11 4] 1)
                    (assoc-in [10 3] 1)
                    (assoc-in [10 4] 1)
                    ;; 2段目：落下後に4つ接続（連鎖）
                    (assoc-in [9 3] 2)
                    (assoc-in [9 4] 2)
                    (assoc-in [8 3] 2)
                    (assoc-in [8 4] 2))
          result (core/execute-chain board)]
      (is (>= (:chain-count result) 1) "1連鎖以上")
      (is (> (:total-score result) 0) "スコア加算"))))

;; T013-T014: スコア計算システム
(deftest chain-bonus-test
  (testing "連鎖ボーナス"
    (is (= 0 (core/calculate-chain-bonus 1)) "1連鎖ボーナスなし")
    (is (= 8 (core/calculate-chain-bonus 2)) "2連鎖")
    (is (= 16 (core/calculate-chain-bonus 3)) "3連鎖")))

(deftest clear-score-test
  (testing "消去スコア"
    (is (= 40 (core/calculate-clear-score 4 0)) "基本スコア")
    (is (= 48 (core/calculate-clear-score 4 8)) "連鎖ボーナス付")))

(deftest perfect-clear-test
  (testing "全消し判定"
    (let [empty-board (core/create-empty-board)
          non-empty (assoc-in empty-board [11 3] 1)]
      (is (true? (core/is-perfect-clear? empty-board)) "全消し")
      (is (false? (core/is-perfect-clear? non-empty)) "未全消し"))))

(deftest perfect-clear-bonus-test
  (testing "全消しボーナス"
    (is (= 1000 (core/calculate-perfect-clear-bonus)) "ボーナス1000")))