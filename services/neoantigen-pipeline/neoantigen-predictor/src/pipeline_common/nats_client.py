"""NATS JetStream client matching pipeline-common/src/nats.rs."""

import json
import logging
from typing import Optional

import nats
from nats.js import JetStreamContext

from .events import StepCompleteEvent, StepFailedEvent, ProgressEvent

logger = logging.getLogger(__name__)


class NatsClient:
    def __init__(self):
        self._nc = None
        self._js: Optional[JetStreamContext] = None

    async def connect(self, nats_url: str) -> None:
        self._nc = await nats.connect(nats_url)
        self._js = self._nc.jetstream()
        logger.info("Connected to NATS at %s", nats_url)

    async def publish_step_complete(self, event: StepCompleteEvent) -> None:
        subject = f"PIPELINE.step.{event.step}.complete"
        payload = json.dumps(event.to_dict()).encode()
        await self._js.publish(subject, payload)
        logger.info("Published step complete: %s for job %s", event.step, event.job_id)

    async def publish_step_failed(self, event: StepFailedEvent) -> None:
        subject = "PIPELINE.step.failed"
        payload = json.dumps(event.to_dict()).encode()
        await self._js.publish(subject, payload)
        logger.info("Published step failed: %s for job %s", event.step, event.job_id)

    async def publish_progress(self, event: ProgressEvent) -> None:
        subject = "PIPELINE.progress"
        payload = json.dumps(event.to_dict()).encode()
        await self._js.publish(subject, payload)

    async def close(self) -> None:
        if self._nc:
            await self._nc.close()
