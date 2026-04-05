/** @type {import('tailwindcss').Config} */
export default {
  // ISSUE: #134 (Support dark mode themes in CustomerList)
  // Enabled class-based dark mode to work with ThemeContext.jsx
  darkMode: 'class',

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand (preserved — Tradazone indigo-violet) ──
        brand: {
          DEFAULT: '#3C3CEF',
          dark: '#2E2ED4',
          light: '#5A5AF5',
          bg: '#EDEDFD',
          hover: '#4F4FF2',
        },
        accent: {
          orange: '#F5A623',
          blue: '#3C3CEF',
        },
        // ── Surfaces (Coinbase-inspired neutral palette) ──
        page: '#F7F8FA',
        sidebar: '#FFFFFF',
        'coin-gray': '#EEF0F3',
        // ── Text (Coinbase near-black scale) ──
        't-primary': '#0A0B0D',
        't-secondary': '#5B616E',
        't-muted': '#8A9099',
        't-light': '#C4C7CD',
        // ── Borders (Coinbase tinted border) ──
        border: {
          DEFAULT: '#D0D3D9',
          medium: '#B8BCC4',
          light: '#E8EAED',
        },
        // ── Semantic ──
        success: { DEFAULT: '#10B981', bg: '#D1FAE5' },
        warning: { DEFAULT: '#F59E0B', bg: '#FEF3C7' },
        error: { DEFAULT: '#EF4444', bg: '#FEE2E2' },
        info: { DEFAULT: '#3B82F6', bg: '#DBEAFE' },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        'sidebar': '260px',
        'header': '64px',
      },
      // ── Coinbase-inspired border radius scale ──
      borderRadius: {
        'none': '0px',
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '28px',
        'card': '12px',
        'full': '9999px',
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.05)',
        'brand': '0 4px 14px rgba(60,60,239,0.25)',
        'brand-lg': '0 8px 24px rgba(60,60,239,0.30)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
        'spin-ring': 'spin 0.8s linear infinite',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}