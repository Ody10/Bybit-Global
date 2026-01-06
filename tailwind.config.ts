import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bybit-yellow': '#f7a600',
        'bybit-bg': '#0d0d0e',
        'bybit-card': '#121214',
        'bybit-input': '#1a1a1c',
        'bybit-border': '#2a2a2e',
      },
      // 👇 ADD ONLY THIS SECTION
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
      // 👆 END OF ADDITION
    },
  },
  plugins: [],
}

export default config