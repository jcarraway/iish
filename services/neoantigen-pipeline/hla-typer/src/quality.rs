use pipeline_common::error::PipelineError;
use tracing::info;

use crate::consensus::HlaGenotype;

/// HLA allele nomenclature regex pattern: HLA-{gene}*{field1}:{field2}
const ALLELE_PATTERN: &str = r"^HLA-[A-Z0-9]+\*\d{2,3}:\d{2,3}$";

/// Validate the consensus HLA genotype passes quality gates.
pub fn check_quality_gates(genotype: &HlaGenotype) -> Result<(), PipelineError> {
    let re = regex_lite::Regex::new(ALLELE_PATTERN).unwrap();

    // Collect all alleles
    let all_alleles = [
        &genotype.class_i.hla_a[0],
        &genotype.class_i.hla_a[1],
        &genotype.class_i.hla_b[0],
        &genotype.class_i.hla_b[1],
        &genotype.class_i.hla_c[0],
        &genotype.class_i.hla_c[1],
        &genotype.class_ii.hla_drb1[0],
        &genotype.class_ii.hla_drb1[1],
        &genotype.class_ii.hla_dqb1[0],
        &genotype.class_ii.hla_dqb1[1],
        &genotype.class_ii.hla_dpb1[0],
        &genotype.class_ii.hla_dpb1[1],
    ];

    // Check allele nomenclature
    for allele in &all_alleles {
        if !re.is_match(allele) {
            return Err(PipelineError::QualityGateFailed(format!(
                "Invalid HLA allele nomenclature: {allele}"
            )));
        }
    }

    // Class I must have all 6 alleles (2 per gene x 3 genes)
    let class_i_count = [
        &genotype.class_i.hla_a[..],
        &genotype.class_i.hla_b[..],
        &genotype.class_i.hla_c[..],
    ]
    .iter()
    .flat_map(|a| a.iter())
    .filter(|a| re.is_match(a))
    .count();

    if class_i_count < 6 {
        return Err(PipelineError::QualityGateFailed(format!(
            "Only {class_i_count}/6 Class I alleles typed"
        )));
    }

    // Warn but don't fail if there are too many discrepancies
    if genotype.discrepancies.len() > 3 {
        return Err(PipelineError::QualityGateFailed(format!(
            "Too many Class I discrepancies ({}) between OptiType and HLA-HD",
            genotype.discrepancies.len()
        )));
    }

    info!(
        class_i = class_i_count,
        discrepancies = genotype.discrepancies.len(),
        "HLA quality gates passed"
    );

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::consensus::{ClassIGenotype, ClassIIGenotype, HlaGenotype};

    fn valid_genotype() -> HlaGenotype {
        HlaGenotype {
            class_i: ClassIGenotype {
                hla_a: ["HLA-A*02:01".into(), "HLA-A*24:02".into()],
                hla_b: ["HLA-B*07:02".into(), "HLA-B*44:02".into()],
                hla_c: ["HLA-C*07:02".into(), "HLA-C*05:01".into()],
            },
            class_ii: ClassIIGenotype {
                hla_drb1: ["HLA-DRB1*04:01".into(), "HLA-DRB1*15:01".into()],
                hla_dqb1: ["HLA-DQB1*03:02".into(), "HLA-DQB1*06:02".into()],
                hla_dpb1: ["HLA-DPB1*04:01".into(), "HLA-DPB1*02:01".into()],
            },
            discrepancies: vec![],
        }
    }

    #[test]
    fn valid_genotype_passes() {
        assert!(check_quality_gates(&valid_genotype()).is_ok());
    }

    #[test]
    fn invalid_allele_fails() {
        let mut genotype = valid_genotype();
        genotype.class_i.hla_a[0] = "INVALID".to_string();
        assert!(check_quality_gates(&genotype).is_err());
    }

    #[test]
    fn too_many_discrepancies_fails() {
        let mut genotype = valid_genotype();
        genotype.discrepancies = vec![
            "d1".into(),
            "d2".into(),
            "d3".into(),
            "d4".into(),
        ];
        assert!(check_quality_gates(&genotype).is_err());
    }
}
