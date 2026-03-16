use serde::{Deserialize, Serialize};
use tracing::info;

use pipeline_common::error::PipelineError;

/// Variant calling statistics parsed from annotated VCF.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VariantCallingStats {
    pub total_variants: u64,
    pub snvs: u64,
    pub indels: u64,
    pub coding_variants: u64,
    pub nonsynonymous: u64,
    pub frameshift: u64,
    pub high_confidence: u64,
    pub medium_confidence: u64,
    pub tmb: f64,
    pub tmb_classification: String,
    pub ti_tv_ratio: f64,
    pub caller_agreement_rate: f64,
}

// Coding region size in Mb for TMB calculation (standard exome ~33 Mb)
const CODING_REGION_MB: f64 = 33.0;

/// Parse an annotated VCF to extract variant calling statistics.
pub fn parse_vcf_stats(vcf_content: &str) -> Result<VariantCallingStats, PipelineError> {
    let mut total_variants: u64 = 0;
    let mut snvs: u64 = 0;
    let mut indels: u64 = 0;
    let mut coding_variants: u64 = 0;
    let mut nonsynonymous: u64 = 0;
    let mut frameshift: u64 = 0;
    let mut high_confidence: u64 = 0;
    let mut medium_confidence: u64 = 0;
    let mut transitions: u64 = 0;
    let mut transversions: u64 = 0;

    for line in vcf_content.lines() {
        if line.starts_with('#') || line.is_empty() {
            continue;
        }

        total_variants += 1;

        let fields: Vec<&str> = line.split('\t').collect();
        if fields.len() < 8 {
            continue;
        }

        let ref_allele = fields[3];
        let alt_allele = fields[4];
        let info = fields[7];

        // SNV vs indel
        if ref_allele.len() == 1 && alt_allele.len() == 1 {
            snvs += 1;
            // Ti/Tv classification
            if is_transition(ref_allele, alt_allele) {
                transitions += 1;
            } else {
                transversions += 1;
            }
        } else {
            indels += 1;
        }

        // Confidence from consensus step
        if info.contains("CALLER_CONFIDENCE=HIGH") {
            high_confidence += 1;
        } else if info.contains("CALLER_CONFIDENCE=MEDIUM") {
            medium_confidence += 1;
        }

        // VEP CSQ annotation parsing
        if let Some(csq) = extract_csq(info) {
            if is_coding(&csq) {
                coding_variants += 1;
            }
            if is_nonsynonymous(&csq) {
                nonsynonymous += 1;
            }
            if csq.contains("frameshift_variant") {
                frameshift += 1;
            }
        }
    }

    let tmb = nonsynonymous as f64 / CODING_REGION_MB;
    let tmb_classification = classify_tmb(tmb);

    let ti_tv_ratio = if transversions > 0 {
        transitions as f64 / transversions as f64
    } else {
        0.0
    };

    let caller_agreement_rate = if total_variants > 0 {
        high_confidence as f64 / total_variants as f64 * 100.0
    } else {
        0.0
    };

    let stats = VariantCallingStats {
        total_variants,
        snvs,
        indels,
        coding_variants,
        nonsynonymous,
        frameshift,
        high_confidence,
        medium_confidence,
        tmb,
        tmb_classification,
        ti_tv_ratio,
        caller_agreement_rate,
    };

    info!(?stats, "variant calling stats computed");
    Ok(stats)
}

/// TMB classification: low (<5), medium (5-20), high (>20).
pub fn classify_tmb(tmb: f64) -> String {
    if tmb > 20.0 {
        "high".to_string()
    } else if tmb >= 5.0 {
        "medium".to_string()
    } else {
        "low".to_string()
    }
}

/// Check if a substitution is a transition (purine<->purine or pyrimidine<->pyrimidine).
fn is_transition(ref_base: &str, alt_base: &str) -> bool {
    matches!(
        (ref_base, alt_base),
        ("A", "G") | ("G", "A") | ("C", "T") | ("T", "C")
    )
}

/// Extract CSQ (consequence) field from VEP INFO annotation.
fn extract_csq(info: &str) -> Option<String> {
    // VEP annotates as CSQ= in INFO field
    for field in info.split(';') {
        if let Some(csq) = field.strip_prefix("CSQ=") {
            return Some(csq.to_string());
        }
    }
    None
}

