/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crimson': '#DC143C',
        'crimson-deep': '#B91C2F',
        'obsidian': '#0B0C10',
        'charcoal': '#1F2833',
        'platinum': '#E5E5E5',
        'silver': '#C5C6C7',
        'neon': '#66FCF1',
        'neon-bright': '#45A29E',
        'royal': '#663399',
        'royal-deep': '#4B0082',
      },
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
        'modern': ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-cyber': 'linear-gradient(135deg, #0B0C10 0%, #1F2833 50%, #0B0C10 100%)',
        'gradient-neon': 'linear-gradient(90deg, #66FCF1 0%, #45A29E 100%)',
        'gradient-royal': 'linear-gradient(45deg, #663399 0%, #4B0082 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(102, 252, 241, 0.5)',
        'crimson': '0 0 20px rgba(220, 20, 60, 0.3)',
        'cyber': '0 8px 32px rgba(31, 40, 51, 0.8)',
      },
      animation: {
        'pulse-neon': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(102, 252, 241, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(102, 252, 241, 0.8)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
} 