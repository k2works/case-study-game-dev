package com.example.puyo

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class MainSpec extends AnyFlatSpec with Matchers:
  "Main" should "exist" in {
    Main shouldBe a[Object]
  }
