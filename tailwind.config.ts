import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          50: '#EDE7DE',
          100: '#DED8CF',
          200: '#C5BDB0',
          300: '#A89D87',
          400: '#8C806B',
          500: '#726657',
          600: '#443B30',
          700: '#2E2822',
          800: '#211D18',
          900: '#161310',
          950: '#0F0C0A',
        },
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
