module.exports = {
  content: ['./site/*.html', './build/main.js'],
  theme: {
    extend: {
      colors: {
        ink: '#07090c',
        'ink-2': '#11151c',
        'ink-3': '#1a212c',
        frost: '#e8f4fa',
        muted: '#9aa8b4',
        'muted-2': '#6d7a86',
        line: 'rgba(232,244,250,.12)',
        accent: '#c4121a',
        'accent-hot': '#e31b23',
        ice: '#6ec4e0',
        'ice-deep': '#3a9cbc',
      },
      fontFamily: {
        display: ['Source Sans 3', 'system-ui', 'sans-serif'],
        body: ['Source Sans 3', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        eyebrow: ['0.8125rem', { lineHeight: '1.3', letterSpacing: '0.18em', fontWeight: '600' }],
        'display-xl': ['clamp(2.6rem, 8vw, 5.6rem)', { lineHeight: '0.92', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['clamp(1.7rem, 4vw, 2.75rem)', { lineHeight: '1.08', letterSpacing: '-0.015em', fontWeight: '600' }],
        'display-md': ['clamp(1.3rem, 2.2vw, 1.6rem)', { lineHeight: '1.25', fontWeight: '600' }],
        'display-sm': ['1.2rem', { lineHeight: '1.3', fontWeight: '600' }],
        lead: ['clamp(1.05rem, 1.5vw, 1.2rem)', { lineHeight: '1.65' }],
        base: ['1rem', { lineHeight: '1.7' }],
        small: ['0.875rem', { lineHeight: '1.6' }],
        tiny: ['0.8125rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.875rem',
        xl: '1.25rem',
        pill: '100px',
      },
      maxWidth: { shell: '1180px', prose: '68ch' },
      spacing: { section: 'clamp(3rem, 7vw, 5.5rem)' },
      boxShadow: {
        card: '0 1px 0 rgba(232,244,250,.06), 0 24px 48px -24px rgba(0,0,0,.6)',
        lift: '0 20px 50px -24px rgba(196,18,26,.45)',
      },
    },
  },
};
