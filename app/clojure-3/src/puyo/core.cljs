(ns puyo.core
  (:require [puyo.config :as config]
            [puyo.player :as player]
            [puyo.stage :as stage]
            [puyo.erase :as erase]
            [puyo.score :as score]))

(defonce ゲーム状態
  (atom {:モード :新規ぷよ
         :フレーム 0
         :盤面 (stage/盤面作成)
         :ぷよ nil
         :入力状態 (player/入力状態作成)
         :キャンバスコンテキスト nil
         :落下カウンター 0
         :スコア 0
         :連鎖数 0}))

(defn 初期化
  "ゲームを初期化する"
  []
  (let [キャンバスコンテキスト (stage/キャンバス設定)]
    (reset! ゲーム状態
            {:モード :新規ぷよ
             :フレーム 0
             :盤面 (stage/盤面作成)
             :ぷよ nil
             :入力状態 (player/入力状態作成)
             :キャンバスコンテキスト キャンバスコンテキスト
             :落下カウンター 0
             :スコア 0
             :連鎖数 0}))

  ;; キーボードイベントをセットアップ
  (player/キーボードイベント設定 (:入力状態 @ゲーム状態)))

(def 落下速度 20) ; フレーム数（約0.33秒）

(defn ゲーム更新
  "ゲームを更新する"
  []
  (swap! ゲーム状態 update :フレーム inc)

  (case (:モード @ゲーム状態)
    :新規ぷよ
    (do
      (swap! ゲーム状態 assoc :ぷよ (player/ぷよ作成))
      (swap! ゲーム状態 assoc :落下カウンター 0)
      (swap! ゲーム状態 assoc :モード :プレイ中))

    :プレイ中
    (let [設定 (config/設定取得)
          現在のぷよ (:ぷよ @ゲーム状態)
          盤面 (:盤面 @ゲーム状態)
          更新されたぷよ (player/ぷよ更新
                        現在のぷよ
                        (:入力状態 @ゲーム状態)
                        設定)
          落下カウンター (:落下カウンター @ゲーム状態)]

      ;; 入力による更新を反映
      (swap! ゲーム状態 assoc :ぷよ 更新されたぷよ)

      ;; 入力後の着地判定
      (if (player/着地判定? 更新されたぷよ 盤面 設定)
        (do
          ;; 着地: フィールドに固定して次のモードへ
          (swap! ゲーム状態 update :盤面 stage/ぷよ固定 更新されたぷよ)
          (swap! ゲーム状態 assoc :モード :消去判定))
        ;; 未着地: 自動落下処理を継続
        (do
          ;; 自動落下処理
          (when (>= 落下カウンター 落下速度)
            (let [ぷよ (:ぷよ @ゲーム状態)]
              (if (player/着地判定? ぷよ 盤面 設定)
                (do
                  ;; 着地: フィールドに固定して次のモードへ
                  (swap! ゲーム状態 update :盤面 stage/ぷよ固定 ぷよ)
                  (swap! ゲーム状態 assoc :モード :消去判定))
                ;; 未着地: 下に移動
                (do
                  (swap! ゲーム状態 update :ぷよ player/下に移動 設定)
                  (swap! ゲーム状態 assoc :落下カウンター 0)))))

          ;; カウンターをインクリメント
          (swap! ゲーム状態 update :落下カウンター inc))))

    :消去判定
    (let [盤面 (:盤面 @ゲーム状態)
          グループ (erase/消去可能グループ探索 盤面)]
      (if (seq グループ)
        ;; 消去あり: スコア計算して重力適用へ
        (let [消去数 (reduce + (map count グループ))
              連鎖数 (inc (:連鎖数 @ゲーム状態))
              ポイント (score/スコア計算 消去数 連鎖数)
              新規盤面 (erase/ぷよ消去 盤面 グループ)
              全消し? (score/全消し判定? 新規盤面)
              合計ポイント (if 全消し?
                            (+ ポイント score/全消しボーナス)
                            ポイント)]
          (swap! ゲーム状態 assoc :盤面 新規盤面)
          (swap! ゲーム状態 update :スコア + 合計ポイント)
          (swap! ゲーム状態 assoc :連鎖数 連鎖数)
          (swap! ゲーム状態 assoc :モード :重力適用))
        ;; 消去なし: 連鎖リセット、重力のみ適用して新規ぷよへ
        (do
          (swap! ゲーム状態 assoc :連鎖数 0)
          (swap! ゲーム状態 update :盤面 erase/重力適用)
          (swap! ゲーム状態 assoc :モード :新規ぷよ))))

    :重力適用
    (do
      (swap! ゲーム状態 update :盤面 erase/重力適用)
      (swap! ゲーム状態 assoc :モード :消去判定))

    nil))

(defn ゲーム描画
  "ゲームを描画する"
  []
  (let [{:keys [キャンバスコンテキスト 盤面 ぷよ モード]} @ゲーム状態]
    (stage/キャンバスクリア キャンバスコンテキスト)
    (stage/盤面描画 キャンバスコンテキスト 盤面)
    (when (= モード :プレイ中)
      (stage/現在のぷよ描画 キャンバスコンテキスト ぷよ))))

(defn ゲームループ
  "ゲームループ"
  []
  (ゲーム更新)
  (ゲーム描画)
  (js/requestAnimationFrame ゲームループ))

(defn init
  "ゲームのエントリーポイント"
  []
  (.log js/console "Puyo Puyo Game Started!")
  (初期化)
  (ゲームループ))
