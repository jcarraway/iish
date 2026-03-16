"""S3 download/upload utilities matching pipeline-common/src/s3.rs."""

import os
import logging
from pathlib import Path
from typing import Union

import boto3

logger = logging.getLogger(__name__)


class S3Client:
    def __init__(self, bucket: str):
        self.bucket = bucket
        self.client = boto3.client("s3")

    def download_file(self, key: str, local_path: Union[str, Path]) -> None:
        local_path = Path(local_path)
        local_path.parent.mkdir(parents=True, exist_ok=True)
        logger.info("Downloading s3://%s/%s -> %s", self.bucket, key, local_path)
        self.client.download_file(self.bucket, key, str(local_path))

    def upload_file(self, local_path: Union[str, Path], key: str) -> None:
        logger.info("Uploading %s -> s3://%s/%s", local_path, self.bucket, key)
        self.client.upload_file(
            str(local_path),
            self.bucket,
            key,
            ExtraArgs={"ServerSideEncryption": "AES256"},
        )
