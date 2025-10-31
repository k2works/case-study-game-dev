(ns ml-tdd-project.core
  (:require [ring.adapter.jetty :refer [run-jetty]]
            [ml-tdd-project.api.handler :refer [app]])
  (:gen-class))

(defn -main
  "API サーバーを起動"
  [& args]
  (let [port (Integer/parseInt (or (System/getenv "PORT") "3000"))]
    (println (str "Starting server on port " port "..."))
    (run-jetty app {:port port :join? true})))
