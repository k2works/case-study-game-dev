import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import com.example.puyopuyo.GameApp

fun main() =
    application {
        Window(
            onCloseRequest = ::exitApplication,
            title = "ぷよぷよ TDD",
        ) {
            GameApp()
        }
    }
