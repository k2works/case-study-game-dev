package ml

import krangl.DataFrame
import krangl.readCSV
import java.io.File

/**
 * CSV データを読み込むクラス
 */
class DataLoader {

    /**
     * CSV ファイルを読み込む
     *
     * @param filePath CSV ファイルのパス
     * @return 読み込んだ DataFrame
     * @throws IllegalArgumentException ファイルが存在しない、またはパスが空の場合
     */
    fun loadCsv(filePath: String): DataFrame {
        // バリデーション：空のパスはダメ！
        require(filePath.isNotEmpty()) { "File path cannot be empty" }

        // ファイルの存在確認
        val file = File(filePath)
        require(file.exists()) { "File not found: $filePath" }

        // データを読み込む
        return DataFrame.readCSV(file)
    }
}
