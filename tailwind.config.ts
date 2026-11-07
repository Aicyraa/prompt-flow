import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Each shade is a CSS variable, so the whole UI can switch theme.
        charcoal: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((n) => [
            n,
            `rgb(var(--charcoal-${n}) / <alpha-value>)`,
          ]),
        ),
      },
      keyframes: {
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.94) translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'pop-out': {
          from: { opacity: '1', transform: 'none' },
          to: { opacity: '0', transform: 'scale(0.96) translateY(4px)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'draw-in': {
          from: { strokeDashoffset: '1' },
          to: { strokeDashoffset: '0' },
        },
        'dash-flow': { to: { strokeDashoffset: '-24' } },
        'running-glow': {
          '0%, 100%': {
            boxShadow:
              '0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 0 0 rgb(251 191 36 / 0)',
          },
          '50%': {
            boxShadow:
              '0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 0 4px rgb(251 191 36 / 0.22)',
          },
        },
        'done-flash': {
          '0%': {
            boxShadow:
              '0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 0 0 rgb(52 211 153 / 0.55)',
          },
          '100%': {
            boxShadow:
              '0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 0 10px rgb(52 211 153 / 0)',
          },
        },
      },
      animation: {
        'pop-in': 'pop-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
        'fade-in': 'fade-in 180ms ease-out backwards',
        'fade-out': 'fade-out 140ms ease-in forwards',
        'pop-out': 'pop-out 140ms ease-in forwards',
        'fade-up': 'fade-up 260ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
        'slide-in-right':
          'slide-in-right 240ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
        'slide-up': 'slide-up 240ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
        'draw-in': 'draw-in 450ms ease-out backwards',
        'dash-flow': 'dash-flow 0.9s linear infinite',
        'running-glow': 'running-glow 1.6s ease-in-out infinite',
        'done-flash': 'done-flash 900ms ease-out',
      },
      fontFamily: {
        body: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config
