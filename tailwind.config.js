/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          900: '#070b14',
          850: '#0b1120',
          800: '#0f172a',
          700: '#1e293b',
          cyan: '#00f2fe',
          blue: '#4facfe',
          neon: '#00ffcc',
          danger: '#ff3366',
          warning: '#ffaa00',
          purple: '#8a2be2'
        }
      },
      animation: {
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
