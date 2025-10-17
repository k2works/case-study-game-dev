defmodule PuyoPuyoWeb.Router do
  use PuyoPuyoWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {PuyoPuyoWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", PuyoPuyoWeb do
    pipe_through :browser

    get "/", PageController, :home

    # ぷよぷよゲームのルート
    live "/game", GameLive
  end

  # Other scopes may use custom stacks.
  # scope "/api", PuyoPuyoWeb do
  #   pipe_through :api
  # end
end
