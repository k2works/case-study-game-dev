# Build Assets

このディレクトリには、アプリケーションのビルドに必要なアセットファイルを配置します。

## 必要なアイコンファイル

### Windows
- **icon.ico**: Windows用アイコン（256x256ピクセル以上推奨）

### macOS
- **icon.icns**: macOS用アイコン（512x512ピクセル以上推奨）

### Linux
- **icon.png**: Linux用アイコン（512x512ピクセル推奨）

## アイコン作成ツール

### オンラインツール
- [iConvert Icons](https://iconverticons.com/online/) - PNG から ICO/ICNS への変換
- [CloudConvert](https://cloudconvert.com/) - 各種画像フォーマット変換

### コマンドラインツール
```bash
# PNG から ICO を作成（ImageMagick を使用）
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# PNG から ICNS を作成（macOS の iconutil を使用）
mkdir icon.iconset
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
cp icon.png icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset
```

## プレースホルダーアイコン

開発中は、electron-builder がデフォルトの Electron アイコンを使用します。
本番リリース時には、上記のアイコンファイルを配置してください。

## ファイル構成

```
build/
├── README.md           # このファイル
├── icon.ico           # Windows アイコン（要作成）
├── icon.icns          # macOS アイコン（要作成）
└── icon.png           # Linux アイコン（要作成）
```
