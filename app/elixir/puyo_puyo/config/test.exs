import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :puyo_puyo, PuyoPuyoWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "vVvdTtLoZkjlRMXHgDLK7BQin7oCzC5osIUqCsAwlmbPmps50M68K6YROCCd2Q/9",
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

# Enable helpful, but potentially expensive runtime checks
config :phoenix_live_view,
  enable_expensive_runtime_checks: true
