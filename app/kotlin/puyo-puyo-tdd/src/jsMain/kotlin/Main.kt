import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.window.CanvasBasedWindow
import com.example.puyopuyo.GameApp
import kotlinx.browser.window

@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    console.log("Application main() called")

    // Skiko は HTML 側で既に初期化済みなので、直接アプリケーションを起動
    try {
        CanvasBasedWindow(canvasElementId = "ComposeTarget", title = "ぷよぷよ TDD") {
            GameApp()
        }
        console.log("CanvasBasedWindow created successfully")
    } catch (e: Throwable) {
        console.error("Failed to create CanvasBasedWindow:", e.message)
        window.alert("Failed to start application: ${e.message}")
    }
}
