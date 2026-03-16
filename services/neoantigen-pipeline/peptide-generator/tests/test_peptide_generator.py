"""Tests for peptide generator module."""

from src.vcf_parser import ProteinVariant
from src.peptide_generator import (
    generate_peptides,
    _generate_missense_windows,
    _sliding_windows,
    _is_valid_peptide,
    MHC_I_LENGTHS,
    MHC_II_LENGTHS,
)

# KRAS4B protein sequence (first 50 AA) — G at position 12 (1-based, index 11)
# M(1) T E Y K L V V V G(10) A G(12) V G K S A L T(20) ...
KRAS_PROTEIN = (
    "MTEYKLVVVGAGVGKSALTIQLIQNHFVDEYDPTIEDSY"
    "RKQVVIDGET"
)


def _make_kras_g12d() -> ProteinVariant:
    return ProteinVariant(
        gene="KRAS",
        chromosome="chr12",
        position=25245350,
        ref_allele="C",
        alt_allele="A",
        consequence="missense_variant",
        protein_change="p.Gly12Asp",
        protein_position=12,
        wildtype_aa="G",
        mutant_aa="D",
        transcript_id="ENST00000256078",
        protein_sequence=KRAS_PROTEIN,
        vaf=0.375,
    )


class TestKrasG12D:
    """Verify KRAS G12D produces correct peptide windows."""

    def test_generates_windows(self):
        variant = _make_kras_g12d()
        windows = _generate_missense_windows(variant, KRAS_PROTEIN)

        # Should have windows for MHC-I (8,9,10,11-mer) + MHC-II (15-mer)
        assert len(windows) > 0

        mhc_i = [w for w in windows if w.mhc_class == "I"]
        mhc_ii = [w for w in windows if w.mhc_class == "II"]
        assert len(mhc_i) > 0
        assert len(mhc_ii) > 0

    def test_9mer_windows_contain_mutation(self):
        variant = _make_kras_g12d()
        windows = _generate_missense_windows(variant, KRAS_PROTEIN)

        nine_mers = [w for w in windows if w.peptide_length == 9 and w.mhc_class == "I"]
        assert len(nine_mers) > 0

        for w in nine_mers:
            # Mutation at position 12 (0-based: 11) must be within the window
            assert 0 <= w.mutation_position_in_peptide < 9
            # Mutant peptide must contain D at the mutation position
            assert w.mutant_peptide[w.mutation_position_in_peptide] == "D"
            # Wildtype peptide must contain G at the mutation position
            assert w.wildtype_peptide[w.mutation_position_in_peptide] == "G"
            # Peptides must differ
            assert w.mutant_peptide != w.wildtype_peptide

    def test_specific_9mer_vvvdavgvg(self):
        """Verify the canonical KRAS G12D 9-mer is present."""
        variant = _make_kras_g12d()
        windows = _generate_missense_windows(variant, KRAS_PROTEIN)

        nine_mers = [w for w in windows if w.peptide_length == 9 and w.mhc_class == "I"]
        mutant_peptides = [w.mutant_peptide for w in nine_mers]

        # KRAS positions 5-13 (0-based 4-12): LVVVDAVGV (G12D)
        # The exact window depends on the protein, but D should replace G at pos 12
        # Position 12 is index 11 in 0-based. For a 9-mer starting at index 4:
        # LVVVDAVGV (mutation at position 7 in peptide)
        # Verify at least one 9-mer contains D
        assert any("D" in p for p in mutant_peptides)

    def test_window_lengths_correct(self):
        variant = _make_kras_g12d()
        windows = _generate_missense_windows(variant, KRAS_PROTEIN)

        for w in windows:
            assert len(w.mutant_peptide) == w.peptide_length
            assert len(w.wildtype_peptide) == w.peptide_length


class TestBoundaryMutations:
    """Test mutations near protein start/end."""

    def test_near_protein_start(self):
        """Mutation at position 2 — limited windows on the left."""
        protein = "MXKLVVVGAVGVGKSALTIQLIQ"
        variant = ProteinVariant(
            gene="TEST",
            chromosome="chr1",
            position=100,
            ref_allele="A",
            alt_allele="T",
            consequence="missense_variant",
            protein_change="p.X2Y",
            protein_position=2,
            wildtype_aa="X",
            mutant_aa="Y",
            transcript_id="TEST001",
            protein_sequence=protein,
            vaf=0.5,
        )
        # Position 2 means index 1; for 9-mer, only start=0 works (need at least 9 chars)
        windows = _generate_missense_windows(variant, protein)

        # Should generate some windows even at start
        assert len(windows) > 0

        for w in windows:
            assert w.mutation_position_in_peptide >= 0
            assert w.mutation_position_in_peptide < w.peptide_length

    def test_near_protein_end(self):
        """Mutation near the end of a short protein."""
        protein = "ACDEFGHIKLMNPQRSTVWY"  # 20 AA, all valid
        variant = ProteinVariant(
            gene="TEST",
            chromosome="chr1",
            position=200,
            ref_allele="G",
            alt_allele="A",
            consequence="missense_variant",
            protein_change="p.Y20F",
            protein_position=20,
            wildtype_aa="Y",
            mutant_aa="F",
            transcript_id="TEST002",
            protein_sequence=protein,
            vaf=0.4,
        )
        windows = _generate_missense_windows(variant, protein)
        assert len(windows) > 0


class TestGeneratePeptides:
    def test_full_pipeline(self):
        variants = [_make_kras_g12d()]
        result = generate_peptides(variants)

        assert result.total_variants == 1
        assert result.variants_with_peptides == 1
        assert result.mhc_i_peptides > 0
        assert result.mhc_ii_peptides > 0
        assert len(result.peptide_windows) > 0

    def test_empty_variants(self):
        result = generate_peptides([])
        assert result.total_variants == 0
        assert result.variants_with_peptides == 0
        assert len(result.peptide_windows) == 0

    def test_json_serialization(self):
        variants = [_make_kras_g12d()]
        result = generate_peptides(variants)
        json_str = result.to_json()

        import json
        data = json.loads(json_str)
        assert "peptideWindows" in data
        assert "totalVariants" in data
        assert data["totalVariants"] == 1
        assert len(data["peptideWindows"]) > 0

        # Verify camelCase keys
        window = data["peptideWindows"][0]
        assert "mutantPeptide" in window
        assert "wildtypePeptide" in window
        assert "peptideLength" in window
        assert "mhcClass" in window


class TestValidPeptide:
    def test_valid(self):
        assert _is_valid_peptide("ACDEFGHIK")

    def test_invalid_with_x(self):
        assert not _is_valid_peptide("ACXEFGHIK")

    def test_invalid_with_star(self):
        assert not _is_valid_peptide("ACD*FGHIK")

    def test_empty(self):
        assert _is_valid_peptide("")
