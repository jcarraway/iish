use std::path::Path;
use tracing::info;

use pipeline_common::error::PipelineError;
use pipeline_common::process::run_command;

use crate::quality::AlignmentStats;

/// Run samtools markdup, index, and flagstat on a sorted BAM.
pub async fn postprocess_bam(
    input_bam: &Path,
    output_bam: &Path,
    sample_name: &str,
) -> Result<AlignmentStats, PipelineError> {
    let input_str = input_bam.to_str().unwrap();
    let output_str = output_bam.to_str().unwrap();

    // markdup
    info!(sample = sample_name, "running samtools markdup");
    run_command("samtools", &["markdup", input_str, output_str]).await?;

    // index
    info!(sample = sample_name, "running samtools index");
    run_command("samtools", &["index", output_str]).await?;

    // flagstat
    info!(sample = sample_name, "running samtools flagstat");
    let flagstat_output = run_command("samtools", &["flagstat", output_str]).await?;

    let stats = parse_flagstat(&flagstat_output.stdout, sample_name)?;
    info!(sample = sample_name, ?stats, "flagstat parsed");

    Ok(stats)
}

/// Parse samtools flagstat output into AlignmentStats.
pub fn parse_flagstat(output: &str, sample_name: &str) -> Result<AlignmentStats, PipelineError> {
    let mut total_reads: u64 = 0;
    let mut mapped_reads: u64 = 0;
    let mut duplicates: u64 = 0;
    let mut paired_reads: u64 = 0;
    let mut properly_paired: u64 = 0;

    for line in output.lines() {
        let line = line.trim();
        if line.contains("in total") {
            total_reads = parse_first_number(line)?;
        } else if line.contains("mapped (") && !line.contains("mate") {
            mapped_reads = parse_first_number(line)?;
        } else if line.contains("duplicates") {
            duplicates = parse_first_number(line)?;
        } else if line.contains("paired in sequencing") {
            paired_reads = parse_first_number(line)?;
        } else if line.contains("properly paired") {
            properly_paired = parse_first_number(line)?;
        }
    }

    if total_reads == 0 {
        return Err(PipelineError::ParseError(format!(
            "flagstat for {sample_name}: no total reads found"
        )));
    }

    let mapping_rate = mapped_reads as f64 / total_reads as f64 * 100.0;
    let duplicate_rate = if mapped_reads > 0 {
        duplicates as f64 / mapped_reads as f64 * 100.0
    } else {
        0.0
    };
    let proper_pair_rate = if paired_reads > 0 {
        properly_paired as f64 / paired_reads as f64 * 100.0
    } else {
        0.0
    };

    Ok(AlignmentStats {
        sample_name: sample_name.to_string(),
        total_reads,
        mapped_reads,
        mapping_rate,
        duplicates,
        duplicate_rate,
        properly_paired,
        proper_pair_rate,
    })
}

fn parse_first_number(line: &str) -> Result<u64, PipelineError> {
    line.split_whitespace()
        .next()
        .and_then(|s| s.parse().ok())
        .ok_or_else(|| PipelineError::ParseError(format!("cannot parse number from: {line}")))
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_FLAGSTAT: &str = r#"10000000 + 0 in total (QC-passed reads + QC-failed reads)
0 + 0 secondary
0 + 0 supplementary
500000 + 0 duplicates
9500000 + 0 mapped (95.00% : N/A)
10000000 + 0 paired in sequencing
5000000 + 0 read1
5000000 + 0 read2
9200000 + 0 properly paired (92.00% : N/A)
9400000 + 0 with itself and mate mapped
100000 + 0 singletons (1.00% : N/A)
"#;

    #[test]
    fn parse_flagstat_output() {
        let stats = parse_flagstat(SAMPLE_FLAGSTAT, "tumor").unwrap();
        assert_eq!(stats.total_reads, 10_000_000);
        assert_eq!(stats.mapped_reads, 9_500_000);
        assert_eq!(stats.duplicates, 500_000);
        assert!((stats.mapping_rate - 95.0).abs() < 0.01);
        assert!((stats.duplicate_rate - 5.26).abs() < 0.1);
        assert_eq!(stats.properly_paired, 9_200_000);
    }

    #[test]
    fn parse_flagstat_zero_reads() {
        let output = "0 + 0 in total (QC-passed reads + QC-failed reads)\n";
        let result = parse_flagstat(output, "empty");
        assert!(result.is_err());
    }
}
