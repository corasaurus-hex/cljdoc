(ns cljdoc.server.search.api
  "Index and search Maven/Clojars artifacts.

   Design goals:
   1. Prefer matches in artifact id and group id over blurb.
   2. Prefer an exact match in artifact id and/or group id over partial matches
   3. Match anywhere in text, ex. `corfield` matches `seancorfield`, `cow` matches `scowl`, etc.
   4. Boost by clojars download count so that if multiple artifacts with similar score, the most popular ones come first.

  Examples:
   conco -> clj-concordion
   ring -> ring
   org.clojure -> org.clojure:clojure, org.clojure:clojurescript
   nyam -> clj-nyam
   re-frame -> re-frame with re-frame:re-frame first
   frame -> licaltown/frame (because exact match weighs heavy) then later re-frame:re-frame
   RiNg -> ring
   RèWRïTÉ -> rewrite-clj
   nervous ->io.nervous:* artifacts"
  (:require
   [cljdoc.server.search.search :as search]
   [tea-time.core :as tt]
   [clojure.tools.logging :as log]
   [integrant.core :as ig])
  (:import (java.util.concurrent TimeUnit)
           (org.apache.lucene.store Directory)))

(defprotocol ISearcher
  ;; We use a protocol so that we can create once the datatype implementing it and
  ;; wrap the required configuration in it, passing the type instead of the raw config
  ;; to each of the functions that need it.
  "Index and search artifacts."
  (all-docs [_] "Return all the documents, with all the version")
  (index-artifact [_ artifact])
  (search [_ query] "Supports web app libraries search")
  (suggest [_ query] "Supports OpenSearch libraries suggest search."))

(defrecord Searcher [clojars-stats ^Directory index]
  ISearcher
  (all-docs [_]
    (search/all-docs index))
  (index-artifact [_ artifact]
    (search/index! clojars-stats index [artifact]))
  (search [_ query]
    (search/search index query))
  (suggest [_ query]
    (search/suggest index query)))

(defmethod ig/init-key :cljdoc/searcher [k {:keys [clojars-stats index-factory index-dir enable-indexer?] :or {enable-indexer? true}}]
  (log/info "Starting" k)
  (let [index (if index-factory ;; to support unit testing
                (index-factory)
                (search/disk-index index-dir))]
    (map->Searcher {:index index
                    :clojars-stats clojars-stats
                    :artifact-indexer (when enable-indexer?
                                        (log/info "Starting ArtifactIndexer")
                                        (tt/every! (.toSeconds TimeUnit/HOURS 1)
                                                   #(search/download-and-index! clojars-stats index)))})))

(defmethod ig/halt-key! :cljdoc/searcher [k {:keys [artifact-indexer index] :as _searcher}]
  (log/info "Stopping" k)
  (when artifact-indexer
    (log/info "Stopping ArtifactIndexer")
    (tt/cancel! artifact-indexer))
  (when index
    (.close index)))

(comment

  (def sr (ig/init-key :cljdoc/searcher {:index-dir "data/index"}))
  (ig/halt-key! :cljdoc/searcher sr)

  nil)
