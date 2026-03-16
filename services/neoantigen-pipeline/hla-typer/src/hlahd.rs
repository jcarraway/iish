use std::path::Path;

use pipeline_common::error::PipelineError;
use pipeline_common::process;
use serde::{Deserialize, Serialize};
use tracing::info;

/// HLA-HD result: Class I + Class II alleles.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HlaHdResult {
    pub hla_a: [String; 2],
    pub hla_b: [String; 2],
    pub hla_c: [String; 2],
    pub hla_drb1: [String; 2],
    pub hla_dqb1: [String; 2],
    pub hla_dpb1: [String; 2],
}

/// Run HLA-HD for Class I + Class II typing.
pub async fn run_hlahd(
    r1: &Path,
    r2: &Path,
    output_dir: &Path,
) -> Result<HlaHdResult, PipelineError> {
    info!("running HLA-HD");

    let hlahd_data = std::env::var("HLAHD_DATA_DIR").unwrap_or_else(|_| "/opt/hlahd/data".to_string());

    let result = process::run_command(
        "hlahd.sh",
        &[
            "-t",
            "4",
            "-m",
            "50",
            "-f",
            &format!("{hlahd_data}/freq_data"),
            r1.to_str().unwrap(),
            r2.to_str().unwrap(),
            &format!("{hlahd_data}/gene_split.txt"),
            &format!("{hlahd_data}/dictionary"),
            output_dir.to_str().unwrap(),
            "sample",
        ],
    )
    .await?;

    if result.exit_code != 0 {
        return Err(PipelineError::ToolCrash {
            code: result.exit_code,
            message: format!("HLA-HD failed: {}", result.stderr),
        });
    }

    parse_hlahd_result(output_dir).await
}

/// Parse HLA-HD result files.
async fn parse_hlahd_result(output_dir: &Path) -> Result<HlaHdResult, PipelineError> {
    // HLA-HD writes results to {output_dir}/sample/result/sample_final.result.txt
    let result_file = output_dir.join("sample/result/sample_final.result.txt");

    let contents = tokio::fs::read_to_string(&result_file)
        .await
        .map_err(|e| PipelineError::ParseError(format!("failed to read HLA-HD result: {e}")))?;

    let mut alleles: std::collections::HashMap<String, [String; 2]> = std::collections::HashMap::new();

    for line in contents.lines() {
        let fields: Vec<&str> = line.split('\t').collect();
        if fields.len() < 3 {
            continue;
        }

        let gene = fields[0].trim();
        let allele1 = normalize_hlahd_allele(fields[1].trim());
        let allele2 = normalize_hlahd_allele(fields[2].trim());

        if allele1 != "-" && allele2 != "-" {
            alleles.insert(gene.to_string(), [allele1, allele2]);
        }
    }

    let get_alleles = |gene: &str| -> Result<[String; 2], PipelineError> {
        alleles.get(gene).cloned().ok_or_else(|| {
            PipelineError::ParseError(format!("HLA-HD missing result for {gene}"))
        })
    };

    Ok(HlaHdResult {
        hla_a: get_alleles("A")?,
        hla_b: get_alleles("B")?,
        hla_c: get_alleles("C")?,
        hla_drb1: get_alleles("DRB1")?,
        hla_dqb1: get_alleles("DQB1")?,
        hla_dpb1: get_alleles("DPB1")?,
    })
}

/// Normalize HLA-HD allele format to standard nomenclature.
fn normalize_hlahd_allele(allele: &str) -> String {
    if allele == "-" || allele == "Not typed" || allele.is_empty() {
        return "-".to_string();
    }

    let a = allele.trim();
    // HLA-HD outputs like "A*02:01:01:01" — truncate to 2-field resolution
    if let Some(gene_allele) = a.strip_prefix("HLA-") {
        let parts: Vec<&str> = gene_allele.splitn(2, '*').collect();
        if parts.len() == 2 {
            let fields: Vec<&str> = parts[1].split(':').collect();
            let two_field = if fields.len() >= 2 {
                format!("{}:{}", fields[0], fields[1])
            } else {
                parts[1].to_string()
            };
            return format!("HLA-{}*{}", parts[0], two_field);
        }
    }

    // If it doesn't start with HLA-, add it
    if !a.starts_with("HLA-") {
        let parts: Vec<&str> = a.splitn(2, '*').collect();
        if parts.len() == 2 {
            let fields: Vec<&str> = parts[1].split(':').collect();
            let two_field = if fields.len() >= 2 {
                format!("{}:{}", fields[0], fields[1])
            } else {
                parts[1].to_string()
            };
            return format!("HLA-{}*{}", parts[0], two_field);
        }
    }

    a.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalize_alleles() {
        assert_eq!(
            normalize_hlahd_allele("HLA-A*02:01:01:01"),
            "HLA-A*02:01"
        );
        assert_eq!(normalize_hlahd_allele("A*24:02:01"), "HLA-A*24:02");
        assert_eq!(normalize_hlahd_allele("HLA-DRB1*04:01"), "HLA-DRB1*04:01");
        assert_eq!(normalize_hlahd_allele("-"), "-");
        assert_eq!(normalize_hlahd_allele("Not typed"), "-");
    }

    #[tokio::test]
    async fn parse_hlahd_output() {
        let dir = tempfile::tempdir().unwrap();
        let result_dir = dir.path().join("sample/result");
        tokio::fs::create_dir_all(&result_dir).await.unwrap();

        let result_content = "A\tHLA-A*02:01:01:01\tHLA-A*24:02:01:01\n\
            B\tHLA-B*07:02:01:01\tHLA-B*44:02:01:01\n\
            C\tHLA-C*07:02:01:03\tHLA-C*05:01:01:02\n\
            DRB1\tHLA-DRB1*04:01:01:01\tHLA-DRB1*15:01:01:01\n\
            DQB1\tHLA-DQB1*03:02:01:01\tHLA-DQB1*06:02:01:01\n\
            DPB1\tHLA-DPB1*04:01:01:01\tHLA-DPB1*02:01:02:01\n";

        tokio::fs::write(result_dir.join("sample_final.result.txt"), result_content)
            .await
            .unwrap();

        let result = parse_hlahd_result(dir.path()).await.unwrap();

        assert_eq!(result.hla_a, ["HLA-A*02:01", "HLA-A*24:02"]);
        assert_eq!(result.hla_drb1, ["HLA-DRB1*04:01", "HLA-DRB1*15:01"]);
        assert_eq!(result.hla_dpb1, ["HLA-DPB1*04:01", "HLA-DPB1*02:01"]);
    }
}
