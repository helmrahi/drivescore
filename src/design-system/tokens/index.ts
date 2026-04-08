// ============================================
// DESIGN TOKENS — DriveScore by Wafa Assurance
// Source unique de vérité pour tout le design
// Inspiré : Revolut, Alan, Luko, AXA Digital
// ============================================

export const tokens = {

  // ─── COULEURS ───────────────────────────────
  color: {
    // Brand primaire — Vert Wafa
    // Choix : vert = confiance, sécurité, nature (PAYD = éco-responsable)
    // Référence : AXA (bleu), Luko (violet) → Wafa se différencie par le vert
    primary: {
      50:  '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4CAF50',
      500: '#2E7D32', // principale
      600: '#1B5E20', // dark
      700: '#14532D',
      800: '#0F3D21',
      900: '#052E16',
    },

    // Brand secondaire — Or Wafa
    // Choix : or = premium, valeur, récompense (badges, CTA)
    gold: {
      50:  '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F5A623', // principale
      600: '#D4891A', // dark
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },

    // Neutres — gris élégants (pas froids, légèrement chauds)
    // Choix : gris chauds = plus humains que gris purs (tendance fintech 2024-2025)
    neutral: {
      0:   '#FFFFFF',
      50:  '#FAFAF9',
      100: '#F5F5F4',
      200: '#E7E5E4',
      300: '#D6D3D1',
      400: '#A8A29E',
      500: '#78716C',
      600: '#57534E',
      700: '#44403C',
      800: '#292524',
      900: '#1C1917',
      950: '#0C0A09',
    },

    // Sémantiques — feedback utilisateur
    success: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D', solid: '#16A34A' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', solid: '#D97706' },
    danger:  { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', solid: '#EF4444' },
    info:    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', solid: '#3B82F6' },

    // Score conducteur — dégradé vert→orange→rouge
    score: {
      excellent: '#16A34A', // 90-100
      good:      '#2E7D32', // 80-89
      average:   '#D97706', // 70-79
      poor:      '#EA580C', // 60-69
      danger:    '#DC2626', // 0-59
    },
  },

  // ─── TYPOGRAPHIE ────────────────────────────
  // Choix : Inter = standard fintech mondial (Stripe, Revolut, N26)
  // Fallback system-ui pour performance mobile
  font: {
    family: {
      sans: '"Inter", system-ui, -apple-system, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    size: {
      xs:   '11px',
      sm:   '13px',
      base: '15px',
      md:   '16px',
      lg:   '18px',
      xl:   '20px',
      '2xl':'24px',
      '3xl':'30px',
      '4xl':'36px',
      '5xl':'48px',
    },
    weight: {
      regular: 400,
      medium:  500,
      semibold:600,
      bold:    700,
      black:   900,
    },
    lineHeight: {
      tight:  1.2,
      normal: 1.5,
      relaxed:1.7,
    },
  },

  // ─── SPACING — Grille 8px ───────────────────
  // Standard universel : multiples de 8px
  // Permet cohérence absolue entre composants
  space: {
    1:  '4px',
    2:  '8px',
    3:  '12px',
    4:  '16px',
    5:  '20px',
    6:  '24px',
    8:  '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
  },

  // ─── BORDER RADIUS ──────────────────────────
  radius: {
    sm:   '6px',
    md:   '8px',
    lg:   '12px',
    xl:   '16px',
    '2xl':'20px',
    '3xl':'24px',
    full: '9999px',
  },

  // ─── SHADOWS — Élévation ────────────────────
  // Choix : shadows subtiles = moderne (flat design évolué)
  // 3 niveaux : card, dropdown, modal
  shadow: {
    sm:  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    md:  '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
    lg:  '0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04)',
    xl:  '0 16px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)',
  },

  // ─── TRANSITIONS ────────────────────────────
  transition: {
    fast:   '120ms ease',
    normal: '200ms ease',
    slow:   '300ms ease',
    spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // ─── BREAKPOINTS ────────────────────────────
  breakpoint: {
    sm:  '480px',
    md:  '768px',
    lg:  '1024px',
    xl:  '1280px',
  },

} as const

// Types dérivés automatiquement
export type ColorToken = typeof tokens.color
export type SpaceToken = typeof tokens.space
