/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Active le mode dark mode
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'), // AJOUTE CECI
  ],
}
