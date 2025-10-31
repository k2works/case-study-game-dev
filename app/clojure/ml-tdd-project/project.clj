(defproject ml-tdd-project "0.1.0-SNAPSHOT"
  :description "TDD で学ぶ Clojure 機械学習プログラミング"
  :url "http://example.com/FIXME"
  :license {:name "EPL-2.0 OR GPL-2.0-or-later WITH Classpath-exception-2.0"
            :url "https://www.eclipse.org/legal/epl-2.0/"}
  :dependencies [[org.clojure/clojure "1.11.1"]

                 ;; 機械学習ライブラリ
                 [com.github.haifengl/smile-core "1.5.3"]

                 ;; データ操作ライブラリ
                 [scicloj/tablecloth "7.021"]
                 [techascent/tech.ml.dataset "7.021"]

                 ;; Web フレームワーク（最終章で使用）
                 [ring/ring-core "1.10.0"]
                 [ring/ring-jetty-adapter "1.10.0"]
                 [ring/ring-json "0.5.1"]
                 [ring/ring-defaults "0.4.0"]
                 [compojure "1.7.0"]
                 [cheshire "5.11.0"]  ;; JSON 処理
                 [metosin/ring-swagger-ui "5.9.0"]]  ;; Swagger UI

  :plugins [[lein-cljfmt "0.9.2"]
            [lein-kibit "0.1.8"]]

  :main ^:skip-aot ml-tdd-project.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]}
             :dev {:dependencies [[org.clojure/test.check "1.1.1"]
                                  [ring/ring-mock "0.4.0"]]}
             :jupyter {:dependencies [[clojupyter "0.4.332"]]}}

  :aliases {"jupyter-install" ["with-profile" "+jupyter" "run" "-m" "clojupyter.cmdline" "install"]})
