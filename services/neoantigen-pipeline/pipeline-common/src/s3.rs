use aws_sdk_s3::Client;
use aws_sdk_s3::primitives::ByteStream;
use std::path::Path;
use tokio::fs;
use tracing::{info, instrument};

use crate::error::PipelineError;

const MULTIPART_THRESHOLD: u64 = 50 * 1024 * 1024; // 50 MB
const PART_SIZE: u64 = 50 * 1024 * 1024; // 50 MB parts

/// Create an S3 client from the default AWS config.
pub async fn create_client() -> Client {
    let config = aws_config::load_defaults(aws_config::BehaviorVersion::latest()).await;
    Client::new(&config)
}

/// Download a file from S3 to a local path.
#[instrument(skip(client), fields(bucket, key, local_path))]
pub async fn download_file(
    client: &Client,
    bucket: &str,
    key: &str,
    local_path: &Path,
) -> Result<(), PipelineError> {
    info!(bucket, key, ?local_path, "downloading from S3");

    if let Some(parent) = local_path.parent() {
        fs::create_dir_all(parent)
            .await
            .map_err(|e| PipelineError::Other(format!("failed to create directory: {e}")))?;
    }

    let resp = client
        .get_object()
        .bucket(bucket)
        .key(key)
        .send()
        .await
        .map_err(|e| PipelineError::S3Error(format!("GetObject failed for {key}: {e}")))?;

    let body = resp
        .body
        .collect()
        .await
        .map_err(|e| PipelineError::S3Error(format!("failed to read S3 body: {e}")))?;

    fs::write(local_path, body.into_bytes())
        .await
        .map_err(|e| PipelineError::Other(format!("failed to write file: {e}")))?;

    info!(key, "download complete");
    Ok(())
}

/// Upload a local file to S3, using multipart for large files.
#[instrument(skip(client), fields(bucket, key, local_path))]
pub async fn upload_file(
    client: &Client,
    bucket: &str,
    key: &str,
    local_path: &Path,
) -> Result<(), PipelineError> {
    let metadata = fs::metadata(local_path)
        .await
        .map_err(|e| PipelineError::Other(format!("failed to stat file: {e}")))?;

    let file_size = metadata.len();
    info!(bucket, key, file_size, "uploading to S3");

    if file_size > MULTIPART_THRESHOLD {
        upload_multipart(client, bucket, key, local_path, file_size).await
    } else {
        upload_simple(client, bucket, key, local_path).await
    }
}

async fn upload_simple(
    client: &Client,
    bucket: &str,
    key: &str,
    local_path: &Path,
) -> Result<(), PipelineError> {
    let body = ByteStream::from_path(local_path)
        .await
        .map_err(|e| PipelineError::Other(format!("failed to read file: {e}")))?;

    client
        .put_object()
        .bucket(bucket)
        .key(key)
        .server_side_encryption(aws_sdk_s3::types::ServerSideEncryption::Aes256)
        .body(body)
        .send()
        .await
        .map_err(|e| PipelineError::S3Error(format!("PutObject failed for {key}: {e}")))?;

    info!(key, "upload complete");
    Ok(())
}

async fn upload_multipart(
    client: &Client,
    bucket: &str,
    key: &str,
    local_path: &Path,
    file_size: u64,
) -> Result<(), PipelineError> {
    let create = client
        .create_multipart_upload()
        .bucket(bucket)
        .key(key)
        .server_side_encryption(aws_sdk_s3::types::ServerSideEncryption::Aes256)
        .send()
        .await
        .map_err(|e| PipelineError::S3Error(format!("CreateMultipartUpload failed: {e}")))?;

    let upload_id = create
        .upload_id()
        .ok_or_else(|| PipelineError::S3Error("no upload_id returned".to_string()))?
        .to_string();

    let file_data = fs::read(local_path)
        .await
        .map_err(|e| PipelineError::Other(format!("failed to read file: {e}")))?;

    let mut completed_parts = Vec::new();
    let mut offset: u64 = 0;
    let mut part_number: i32 = 1;

    while offset < file_size {
        let end = std::cmp::min(offset + PART_SIZE, file_size);
        let chunk = &file_data[offset as usize..end as usize];

        let part = client
            .upload_part()
            .bucket(bucket)
            .key(key)
            .upload_id(&upload_id)
            .part_number(part_number)
            .body(ByteStream::from(chunk.to_vec()))
            .send()
            .await
            .map_err(|e| PipelineError::S3Error(format!("UploadPart {part_number} failed: {e}")))?;

        completed_parts.push(
            aws_sdk_s3::types::CompletedPart::builder()
                .part_number(part_number)
                .set_e_tag(part.e_tag().map(|s| s.to_string()))
                .build(),
        );

        offset = end;
        part_number += 1;
    }

    let completed = aws_sdk_s3::types::CompletedMultipartUpload::builder()
        .set_parts(Some(completed_parts))
        .build();

    client
        .complete_multipart_upload()
        .bucket(bucket)
        .key(key)
        .upload_id(&upload_id)
        .multipart_upload(completed)
        .send()
        .await
        .map_err(|e| PipelineError::S3Error(format!("CompleteMultipartUpload failed: {e}")))?;

    info!(key, parts = part_number - 1, "multipart upload complete");
    Ok(())
}