/// Check if a VEP consequence is in a coding region.
fn is_coding(csq: &str) -> bool {
    let coding_terms = [
        "missense_variant",
        "synonymous_variant",
        "frameshift_variant",
        "inframe_insertion",
        "inframe_deletion",
        "stop_gained",
        "stop_lost",
        "start_lost",
        "coding_sequence_variant",
    ];
    coding_terms.iter().any(|term| csq.contains(term))
}

/// Check if a VEP consequence is nonsynonymous.
fn is_nonsynonymous(csq: &str) -> bool {
    let nonsyn_terms = [
        "missense_variant",
        "frameshift_variant",
        "inframe_insertion",
        "inframe_deletion",
        "stop_gained",
        "stop_lost",
        "start_lost",
    ];
    nonsyn_terms.iter().any(|term| csq.contains(term))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classify_tmb_levels() {
        assert_eq!(classify_tmb(2.0), "low");
        assert_eq!(classify_tmb(4.9), "low");
        assert_eq!(classify_tmb(5.0), "medium");
        assert_eq!(classify_tmb(10.0), "medium");
        assert_eq!(classify_tmb(20.0), "medium");
        assert_eq!(classify_tmb(20.1), "high");
        assert_eq!(classify_tmb(50.0), "high");
    }

    #[test]
    fn transition_detection() {
        assert!(is_transition("A", "G"));
        assert!(is_transition("G", "A"));
        assert!(is_transition("C", "T"));
        assert!(is_transition("T", "C"));
        assert!(!is_transition("A", "C"));
        assert!(!is_transition("A", "T"));
        assert!(!is_transition("G", "C"));
    }

    #[test]
    fn parse_vcf_stats_basic() {
        let vcf = r#"##fileformat=VCFv4.2
##INFO=<ID=CALLER_CONFIDENCE,Number=1,Type=String>
##INFO=<ID=CSQ,Number=.,Type=String>
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO
chr1	100	.	A	G	.	PASS	CALLER_CONFIDENCE=HIGH;CSQ=missense_variant
chr1	200	.	C	T	.	PASS	CALLER_CONFIDENCE=HIGH;CSQ=synonymous_variant
chr1	300	.	AT	A	.	PASS	CALLER_CONFIDENCE=MEDIUM;CSQ=frameshift_variant
chr2	400	.	G	C	.	PASS	CALLER_CONFIDENCE=MEDIUM;CSQ=intergenic_variant
chr2	500	.	A	T	.	PASS	CALLER_CONFIDENCE=HIGH;CSQ=stop_gained
"#;
        let stats = parse_vcf_stats(vcf).unwrap();
        assert_eq!(stats.total_variants, 5);
        assert_eq!(stats.snvs, 4);
        assert_eq!(stats.indels, 1);
        assert_eq!(stats.coding_variants, 4); // missense, synonymous, frameshift, stop_gained
        assert_eq!(stats.nonsynonymous, 3); // missense, frameshift, stop_gained
        assert_eq!(stats.frameshift, 1);
        assert_eq!(stats.high_confidence, 3);
        assert_eq!(stats.medium_confidence, 2);
        assert!((stats.caller_agreement_rate - 60.0).abs() < 0.1);
    }

    #[test]
    fn parse_vcf_stats_empty() {
        let vcf = "##fileformat=VCFv4.2\n#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n";
        let stats = parse_vcf_stats(vcf).unwrap();
        assert_eq!(stats.total_variants, 0);
        assert_eq!(stats.tmb, 0.0);
        assert_eq!(stats.tmb_classification, "low");
    }

    #[test]
    fn tmb_calculation() {
        // 660 nonsynonymous / 33 Mb = 20 mutations/Mb -> medium
        let vcf_lines: Vec<String> = (0..660)
            .map(|i| {
                format!(
                    "chr1\t{}\t.\tA\tG\t.\tPASS\tCALLER_CONFIDENCE=HIGH;CSQ=missense_variant",
                    100 + i
                )
            })
            .collect();

        let vcf = format!(
            "##fileformat=VCFv4.2\n#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n{}\n",
            vcf_lines.join("\n")
        );

        let stats = parse_vcf_stats(&vcf).unwrap();
        assert!((stats.tmb - 20.0).abs() < 0.1);
        assert_eq!(stats.tmb_classification, "medium");
    }
}
