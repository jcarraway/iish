"""AlphaFold Server API client for structure prediction fallback.

Used when no template PDB is available for a given HLA allele.
Rate-limited and async with configurable timeout.
"""

import asyncio
import logging
import os
from pathlib import Path
from typing import Optional

import requests

logger = logging.getLogger(__name__)

ALPHAFOLD_API_URL = os.environ.get(
    "ALPHAFOLD_API_URL",
    "https://alphafoldserver.com/api/v1",
)

# Rate limiting: max 1 request per 10 seconds
_last_request_time = 0.0
RATE_LIMIT_SECONDS = 10.0

# Timeout for waiting on prediction results
PREDICTION_TIMEOUT_SECONDS = 1800  # 30 minutes


async def predict_structure(
    peptide: str,
    hla_allele: str,
    output_path: Path,
) -> Optional[Path]:
    """Submit a peptide-MHC structure prediction to AlphaFold Server.

    This is a fallback for alleles without template PDB structures.
    Returns the path to the predicted PDB file, or None on failure.
    """
    global _last_request_time

    api_key = os.environ.get("ALPHAFOLD_API_KEY")
    if not api_key:
        logger.warning("ALPHAFOLD_API_KEY not set; skipping AlphaFold prediction")
        return None

    # Rate limiting
    now = asyncio.get_event_loop().time()
    elapsed = now - _last_request_time
    if elapsed < RATE_LIMIT_SECONDS:
        await asyncio.sleep(RATE_LIMIT_SECONDS - elapsed)

    try:
        _last_request_time = asyncio.get_event_loop().time()

        # Submit prediction job
        submit_response = await asyncio.to_thread(
            _submit_prediction, peptide, hla_allele, api_key
        )

        if submit_response is None:
            return None

        job_id = submit_response

        # Poll for results
        result = await _poll_for_result(job_id, api_key)
        if result is None:
            return None

        # Save PDB
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(result)

        logger.info(
            "AlphaFold prediction complete for %s/%s -> %s",
            peptide, hla_allele, output_path,
        )
        return output_path

    except Exception as e:
        logger.error("AlphaFold prediction failed for %s/%s: %s", peptide, hla_allele, e)
        return None


def _submit_prediction(peptide: str, hla_allele: str, api_key: str) -> Optional[str]:
    """Submit a structure prediction request. Returns job ID or None."""
    try:
        response = requests.post(
            f"{ALPHAFOLD_API_URL}/predictions",
            json={
                "sequences": [
                    {"protein": {"sequence": peptide, "name": "peptide"}},
                ],
                "modelConfig": {
                    "model": "alphafold2",
                },
            },
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("jobId") or data.get("id")
    except requests.RequestException as e:
        logger.error("Failed to submit AlphaFold prediction: %s", e)
        return None


async def _poll_for_result(job_id: str, api_key: str) -> Optional[str]:
    """Poll for prediction results with timeout."""
    poll_interval = 30  # seconds
    elapsed = 0

    while elapsed < PREDICTION_TIMEOUT_SECONDS:
        await asyncio.sleep(poll_interval)
        elapsed += poll_interval

        try:
            response = await asyncio.to_thread(
                requests.get,
                f"{ALPHAFOLD_API_URL}/predictions/{job_id}",
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()

            status = data.get("status", "")
            if status == "completed":
                pdb_url = data.get("pdbUrl") or data.get("resultUrl")
                if pdb_url:
                    pdb_response = requests.get(pdb_url, timeout=30)
                    pdb_response.raise_for_status()
                    return pdb_response.text
                return None

            if status in ("failed", "error"):
                logger.error("AlphaFold prediction %s failed: %s", job_id, data.get("error"))
                return None

        except requests.RequestException as e:
            logger.warning("Error polling AlphaFold prediction %s: %s", job_id, e)

    logger.error("AlphaFold prediction %s timed out after %ds", job_id, PREDICTION_TIMEOUT_SECONDS)
    return None
