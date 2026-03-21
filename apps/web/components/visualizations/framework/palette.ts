// ============================================================================
// Biology Color Language — Kurzgesagt-inspired dark cinema palette
// All rgba constants for consistent visual identity across all 30 visualizations
// ============================================================================

export const PALETTE = {
  cancer: {
    fill: 'rgba(230,100,80,0.2)',
    edge: 'rgba(230,100,80,0.35)',
    glow: 'rgba(230,100,80,0.12)',
    label: 'rgba(230,100,80,0.6)',
    accent: 'rgba(255,130,100,0.5)',
    dead: 'rgba(230,100,80,0.08)',
  },
  immune: {
    fill: 'rgba(140,130,230,0.2)',
    edge: 'rgba(140,130,230,0.35)',
    glow: 'rgba(140,130,230,0.12)',
    label: 'rgba(140,130,230,0.6)',
    activated: {
      fill: 'rgba(140,130,230,0.35)',
      edge: 'rgba(160,150,255,0.5)',
      glow: 'rgba(140,130,230,0.25)',
    },
    exhausted: {
      fill: 'rgba(140,130,230,0.08)',
      edge: 'rgba(140,130,230,0.15)',
    },
  },
  healthy: {
    fill: 'rgba(80,200,140,0.15)',
    edge: 'rgba(80,200,140,0.3)',
    glow: 'rgba(80,200,140,0.08)',
  },
  drug: {
    fill: 'rgba(100,170,255,0.3)',
    edge: 'rgba(100,170,255,0.5)',
    glow: 'rgba(100,170,255,0.15)',
    label: 'rgba(200,230,255,0.9)',
  },
  payload: {
    fill: 'rgba(240,90,70,0.7)',
    glow: 'rgba(240,90,70,0.15)',
  },
  dna: {
    fill: 'rgba(100,180,255,0.4)',
    damaged: 'rgba(255,80,60,0.7)',
  },
  receptor: {
    fill: 'rgba(255,160,130,0.5)',
    label: 'rgba(255,200,180,0.8)',
    her2: 'rgba(255,160,80,0.6)',
    er: 'rgba(100,200,140,0.6)',
    pr: 'rgba(100,180,220,0.6)',
  },
  protein: {
    normal: 'rgba(130,210,160,0.5)',
    mutant: 'rgba(240,100,90,0.6)',
  },
  signal: {
    activation: 'rgba(255,200,80,0.5)',
    suppression: 'rgba(255,80,80,0.5)',
    attack: 'rgba(160,140,255,0.8)',
    death: 'rgba(255,60,40,0.5)',
  },
  particle: {
    fill: 'rgba(255,255,255,0.08)',
    opacityRange: [0.02, 0.15] as [number, number],
  },
  text: {
    primary: 'rgba(255,255,255,0.9)',
    secondary: 'rgba(255,255,255,0.6)',
    tertiary: 'rgba(255,255,255,0.35)',
    accent: 'rgba(110,180,255,0.8)',
  },
  bg: {
    deep: '#080B10',
    mid: '#0B0E14',
    soft: '#0E1118',
  },
  // Common derived colors for UI elements
  ui: {
    dotActive: 'rgba(255,255,255,0.9)',
    dotInactive: 'rgba(255,255,255,0.2)',
    buttonFill: 'rgba(255,255,255,0.08)',
    buttonHover: 'rgba(255,255,255,0.15)',
    sliderTrack: 'rgba(255,255,255,0.12)',
    sliderFill: 'rgba(110,180,255,0.5)',
    sliderThumb: 'rgba(255,255,255,0.9)',
    toggleOn: 'rgba(110,180,255,0.5)',
    toggleOff: 'rgba(255,255,255,0.15)',
  },
  lnp: {
    fill: 'rgba(200,170,100,0.3)',
    edge: 'rgba(200,170,100,0.5)',
  },
} as const;
