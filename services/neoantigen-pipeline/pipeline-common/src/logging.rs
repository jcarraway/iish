use tracing_subscriber::{fmt, EnvFilter};

/// Initialize structured JSON logging via tracing-subscriber.
/// Respects `RUST_LOG` env var, defaults to `info`.
pub fn init() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    fmt()
        .json()
        .with_env_filter(filter)
        .with_target(true)
        .with_thread_ids(false)
        .with_file(false)
        .with_line_number(false)
        .init();
}
