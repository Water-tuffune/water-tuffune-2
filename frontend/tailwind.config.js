/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        water: {
          50: '#eef2ff',
          100: '#d4e0ff',
          200: '#b3c8ff',
          300: '#809fff',
          400: '#4d7aff',
          500: '#2658e6',
          600: '#1a45c4',
          700: '#1436a0',
          800: '#0f2a7d',
          900: '#0a1d59',
        },
      },
    },
  },
  plugins: [],
};
