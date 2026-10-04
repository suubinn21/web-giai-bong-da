/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070b14',
          900: '#0B132B',
          850: '#111C38',
          800: '#1C2541',
          700: '#273559',
          600: '#3A506B',
        },
        pitch: {
          DEFAULT: '#059669',
          light: '#10B981',
          dark: '#047857',
          glow: '#10e86b',
        },
        electric: {
          blue: '#00F5D4',
          cyan: '#00BBF9',
          sky: '#38BDF8',
          indigo: '#6366F1',
        },
        gold: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          glow: '#FCD34D',
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'radar': 'radar 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 15px rgba(16, 232, 107, 0.6))' },
          '50%': { opacity: 0.7, filter: 'drop-shadow(0 0 5px rgba(16, 232, 107, 0.2))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        radar: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
