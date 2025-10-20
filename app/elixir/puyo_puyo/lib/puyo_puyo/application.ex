defmodule PuyoPuyo.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      PuyoPuyoWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:puyo_puyo, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: PuyoPuyo.PubSub},
      # Start a worker by calling: PuyoPuyo.Worker.start_link(arg)
      # {PuyoPuyo.Worker, arg},
      # Start to serve requests, typically the last entry
      PuyoPuyoWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: PuyoPuyo.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    PuyoPuyoWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
