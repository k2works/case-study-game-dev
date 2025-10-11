package com.example.puyopuyo

class Score {
    var value: Int = 0
        private set

    fun add(points: Int) {
        value += points
    }

    fun reset() {
        value = 0
    }
}
