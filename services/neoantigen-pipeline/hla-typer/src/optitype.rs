use std::path::Path;

use pipeline_common::error::PipelineError;
use pipeline_common::process;
use serde::{Deserialize, Serialize};
use tracing::info;

/// OptiType result: Class I HLA alleles (HLA-A, HLA-B, HLA-C).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptiTypeResult {
    pub hla_a: [String; 2],
    pub hla_b: [String; 2],
    pub hla_c: [String; 2],
    pub objective: f64,
}

/// Run OptiType for MHC Class I typing.
pub async fn run_optitype(
    r1: &Path,
    r2: &Path,
    output_dir: &Path,
) -> Result<OptiTypeResult, PipelineError> {
    info!("running OptiType");

    let result = process::run_command(
        "python",
        &[
            "/opt/OptiType/OptiTypePipeline.py",
            "-i",
            r1.to_str().unwrap(),
            r2.to_str().unwrap(),
            "--dna",
            "-v",
            "-o",
            output_dir.to_str().unwrap(),
            "-p",
            "sample",
        ],
    )
    .await?;

    if result.exit_code != 0 {
        return Err(PipelineError::ToolCrash {
            code: result.exit_code,
            message: format!("OptiType failed: {}", result.stderr),
        });
    }

    // Parse OptiType TSV output
    parse_optitype_result(output_dir).await
}

/// Parse OptiType result TSV file.
async fn parse_optitype_result(output_dir: &Path) -> Result<OptiTypeResult, PipelineError> {
    // OptiType writes results to {output_dir}/sample_result.tsv
    let result_file = output_dir.join("sample_result.tsv");

    let contents = tokio::fs::read_to_string(&result_file)
        .await
        .map_err(|e| PipelineError::ParseError(format!("failed to read OptiType result: {e}")))?;

    // TSV format: header line, then data line
    // Columns: (empty), A1, A2, B1, B2, C1, C2, Reads, Objective
    let lines: Vec<&str> = contents.lines().collect();
    if lines.len() < 2 {
        return Err(PipelineError::ParseError(
            "OptiType result has fewer than 2 lines".to_string(),
        ));
    }

    let data_line = lines[1];
    let fields: Vec<&str> = data_line.split('\t').collect();

    if fields.len() < 8 {
        return Err(PipelineError::ParseError(format!(
            "OptiType result has {} fields, expected >= 8",
            fields.len()
        )));
    }

    // Fields: index, A1, A2, B1, B2, C1, C2, Reads, Objective
    let normalize = |allele: &str| -> String {
        let a = allele.trim();
        if a.starts_with("HLA-") {
            a.to_string()
        } else {
            format!("HLA-{a}")
        }
    };

    let objective: f64 = fields
        .get(8)
        .unwrap_or(&"0.0")
        .trim()
        .parse()
        .unwrap_or(0.0);

    Ok(OptiTypeResult {
        hla_a: [normalize(fields[1]), normalize(fields[2])],
        hla_b: [normalize(fields[3]), normalize(fields[4])],
        hla_c: [normalize(fields[5]), normalize(fields[6])],
        objective,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn parse_optitype_tsv() {
        let dir = tempfile::tempdir().unwrap();
        let tsv_content = "\tA1\tA2\tB1\tB2\tC1\tC2\tReads\tObjective\n\
            0\tA*02:01\tA*24:02\tB*07:02\tB*44:02\tC*07:02\tC*05:01\t1234\t0.9876\n";

        tokio::fs::write(dir.path().join("sample_result.tsv"), tsv_content)
            .await
            .unwrap();

        let result = parse_optitype_result(dir.path()).await.unwrap();

        assert_eq!(result.hla_a, ["HLA-A*02:01", "HLA-A*24:02"]);
        assert_eq!(result.hla_b, ["HLA-B*07:02", "HLA-B*44:02"]);
        assert_eq!(result.hla_c, ["HLA-C*07:02", "HLA-C*05:01"]);
        assert!((result.objective - 0.9876).abs() < 1e-4);
    }
}
