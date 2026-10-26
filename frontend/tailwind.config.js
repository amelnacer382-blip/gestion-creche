/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f4',
          100: '#fbe8e8',
          200: '#f7d5d5',
          300: '#f0b5b5',
          400: '#e48a8a',
          500: '#d56060',
          600: '#c04242',
          700: '#a13333',
          800: '#852d2d',
          900: '#6f2b2b',
        },
        primary: {
          50: '#f0fdf9',
          100: '#ccfbe9',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        }
      }
    },
  },
  plugins: [],
}
