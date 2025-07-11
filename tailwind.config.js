/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Berkshire Swash', 'sans-serif'],
        serif: ["Merriweather", "serif"],
        mono: ["Menlo", "monospace"],

      },
      colors: {
      naranja: "#FF8C00",
      blanco: "#FFFFFF",
      gris: "#F5F5F5",
      },
    },  
  },
  plugins: [],
};
