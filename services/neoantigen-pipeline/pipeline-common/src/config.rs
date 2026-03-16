use crate::error::PipelineError;

/// Configuration parsed from environment variables set by the orchestrator dispatcher.
#[derive(Debug, Clone)]
pub struct PipelineConfig {
    pub job_id: String,
    pub step: String,
    pub nats_url: String,
    pub s3_bucket: String,
    pub tumor_data_path: String,
    pub normal_data_path: String,
    pub input_format: String,
    pub reference_genome: String,
    pub rna_data_path: Option<String>,
    pub threads: usize,
}

impl PipelineConfig {
    /// Parse configuration from environment variables.
    pub fn from_env() -> Result<Self, PipelineError> {
        let threads = std::env::var("PIPELINE_THREADS")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or_else(num_cpus);

        Ok(Self {
            job_id: require_env("PIPELINE_JOB_ID")?,
            step: require_env("PIPELINE_STEP")?,
            nats_url: std::env::var("NATS_URL")
                .unwrap_or_else(|_| "nats://localhost:4222".to_string()),
            s3_bucket: require_env("AWS_S3_PIPELINE_BUCKET")?,
            tumor_data_path: require_env("TUMOR_DATA_PATH")?,
            normal_data_path: require_env("NORMAL_DATA_PATH")?,
            input_format: require_env("INPUT_FORMAT")?,
            reference_genome: require_env("REFERENCE_GENOME")?,
            rna_data_path: std::env::var("RNA_DATA_PATH").ok(),
            threads,
        })
    }
}

fn require_env(key: &str) -> Result<String, PipelineError> {
    std::env::var(key).map_err(|_| PipelineError::MissingEnvVar(key.to_string()))
}

fn num_cpus() -> usize {
    std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn missing_env_var_is_permanent_error() {
        // Clear any leftover vars
        std::env::remove_var("PIPELINE_JOB_ID");
        let err = PipelineConfig::from_env().unwrap_err();
        assert!(!err.is_retryable());
        assert!(matches!(err, PipelineError::MissingEnvVar(_)));
    }
}
