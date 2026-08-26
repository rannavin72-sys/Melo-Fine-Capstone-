/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#07090e',
        surface: 'rgba(255, 255, 255, 0.04)',
        accent: {
          cyan: '#00F2FE',
          blue: '#4FACFE',
          emerald: '#10B981',
          violet: '#7928CA',
          pink: '#FF0080'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
