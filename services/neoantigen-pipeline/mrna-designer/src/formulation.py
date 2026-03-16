"""LNP formulation guidance notes.

Provides informational guidance on lipid nanoparticle formulation
for the mRNA vaccine construct. This is for research reference only
and does not constitute manufacturing instructions.
"""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def generate_formulation_notes(mrna_length: int) -> Dict[str, Any]:
    """Generate LNP formulation guidance notes.

    DISCLAIMER: These are informational research notes only.
    Actual formulation requires GMP manufacturing expertise,
    regulatory compliance, and extensive quality testing.
    """
    # Standard LNP composition (based on published literature)
    # Molar ratios from Moderna/BioNTech published formulations
    notes = {
        "disclaimer": (
            "RESEARCH REFERENCE ONLY. These formulation notes are provided for "
            "informational purposes based on published literature. Actual vaccine "
            "manufacturing requires GMP facilities, regulatory approval, and "
            "extensive quality control testing. This does not constitute "
            "manufacturing instructions or medical advice."
        ),
        "lnpComposition": {
            "ionizableLipid": {
                "name": "SM-102 or ALC-0315",
                "molarRatio": 50,
                "note": "Ionizable lipid for endosomal escape",
            },
            "helperLipid": {
                "name": "DSPC",
                "molarRatio": 10,
                "note": "Structural stability of bilayer",
            },
            "cholesterol": {
                "molarRatio": 38.5,
                "note": "Membrane rigidity and stability",
            },
            "pegLipid": {
                "name": "PEG2000-DMG or ALC-0159",
                "molarRatio": 1.5,
                "note": "Prevents aggregation, controls particle size",
            },
        },
        "targetParticleSize": {
            "diameter": "80-100 nm",
            "pdi": "< 0.2",
            "note": "Measured by dynamic light scattering (DLS)",
        },
        "nToP_ratio": {
            "value": "6:1",
            "note": "Nitrogen-to-phosphate ratio for optimal encapsulation",
        },
        "encapsulationEfficiency": {
            "target": "> 90%",
            "assay": "RiboGreen fluorescence assay",
        },
        "storageConditions": {
            "longTerm": "-20°C or -70°C",
            "shortTerm": "2-8°C for up to 30 days",
            "note": "Stability testing required for each formulation",
        },
        "mrnaConsiderations": {
            "length": mrna_length,
            "modification": "N1-methylpseudouridine (m1Ψ) recommended",
            "capStructure": "Cap1 (7mG(5')ppp(5')A(2'OMe)pG)",
            "note": "Modified nucleosides reduce innate immune activation",
        },
        "dosing": {
            "note": (
                "Dose determination requires preclinical studies. Published "
                "personalized cancer vaccine trials have used 15-100 μg mRNA "
                "per dose. Optimal dosing depends on the specific construct, "
                "formulation, and target patient population."
            ),
        },
    }

    logger.info("Generated formulation guidance notes for %d nt mRNA", mrna_length)
    return notes
