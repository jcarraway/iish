use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// NATS subject conventions matching `packages/pipeline-orchestrator/src/events.ts`.
pub fn step_complete_subject(step: &str) -> String {
    format!("PIPELINE.step.{step}.complete")
}

pub const STEP_FAILED_SUBJECT: &str = "PIPELINE.step.failed";
pub const PROGRESS_SUBJECT: &str = "PIPELINE.progress";

/// Payload for `PIPELINE.step.{step}.complete`.
/// Matches `stepCompleteSchema` in events.ts.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StepCompleteEvent {
    pub job_id: String,
    pub step: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

/// Payload for `PIPELINE.step.failed`.
/// Matches `stepFailedSchema` in events.ts.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StepFailedEvent {
    pub job_id: String,
    pub step: String,
    pub error: String,
    pub retryable: bool,
}

/// Payload for `PIPELINE.progress`.
/// Matches `progressSchema` in events.ts.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProgressEvent {
    pub job_id: String,
    pub step: String,
    pub percent_complete: f64,
    pub message: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn step_complete_serialization() {
        let mut metadata = HashMap::new();
        metadata.insert(
            "alignedBamPath".to_string(),
            serde_json::Value::String("intermediate/abc/aligned_tumor.bam".to_string()),
        );

        let event = StepCompleteEvent {
            job_id: "550e8400-e29b-41d4-a716-446655440000".to_string(),
            step: "alignment".to_string(),
            output_path: Some("intermediate/abc/aligned_tumor.bam".to_string()),
            metadata: Some(metadata),
        };

        let json = serde_json::to_value(&event).unwrap();
        assert_eq!(json["jobId"], "550e8400-e29b-41d4-a716-446655440000");
        assert_eq!(json["step"], "alignment");
        assert!(json["metadata"]["alignedBamPath"].is_string());
    }

    #[test]
    fn step_failed_serialization() {
        let event = StepFailedEvent {
            job_id: "550e8400-e29b-41d4-a716-446655440000".to_string(),
            step: "alignment".to_string(),
            error: "OOM killed".to_string(),
            retryable: true,
        };

        let json = serde_json::to_value(&event).unwrap();
        assert_eq!(json["jobId"], "550e8400-e29b-41d4-a716-446655440000");
        assert_eq!(json["retryable"], true);
    }

    #[test]
    fn progress_serialization() {
        let event = ProgressEvent {
            job_id: "abc".to_string(),
            step: "alignment".to_string(),
            percent_complete: 50.0,
            message: "Aligning tumor sample".to_string(),
        };

        let json = serde_json::to_value(&event).unwrap();
        assert_eq!(json["percentComplete"], 50.0);
    }

    #[test]
    fn subject_format() {
        assert_eq!(
            step_complete_subject("alignment"),
            "PIPELINE.step.alignment.complete"
        );
        assert_eq!(
            step_complete_subject("variant_calling"),
            "PIPELINE.step.variant_calling.complete"
        );
    }
}
