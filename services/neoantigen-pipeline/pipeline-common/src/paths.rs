/// S3 path conventions mirroring `packages/pipeline-storage/src/paths.ts`.

pub fn input_path(patient_id: &str, job_id: &str, filename: &str) -> String {
    format!("input/{patient_id}/{job_id}/{filename}")
}

pub fn intermediate_path(job_id: &str, filename: &str) -> String {
    format!("intermediate/{job_id}/{filename}")
}

pub fn results_path(job_id: &str, filename: &str) -> String {
    format!("results/{job_id}/{filename}")
}

pub fn reference_path(genome: &str, filename: &str) -> String {
    format!("reference/{genome}/{filename}")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn intermediate_path_format() {
        assert_eq!(
            intermediate_path("abc-123", "aligned_tumor.bam"),
            "intermediate/abc-123/aligned_tumor.bam"
        );
    }

    #[test]
    fn reference_path_format() {
        assert_eq!(
            reference_path("GRCh38", "genome.fa"),
            "reference/GRCh38/genome.fa"
        );
    }

    #[test]
    fn input_path_format() {
        assert_eq!(
            input_path("patient-1", "job-1", "tumor_R1.fastq.gz"),
            "input/patient-1/job-1/tumor_R1.fastq.gz"
        );
    }

    #[test]
    fn results_path_format() {
        assert_eq!(
            results_path("job-1", "report.pdf"),
            "results/job-1/report.pdf"
        );
    }
}
