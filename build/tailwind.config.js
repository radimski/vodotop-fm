/* "Technický výkres": drafting paper, blueprint blue, the logo's red,
 * condensed Archivo for headlines and Plex Mono for dimension-style labels.
 * Client colours, not the REDEYE night palette (checklist I). */
module.exports = {
  content: ['./site/*.html', './build/main.js'],
  theme: {
    extend: {
      colors: {
        paper: '#ffffff',
        'paper-2': '#f4f2ee',
        sheet: '#ffffff',
        ink: '#14181e',
        muted: '#454a52',
        'muted-2': '#5b6068',
        line: '#e2ddd4',
        'line-2': '#a99f8a',
        red: '#c4121a',
        'red-dark': '#9c0d14',
        blue: '#1d4e8f',
        'blue-dark': '#163c6e',
        print: '#0f2a4f',
        'print-2': '#163763',
        'print-line': 'rgba(160,196,240,.22)',
        cyan: '#9cc7f2',
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        body: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        label: ['0.75rem', { lineHeight: '1.35', letterSpacing: '0.06em', fontWeight: '500' }],
        hero: ['clamp(2.4rem, 5.2vw, 4.25rem)', { lineHeight: '1.04', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-xl': ['clamp(1.9rem, 3.6vw, 2.9rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['clamp(1.6rem, 3vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-md': ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-sm': ['1.2rem', { lineHeight: '1.25', fontWeight: '700' }],
        lead: ['clamp(1.075rem, 1.5vw, 1.25rem)', { lineHeight: '1.55' }],
        base: ['1.0625rem', { lineHeight: '1.6' }],
        small: ['0.9375rem', { lineHeight: '1.5' }],
        tiny: ['0.8125rem', { lineHeight: '1.45' }],
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '8px',
        xl: '12px',
        pill: '100px',
      },
      maxWidth: { shell: '1360px', prose: '66ch' },
      spacing: { section: 'clamp(4rem, 9vw, 7.5rem)' },
      boxShadow: {
        lift: '0 1px 2px rgba(20,24,30,.06), 0 12px 32px -16px rgba(20,24,30,.25)',
        hard: '4px 4px 0 #14181e',
      },
    },
  },
};
