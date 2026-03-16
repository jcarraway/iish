use async_nats::jetstream;
use tracing::{info, instrument};

use crate::error::PipelineError;
use crate::events::{
    step_complete_subject, ProgressEvent, StepCompleteEvent, StepFailedEvent,
    PROGRESS_SUBJECT, STEP_FAILED_SUBJECT,
};

/// Connect to NATS JetStream.
pub async fn connect(nats_url: &str) -> Result<jetstream::Context, PipelineError> {
    let client = async_nats::connect(nats_url)
        .await
        .map_err(|e| PipelineError::NatsError(format!("failed to connect to NATS: {e}")))?;

    info!(nats_url, "connected to NATS");
    Ok(jetstream::new(client))
}

/// Publish a step completion event.
#[instrument(skip(js))]
pub async fn publish_step_complete(
    js: &jetstream::Context,
    event: &StepCompleteEvent,
) -> Result<(), PipelineError> {
    let subject = step_complete_subject(&event.step);
    let payload = serde_json::to_vec(event)?;

    js.publish(subject.clone(), payload.into())
        .await
        .map_err(|e| PipelineError::NatsError(format!("publish to {subject} failed: {e}")))?
        .await
        .map_err(|e| PipelineError::NatsError(format!("ack for {subject} failed: {e}")))?;

    info!(subject, job_id = %event.job_id, "published step complete");
    Ok(())
}

/// Publish a step failure event.
#[instrument(skip(js))]
pub async fn publish_step_failed(
    js: &jetstream::Context,
    event: &StepFailedEvent,
) -> Result<(), PipelineError> {
    let payload = serde_json::to_vec(event)?;

    js.publish(STEP_FAILED_SUBJECT, payload.into())
        .await
        .map_err(|e| PipelineError::NatsError(format!("publish step failed: {e}")))?
        .await
        .map_err(|e| PipelineError::NatsError(format!("ack step failed: {e}")))?;

    info!(job_id = %event.job_id, step = %event.step, "published step failed");
    Ok(())
}

/// Publish a progress update event.
#[instrument(skip(js))]
pub async fn publish_progress(
    js: &jetstream::Context,
    event: &ProgressEvent,
) -> Result<(), PipelineError> {
    let payload = serde_json::to_vec(event)?;

    js.publish(PROGRESS_SUBJECT, payload.into())
        .await
        .map_err(|e| PipelineError::NatsError(format!("publish progress failed: {e}")))?
        .await
        .map_err(|e| PipelineError::NatsError(format!("ack progress failed: {e}")))?;

    Ok(())
}
