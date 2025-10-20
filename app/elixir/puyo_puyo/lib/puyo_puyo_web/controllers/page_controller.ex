defmodule PuyoPuyoWeb.PageController do
  use PuyoPuyoWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
