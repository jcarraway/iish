"""S3 path conventions matching pipeline-common/src/paths.rs."""


def input_path(patient_id: str, job_id: str, filename: str) -> str:
    return f"input/{patient_id}/{job_id}/{filename}"


def intermediate_path(job_id: str, filename: str) -> str:
    return f"intermediate/{job_id}/{filename}"


def results_path(job_id: str, filename: str) -> str:
    return f"results/{job_id}/{filename}"


def reference_path(genome: str, filename: str) -> str:
    return f"reference/{genome}/{filename}"
