package com.example.puyopuyo

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import org.junit.Rule
import org.junit.Test

class GameAppTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun アプリ起動時にタイトルが表示される() {
        composeTestRule.setContent {
            GameApp()
        }

        composeTestRule.waitForIdle()
        composeTestRule.onNodeWithText("ぷよぷよ").assertExists()
    }

    @Test
    fun アプリ起動時にスコアが表示される() {
        composeTestRule.setContent {
            GameApp()
        }

        composeTestRule.waitForIdle()
        composeTestRule.onNodeWithText("スコア: 0").assertExists()
    }

    @Test
    fun リセットボタンが表示される() {
        composeTestRule.setContent {
            GameApp()
        }

        composeTestRule.waitForIdle()
        composeTestRule.onNodeWithText("リセット").assertExists()
    }

    @Test
    fun リセットボタンをクリックするとスコアが0になる() {
        composeTestRule.setContent {
            GameApp()
        }

        composeTestRule.waitForIdle()

        // リセットボタンをクリック
        composeTestRule.onNodeWithText("リセット").performClick()

        composeTestRule.waitForIdle()

        // スコアが0になることを確認
        composeTestRule.onNodeWithText("スコア: 0").assertExists()
    }

    @Test
    fun ゲーム画面が表示される() {
        composeTestRule.setContent {
            GameApp()
        }

        composeTestRule.waitForIdle()

        // 主要なUIコンポーネントが表示されることを確認
        composeTestRule.onNodeWithText("ぷよぷよ").assertExists()

        composeTestRule.waitForIdle()
        composeTestRule.onNodeWithText("スコア: 0").assertExists()

        composeTestRule.waitForIdle()
        composeTestRule.onNodeWithText("リセット").assertExists()
    }
}
