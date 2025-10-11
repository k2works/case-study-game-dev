import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowState
import androidx.compose.ui.window.application
import com.example.puyopuyo.GameApp

fun main() =
    application {
        Window(
            onCloseRequest = ::exitApplication,
            title = "ぷよぷよ TDD",
            state = WindowState(width = 400.dp, height = 800.dp),
        ) {
            GameApp()
        }
    }
