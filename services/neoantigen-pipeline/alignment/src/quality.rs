use serde::{Deserialize, Serialize};

use pipeline_common::error::PipelineError;

/// Alignment statistics parsed from samtools flagstat.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AlignmentStats {
    pub sample_name: String,
    pub total_reads: u64,
    pub mapped_reads: u64,
    pub mapping_rate: f64,
    pub duplicates: u64,
    pub duplicate_rate: f64,
    pub properly_paired: u64,
    pub proper_pair_rate: f64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum QualityStatus {
    Pass,
    Warn,
    Fail,
}

/// Quality gate result with details.
#[derive(Debug)]
#[allow(dead_code)]
pub struct QualityGateResult {
    pub status: QualityStatus,
    pub warnings: Vec<String>,
    pub failures: Vec<String>,
}

/// Evaluate alignment quality gates.
///
/// FAIL: mapping rate < 80%
/// FAIL: coverage < 5x (estimated from reads)
/// WARN: coverage < 15x
/// WARN: duplicate rate > 50%
pub fn evaluate_quality(stats: &AlignmentStats) -> QualityGateResult {
    let mut warnings = Vec::new();
    let mut failures = Vec::new();

    // Mapping rate gate
    if stats.mapping_rate < 80.0 {
        failures.push(format!(
            "{}: mapping rate {:.1}% < 80% threshold",
            stats.sample_name, stats.mapping_rate
        ));
    }

    // Estimated coverage (rough: mapped_reads * 150bp / 3Gb genome)
    let estimated_coverage = (stats.mapped_reads as f64 * 150.0) / 3_000_000_000.0;
    if estimated_coverage < 5.0 {
        failures.push(format!(
            "{}: estimated coverage {:.1}x < 5x minimum",
            stats.sample_name, estimated_coverage
        ));
    } else if estimated_coverage < 15.0 {
        warnings.push(format!(
            "{}: estimated coverage {:.1}x < 15x recommended",
            stats.sample_name, estimated_coverage
        ));
    }

    // Duplicate rate gate
    if stats.duplicate_rate > 50.0 {
        warnings.push(format!(
            "{}: duplicate rate {:.1}% > 50% threshold",
            stats.sample_name, stats.duplicate_rate
        ));
    }

    let status = if !failures.is_empty() {
        QualityStatus::Fail
    } else if !warnings.is_empty() {
        QualityStatus::Warn
    } else {
        QualityStatus::Pass
    };

    QualityGateResult {
        status,
        warnings,
        failures,
    }
}

/// Check quality gates for both tumor and normal, failing the step if either fails.
pub fn check_quality_gates(
    tumor_stats: &AlignmentStats,
    normal_stats: &AlignmentStats,
) -> Result<(), PipelineError> {
    let tumor_qc = evaluate_quality(tumor_stats);
    let normal_qc = evaluate_quality(normal_stats);

    for w in &tumor_qc.warnings {
        tracing::warn!("{}", w);
    }
    for w in &normal_qc.warnings {
        tracing::warn!("{}", w);
    }

    let mut all_failures = Vec::new();
    all_failures.extend(tumor_qc.failures);
    all_failures.extend(normal_qc.failures);

    if !all_failures.is_empty() {
        return Err(PipelineError::QualityGateFailed(all_failures.join("; ")));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_stats(
        sample: &str,
        total: u64,
        mapped: u64,
        dups: u64,
    ) -> AlignmentStats {
        let mapping_rate = if total > 0 {
            mapped as f64 / total as f64 * 100.0
        } else {
            0.0
        };
        let dup_rate = if mapped > 0 {
            dups as f64 / mapped as f64 * 100.0
        } else {
            0.0
        };

        AlignmentStats {
            sample_name: sample.to_string(),
            total_reads: total,
            mapped_reads: mapped,
            mapping_rate,
            duplicates: dups,
            duplicate_rate: dup_rate,
            properly_paired: mapped,
            proper_pair_rate: 95.0,
        }
    }

    #[test]
    fn pass_quality() {
        // 400M reads, 390M mapped, 10M dups -> 390M*150/3B = 19.5x coverage
        let stats = make_stats("tumor", 400_000_000, 390_000_000, 10_000_000);
        let result = evaluate_quality(&stats);
        assert_eq!(result.status, QualityStatus::Pass);
    }

    #[test]
    fn fail_low_mapping_rate() {
        let stats = make_stats("tumor", 100_000_000, 50_000_000, 1_000_000);
        let result = evaluate_quality(&stats);
        assert_eq!(result.status, QualityStatus::Fail);
        assert!(result.failures.iter().any(|f| f.contains("mapping rate")));
    }

    #[test]
    fn fail_low_coverage() {
        // 10M reads * 150 / 3B = 0.5x
        let stats = make_stats("normal", 10_000_000, 9_000_000, 100_000);
        let result = evaluate_quality(&stats);
        assert_eq!(result.status, QualityStatus::Fail);
        assert!(result.failures.iter().any(|f| f.contains("coverage")));
    }

    #[test]
    fn warn_high_duplicates() {
        let stats = make_stats("tumor", 300_000_000, 280_000_000, 150_000_000);
        let result = evaluate_quality(&stats);
        assert_eq!(result.status, QualityStatus::Warn);
        assert!(result.warnings.iter().any(|w| w.contains("duplicate rate")));
    }

    #[test]
    fn warn_moderate_coverage() {
        // 80M reads * 150 / 3B = 4x -> FAIL. Need > 5x, < 15x.
        // 150M * 150 / 3B = 7.5x -> WARN
        let stats = make_stats("tumor", 160_000_000, 150_000_000, 1_000_000);
        let result = evaluate_quality(&stats);
        assert_eq!(result.status, QualityStatus::Warn);
        assert!(result.warnings.iter().any(|w| w.contains("coverage")));
    }

    #[test]
    fn quality_gate_check_passes() {
        let tumor = make_stats("tumor", 300_000_000, 290_000_000, 10_000_000);
        let normal = make_stats("normal", 300_000_000, 285_000_000, 10_000_000);
        assert!(check_quality_gates(&tumor, &normal).is_ok());
    }

    #[test]
    fn quality_gate_check_fails() {
        let tumor = make_stats("tumor", 300_000_000, 290_000_000, 10_000_000);
        let normal = make_stats("normal", 100_000_000, 50_000_000, 1_000_000);
        assert!(check_quality_gates(&tumor, &normal).is_err());
    }
}
