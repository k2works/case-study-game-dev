package ml

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.apache.spark.sql.SparkSession

class CinemaPredictorSpec extends AnyFlatSpec with Matchers {

  val spark: SparkSession = SparkSession.builder()
    .appName("CinemaPredictorTest")
    .master("local[*]")
    .config("spark.driver.bindAddress", "127.0.0.1")
    .getOrCreate()

  spark.sparkContext.setLogLevel("ERROR")

  "CinemaPredictor" should "データを読み込める" in {
    val predictor = CinemaPredictor(spark)
    val df = predictor.loadData("data/cinema.csv")

    df.count() should be > 0L
    df.columns should contain allOf("budget", "popularity", "runtime", "vote_average", "genre", "revenue")
  }
}
