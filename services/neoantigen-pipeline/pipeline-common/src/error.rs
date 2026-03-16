use thiserror::Error;

/// Pipeline errors with retryable vs permanent classification.
#[derive(Error, Debug)]
pub enum PipelineError {
    // Permanent errors
    #[error("missing environment variable: {0}")]
    MissingEnvVar(String),

    #[error("invalid input: {0}")]
    InvalidInput(String),

    #[error("quality gate failed: {0}")]
    QualityGateFailed(String),

    #[error("tool crashed with exit code {code}: {message}")]
    ToolCrash { code: i32, message: String },

    #[error("parse error: {0}")]
    ParseError(String),

    // Retryable errors
    #[error("S3 error: {0}")]
    S3Error(String),

    #[error("NATS error: {0}")]
    NatsError(String),

    #[error("process killed by OOM (signal 9)")]
    OutOfMemory,

    #[error("subprocess timed out")]
    Timeout,

    // Generic
    #[error("{0}")]
    Other(String),
}

impl PipelineError {
    /// Whether this error should trigger a retry.
    pub fn is_retryable(&self) -> bool {
        matches!(
            self,
            PipelineError::S3Error(_)
                | PipelineError::NatsError(_)
                | PipelineError::OutOfMemory
                | PipelineError::Timeout
        )
    }

    /// Exit code for the container process.
    /// 0 = success, 1 = retryable failure, 2 = permanent failure.
    pub fn exit_code(&self) -> i32 {
        if self.is_retryable() {
            1
        } else {
            2
        }
    }
}

impl From<aws_sdk_s3::Error> for PipelineError {
    fn from(e: aws_sdk_s3::Error) -> Self {
        PipelineError::S3Error(e.to_string())
    }
}

impl From<serde_json::Error> for PipelineError {
    fn from(e: serde_json::Error) -> Self {
        PipelineError::ParseError(e.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn retryable_errors() {
        assert!(PipelineError::S3Error("timeout".into()).is_retryable());
        assert!(PipelineError::NatsError("conn refused".into()).is_retryable());
        assert!(PipelineError::OutOfMemory.is_retryable());
        assert!(PipelineError::Timeout.is_retryable());
    }

    #[test]
    fn permanent_errors() {
        assert!(!PipelineError::InvalidInput("bad".into()).is_retryable());
        assert!(!PipelineError::QualityGateFailed("low cov".into()).is_retryable());
        assert!(!PipelineError::MissingEnvVar("X".into()).is_retryable());
        assert!(!PipelineError::ToolCrash { code: 1, message: "segfault".into() }.is_retryable());
    }

    #[test]
    fn exit_codes() {
        assert_eq!(PipelineError::S3Error("x".into()).exit_code(), 1);
        assert_eq!(PipelineError::InvalidInput("x".into()).exit_code(), 2);
    }
}
