(ns ml-tdd-project.api.handler-test
  "API ハンドラーのテスト"
  (:require [clojure.test :refer [deftest is testing]]
            [ml-tdd-project.api.handler :as handler]
            [cheshire.core :as json]
            [ring.mock.request :as mock]))

(deftest test-health-check
  (testing "ヘルスチェックエンドポイント"
    (let [response (handler/app (mock/request :get "/api/health"))]
      (is (= 200 (:status response)))
      (is (= "application/json; charset=utf-8"
             (get-in response [:headers "Content-Type"])))
      (let [body (json/parse-string (:body response) true)]
        (is (= "ok" (:status body)))))))

(deftest test-not-found
  (testing "存在しないエンドポイント"
    (let [response (handler/app (mock/request :get "/api/nonexistent"))]
      (is (= 404 (:status response))))))
