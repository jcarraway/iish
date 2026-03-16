use std::path::{Path, PathBuf};
use tracing::info;

use pipeline_common::error::PipelineError;
use pipeline_common::process::run_command;

/// Build consensus VCF from Strelka2 and Mutect2 results.
///
/// 1. bcftools concat Strelka SNVs + indels
/// 2. bcftools isec with Mutect2 to find shared/private variants
/// 3. Merge with HIGH (both callers) / MEDIUM (single caller) confidence tags
pub async fn build_consensus(
    strelka_snvs: &Path,
    strelka_indels: &Path,
    mutect_vcf: &Path,
    work_dir: &Path,
) -> Result<PathBuf, PipelineError> {
    let strelka_merged = work_dir.join("strelka_merged.vcf.gz");
    let isec_dir = work_dir.join("isec_output");
    let consensus_vcf = work_dir.join("somatic_variants.vcf");

    // Concat Strelka SNVs + indels
    info!("merging Strelka2 SNVs and indels");
    run_command(
        "bcftools",
        &[
            "concat",
            "-a",
            "-Oz",
            "-o",
            strelka_merged.to_str().unwrap(),
            strelka_snvs.to_str().unwrap(),
            strelka_indels.to_str().unwrap(),
        ],
    )
    .await?;

    // Index merged strelka
    run_command(
        "bcftools",
        &["index", "-t", strelka_merged.to_str().unwrap()],
    )
    .await?;

    // Index mutect if needed
    run_command(
        "bcftools",
        &["index", "-t", mutect_vcf.to_str().unwrap()],
    )
    .await?;

    // bcftools isec to find shared and private variants
    info!("running bcftools isec for consensus");
    let isec_dir_str = isec_dir.to_str().unwrap();
    run_command(
        "bcftools",
        &[
            "isec",
            "-p",
            isec_dir_str,
            strelka_merged.to_str().unwrap(),
            mutect_vcf.to_str().unwrap(),
        ],
    )
    .await?;

    // isec output: 0000.vcf = strelka-only, 0001.vcf = mutect-only,
    //              0002.vcf = shared-strelka, 0003.vcf = shared-mutect
    let strelka_only = isec_dir.join("0000.vcf");
    let mutect_only = isec_dir.join("0001.vcf");
    let shared = isec_dir.join("0002.vcf");

    // Build consensus: tag shared as HIGH, private as MEDIUM
    info!("building tagged consensus VCF");
    build_tagged_vcf(&shared, &strelka_only, &mutect_only, &consensus_vcf).await?;

    info!("consensus VCF complete");
    Ok(consensus_vcf)
}

/// Build a tagged VCF combining shared and private variants with confidence annotations.
async fn build_tagged_vcf(
    shared: &Path,
    strelka_only: &Path,
    mutect_only: &Path,
    output: &Path,
) -> Result<(), PipelineError> {
    // Read shared variants, tag as HIGH confidence
    let shared_content = tokio::fs::read_to_string(shared)
        .await
        .map_err(|e| PipelineError::Other(format!("read shared VCF: {e}")))?;

    let strelka_content = tokio::fs::read_to_string(strelka_only)
        .await
        .map_err(|e| PipelineError::Other(format!("read strelka-only VCF: {e}")))?;

    let mutect_content = tokio::fs::read_to_string(mutect_only)
        .await
        .map_err(|e| PipelineError::Other(format!("read mutect-only VCF: {e}")))?;

    let mut output_lines = Vec::new();
    let mut header_written = false;

    // Write header from shared VCF (or first available)
    for line in shared_content.lines() {
        if line.starts_with('#') {
            if line.starts_with("##") && !header_written {
                output_lines.push(line.to_string());
            } else if line.starts_with("#CHROM") {
                // Add our custom INFO header before the #CHROM line
                output_lines.push(
                    "##INFO=<ID=CALLER_CONFIDENCE,Number=1,Type=String,Description=\"Variant caller agreement: HIGH=both callers, MEDIUM=single caller\">".to_string()
                );
                output_lines.push(line.to_string());
                header_written = true;
            }
        }
    }

    // If no header from shared, try strelka_only
    if !header_written {
        for line in strelka_content.lines().chain(mutect_content.lines()) {
            if line.starts_with("##") {
                output_lines.push(line.to_string());
            } else if line.starts_with("#CHROM") {
                output_lines.push(
                    "##INFO=<ID=CALLER_CONFIDENCE,Number=1,Type=String,Description=\"Variant caller agreement: HIGH=both callers, MEDIUM=single caller\">".to_string()
                );
                output_lines.push(line.to_string());
                break;
            }
        }
    }

    // Add shared variants with HIGH confidence
    for line in shared_content.lines() {
        if !line.starts_with('#') && !line.is_empty() {
            output_lines.push(tag_variant(line, "HIGH"));
        }
    }

    // Add strelka-only variants with MEDIUM confidence
    for line in strelka_content.lines() {
        if !line.starts_with('#') && !line.is_empty() {
            output_lines.push(tag_variant(line, "MEDIUM"));
        }
    }

    // Add mutect-only variants with MEDIUM confidence
    for line in mutect_content.lines() {
        if !line.starts_with('#') && !line.is_empty() {
            output_lines.push(tag_variant(line, "MEDIUM"));
        }
    }

    let content = output_lines.join("\n") + "\n";
    tokio::fs::write(output, content)
        .await
        .map_err(|e| PipelineError::Other(format!("write consensus VCF: {e}")))?;

    Ok(())
}

/// Add CALLER_CONFIDENCE tag to a VCF data line's INFO field.
fn tag_variant(line: &str, confidence: &str) -> String {
    let fields: Vec<&str> = line.split('\t').collect();
    if fields.len() < 8 {
        return line.to_string();
    }

    let mut new_fields: Vec<String> = fields.iter().map(|f| f.to_string()).collect();
    let info = &fields[7];
    if *info == "." {
        new_fields[7] = format!("CALLER_CONFIDENCE={confidence}");
    } else {
        new_fields[7] = format!("{info};CALLER_CONFIDENCE={confidence}");
    }

    new_fields.join("\t")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tag_variant_empty_info() {
        let line = "chr1\t100\t.\tA\tT\t.\tPASS\t.\tGT\t0/1";
        let tagged = tag_variant(line, "HIGH");
        assert!(tagged.contains("CALLER_CONFIDENCE=HIGH"));
        assert!(!tagged.contains(".;"));
    }

    #[test]
    fn tag_variant_existing_info() {
        let line = "chr1\t100\t.\tA\tT\t.\tPASS\tDP=30\tGT\t0/1";
        let tagged = tag_variant(line, "MEDIUM");
        assert!(tagged.contains("DP=30;CALLER_CONFIDENCE=MEDIUM"));
    }
}
