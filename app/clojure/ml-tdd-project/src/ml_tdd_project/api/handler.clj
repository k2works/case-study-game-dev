(ns ml-tdd-project.api.handler
  "機械学習 API ハンドラー"
  (:require [compojure.core :refer [defroutes GET POST]]
            [compojure.route :as route]
            [ring.middleware.json :refer [wrap-json-body wrap-json-response]]
            [ring.middleware.defaults :refer [wrap-defaults api-defaults]]
            [ring.util.response :refer [response status]]
            [ring.util.response :as resp]
            [ml-tdd-project.ml.iris-classifier :as iris]
            [ml-tdd-project.ml.boston-predictor :as boston]
            [tablecloth.api :as tc]))

;; モデルのキャッシュ
(def iris-model (atom nil))
(def boston-model (atom nil))

(defn load-iris-model!
  "Iris モデルを読み込む（初回のみ）"
  []
  (when-not @iris-model
    (let [data-path "resources/data/iris.csv"
          [X y] (iris/load-data data-path)
          classifier (iris/create-classifier)
          trained (iris/train classifier X y)]
      (reset! iris-model trained))))

(defn load-boston-model!
  "Boston モデルを読み込む（初回のみ）"
  []
  (when-not @boston-model
    (let [data-path "resources/data/Boston.csv"
          [X y] (boston/load-data data-path)
          predictor (boston/create-predictor)
          trained (boston/train predictor X y)]
      (reset! boston-model trained))))

(defn validate-iris-input
  "Iris 入力データを検証"
  [data]
  (and (map? data)
       (contains? data :sepal-length)
       (contains? data :sepal-width)
       (contains? data :petal-length)
       (contains? data :petal-width)
       (number? (:sepal-length data))
       (number? (:sepal-width data))
       (number? (:petal-length data))
       (number? (:petal-width data))
       (pos? (:sepal-length data))
       (pos? (:sepal-width data))
       (pos? (:petal-length data))
       (pos? (:petal-width data))))

(defn validate-boston-input
  "Boston 入力データを検証"
  [data]
  (and (map? data)
       (contains? data :CRIME)
       (contains? data :ZN)
       (contains? data :INDUS)
       (contains? data :CHAS)
       (contains? data :NOX)
       (contains? data :RM)
       (contains? data :AGE)
       (contains? data :DIS)
       (contains? data :RAD)
       (contains? data :TAX)
       (contains? data :PTRATIO)
       (contains? data :B)
       (contains? data :LSTAT)))

(defn health-check
  "ヘルスチェックエンドポイント"
  [_request]
  (response {:status "ok"}))

(defn predict-iris
  "Iris 予測エンドポイント"
  [request]
  (load-iris-model!)
  (let [input-data (:body request)]
    (if (validate-iris-input input-data)
      (try
        ;; kebab-case キーを使用してデータセットを作成
        (let [X (tc/dataset {:sepal-length [(:sepal-length input-data)]
                             :sepal-width [(:sepal-width input-data)]
                             :petal-length [(:petal-length input-data)]
                             :petal-width [(:petal-width input-data)]})
              predictions (iris/predict @iris-model X)
              species-map {0 "setosa" 1 "versicolor" 2 "virginica"}
              prediction (get species-map (first predictions))]
          (response {:prediction prediction}))
        (catch Exception e
          (-> (response {:error (str "Prediction failed: " (.getMessage e))})
              (status 500))))
      (-> (response {:error "Invalid input data"})
          (status 400)))))

(defn predict-boston
  "Boston 予測エンドポイント"
  [request]
  (load-boston-model!)
  (let [input-data (:body request)]
    (if (validate-boston-input input-data)
      (try
        ;; Boston predictor expects specific column structure after preprocessing
        (let [X (tc/dataset {:CRIME [(:CRIME input-data)]
                             :ZN [(:ZN input-data)]
                             :INDUS [(:INDUS input-data)]
                             :CHAS [(:CHAS input-data)]
                             :NOX [(:NOX input-data)]
                             :RM [(:RM input-data)]
                             :AGE [(:AGE input-data)]
                             :DIS [(:DIS input-data)]
                             :RAD [(:RAD input-data)]
                             :TAX [(:TAX input-data)]
                             :PTRATIO [(:PTRATIO input-data)]
                             :B [(:B input-data)]
                             :LSTAT [(:LSTAT input-data)]})
              ;; Boston load-data does preprocessing, but for prediction we need to apply it manually
              X-encoded (boston/encode-categorical X)
              feature-cols [:ZN :INDUS :CHAS :NOX :RM :AGE :DIS :RAD :TAX :PTRATIO :B :LSTAT :CRIME_low :CRIME_high]
              X-features (tc/select-columns X-encoded feature-cols)
              predictions (boston/predict @boston-model X-features)
              prediction (first predictions)]
          (response {:prediction prediction}))
        (catch Exception e
          (-> (response {:error (str "Prediction failed: " (.getMessage e))})
              (status 500))))
      (-> (response {:error "Invalid input data"})
          (status 400)))))

(defroutes app-routes
  (GET "/api/health" [] health-check)
  (POST "/api/predict/iris" [] predict-iris)
  (POST "/api/predict/boston" [] predict-boston)
  (GET "/api/swagger.json" []
    (-> (resp/response (slurp (clojure.java.io/resource "public/swagger.json")))
        (resp/content-type "application/json")))
  (GET "/api-docs" []
    (-> (resp/response (slurp (clojure.java.io/resource "public/api-docs.html")))
        (resp/content-type "text/html")))
  (route/resources "/")
  (route/not-found {:error "Not found"}))

(def app
  (-> app-routes
      (wrap-json-body {:keywords? true})
      wrap-json-response
      (wrap-defaults api-defaults)))
