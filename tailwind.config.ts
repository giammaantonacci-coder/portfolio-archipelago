import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          foreground: '#FFFFFF',
        },
        pink: { DEFAULT: 'var(--pink)', soft: 'var(--pink-soft)' },
        green: { DEFAULT: 'var(--green)', soft: 'var(--green-soft)' },
        yellow: { DEFAULT: 'var(--yellow)' },
        red: { DEFAULT: 'var(--red)' },
        'blue-soft': 'var(--blue-soft)',
        'purple-soft': 'var(--purple-soft)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(23, 24, 46, 0.06)',
        'soft-lg': '0 8px 30px rgba(23, 24, 46, 0.08)',
      },
      maxWidth: {
        app: '480px',
        content: '1120px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
