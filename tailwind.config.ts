import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        base: 'var(--bg-base)',
        elevated: 'var(--bg-elevated)',
        accent: 'var(--accent)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        glow: '0 0 24px color-mix(in srgb, var(--accent) 35%, transparent)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
