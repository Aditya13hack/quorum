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
        paypal: {
          blue: '#003087',
          sky: '#0079C1',
          light: '#E6F0FA',
          dark: '#001C48',
        },
      },
    },
  },
  plugins: [],
}
