use serde::{Deserialize, Serialize};
use tracing::{info, warn};

use crate::hlahd::HlaHdResult;
use crate::optitype::OptiTypeResult;

/// Consensus HLA genotype combining OptiType and HLA-HD results.
/// Class I: prefer OptiType (higher accuracy for Class I from DNA).
/// Class II: HLA-HD only (OptiType does not type Class II).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HlaGenotype {
    pub class_i: ClassIGenotype,
    pub class_ii: ClassIIGenotype,
    pub discrepancies: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassIGenotype {
    pub hla_a: [String; 2],
    pub hla_b: [String; 2],
    pub hla_c: [String; 2],
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassIIGenotype {
    pub hla_drb1: [String; 2],
    pub hla_dqb1: [String; 2],
    pub hla_dpb1: [String; 2],
}

/// Build a consensus genotype from OptiType (Class I primary) and HLA-HD (Class II primary).
pub fn build_consensus(optitype: &OptiTypeResult, hlahd: &HlaHdResult) -> HlaGenotype {
    let mut discrepancies = Vec::new();

    // Compare Class I calls between OptiType and HLA-HD
    check_discrepancy("HLA-A", &optitype.hla_a, &hlahd.hla_a, &mut discrepancies);
    check_discrepancy("HLA-B", &optitype.hla_b, &hlahd.hla_b, &mut discrepancies);
    check_discrepancy("HLA-C", &optitype.hla_c, &hlahd.hla_c, &mut discrepancies);

    if discrepancies.is_empty() {
        info!("Class I calls concordant between OptiType and HLA-HD");
    } else {
        warn!(
            discrepancies = ?discrepancies,
            "Class I discrepancies detected — using OptiType as primary"
        );
    }

    HlaGenotype {
        class_i: ClassIGenotype {
            hla_a: optitype.hla_a.clone(),
            hla_b: optitype.hla_b.clone(),
            hla_c: optitype.hla_c.clone(),
        },
        class_ii: ClassIIGenotype {
            hla_drb1: hlahd.hla_drb1.clone(),
            hla_dqb1: hlahd.hla_dqb1.clone(),
            hla_dpb1: hlahd.hla_dpb1.clone(),
        },
        discrepancies,
    }
}

fn check_discrepancy(
    gene: &str,
    optitype_alleles: &[String; 2],
    hlahd_alleles: &[String; 2],
    discrepancies: &mut Vec<String>,
) {
    // Sort alleles for comparison (allele order doesn't matter)
    let mut ot = optitype_alleles.clone();
    ot.sort();
    let mut hd = hlahd_alleles.clone();
    hd.sort();

    if ot != hd {
        discrepancies.push(format!(
            "{gene}: OptiType=[{}, {}] vs HLA-HD=[{}, {}]",
            optitype_alleles[0], optitype_alleles[1], hlahd_alleles[0], hlahd_alleles[1]
        ));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn concordant_results() {
        let optitype = OptiTypeResult {
            hla_a: ["HLA-A*02:01".into(), "HLA-A*24:02".into()],
            hla_b: ["HLA-B*07:02".into(), "HLA-B*44:02".into()],
            hla_c: ["HLA-C*07:02".into(), "HLA-C*05:01".into()],
            objective: 0.99,
        };

        let hlahd = HlaHdResult {
            hla_a: ["HLA-A*02:01".into(), "HLA-A*24:02".into()],
            hla_b: ["HLA-B*07:02".into(), "HLA-B*44:02".into()],
            hla_c: ["HLA-C*07:02".into(), "HLA-C*05:01".into()],
            hla_drb1: ["HLA-DRB1*04:01".into(), "HLA-DRB1*15:01".into()],
            hla_dqb1: ["HLA-DQB1*03:02".into(), "HLA-DQB1*06:02".into()],
            hla_dpb1: ["HLA-DPB1*04:01".into(), "HLA-DPB1*02:01".into()],
        };

        let genotype = build_consensus(&optitype, &hlahd);
        assert!(genotype.discrepancies.is_empty());
        assert_eq!(genotype.class_i.hla_a, ["HLA-A*02:01", "HLA-A*24:02"]);
        assert_eq!(genotype.class_ii.hla_drb1, ["HLA-DRB1*04:01", "HLA-DRB1*15:01"]);
    }

    #[test]
    fn discordant_class_i() {
        let optitype = OptiTypeResult {
            hla_a: ["HLA-A*02:01".into(), "HLA-A*24:02".into()],
            hla_b: ["HLA-B*07:02".into(), "HLA-B*44:02".into()],
            hla_c: ["HLA-C*07:02".into(), "HLA-C*05:01".into()],
            objective: 0.99,
        };

        let hlahd = HlaHdResult {
            hla_a: ["HLA-A*02:01".into(), "HLA-A*03:01".into()], // Different!
            hla_b: ["HLA-B*07:02".into(), "HLA-B*44:02".into()],
            hla_c: ["HLA-C*07:02".into(), "HLA-C*05:01".into()],
            hla_drb1: ["HLA-DRB1*04:01".into(), "HLA-DRB1*15:01".into()],
            hla_dqb1: ["HLA-DQB1*03:02".into(), "HLA-DQB1*06:02".into()],
            hla_dpb1: ["HLA-DPB1*04:01".into(), "HLA-DPB1*02:01".into()],
        };

        let genotype = build_consensus(&optitype, &hlahd);
        assert_eq!(genotype.discrepancies.len(), 1);
        assert!(genotype.discrepancies[0].contains("HLA-A"));
        // OptiType is preferred for Class I
        assert_eq!(genotype.class_i.hla_a, ["HLA-A*02:01", "HLA-A*24:02"]);
    }
}
