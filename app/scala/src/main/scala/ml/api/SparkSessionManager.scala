package ml.api

import org.apache.spark.sql.SparkSession

object SparkSessionManager {

  @volatile private var instance: Option[SparkSession] = None

  def getOrCreate(): SparkSession = {
    instance match {
      case Some(spark) if !spark.sparkContext.isStopped => spark
      case _ =>
        synchronized {
          instance match {
            case Some(spark) if !spark.sparkContext.isStopped => spark
            case _ =>
              val spark = SparkSession.builder()
                .appName("ML API")
                .master("local[*]")
                .config("spark.driver.bindAddress", "127.0.0.1")
                .getOrCreate()

              spark.sparkContext.setLogLevel("ERROR")
              instance = Some(spark)
              spark
          }
        }
    }
  }

  def stop(): Unit = {
    instance.foreach { spark =>
      if (!spark.sparkContext.isStopped) {
        spark.stop()
      }
    }
    instance = None
  }
}
