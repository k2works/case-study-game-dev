package ml

import org.apache.spark.sql.{DataFrame, SparkSession}

class CinemaPredictor(spark: SparkSession) {

  def loadData(path: String): DataFrame = {
    spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(path)
  }
}

object CinemaPredictor {
  def apply(spark: SparkSession): CinemaPredictor = new CinemaPredictor(spark)
}
