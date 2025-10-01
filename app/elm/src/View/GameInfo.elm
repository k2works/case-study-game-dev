module View.GameInfo exposing (viewGameInfo)

import Html exposing (Html, div, span, text)
import Html.Attributes exposing (style)


-- 時間フォーマット
formatTime : Int -> String
formatTime seconds =
    let
        minutes =
            seconds // 60

        remainingSeconds =
            modBy 60 seconds
    in
    String.fromInt minutes
        ++ ":"
        ++ (if remainingSeconds < 10 then
                "0"

            else
                ""
           )
        ++ String.fromInt remainingSeconds


-- ゲーム情報の表示
viewGameInfo : Int -> Int -> Int -> Int -> Html msg
viewGameInfo score level chainCount gameTime =
    div
        [ style "border" "2px solid #333"
        , style "padding" "10px"
        , style "background-color" "#fff"
        ]
        [ div [ style "display" "flex", style "justify-content" "space-between", style "margin" "5px 0" ]
            [ span [ style "font-weight" "bold" ] [ text "スコア:" ]
            , span [] [ text (String.fromInt score) ]
            ]
        , div [ style "display" "flex", style "justify-content" "space-between", style "margin" "5px 0" ]
            [ span [ style "font-weight" "bold" ] [ text "レベル:" ]
            , span [] [ text (String.fromInt level) ]
            ]
        , div [ style "display" "flex", style "justify-content" "space-between", style "margin" "5px 0" ]
            [ span [ style "font-weight" "bold" ] [ text "連鎖:" ]
            , span [] [ text (String.fromInt chainCount) ]
            ]
        , div [ style "display" "flex", style "justify-content" "space-between", style "margin" "5px 0" ]
            [ span [ style "font-weight" "bold" ] [ text "時間:" ]
            , span [] [ text (formatTime gameTime) ]
            ]
        ]
