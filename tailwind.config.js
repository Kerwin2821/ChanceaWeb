/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}", "./src/screens/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {

        "primary": "#AA8ED6",

        "secondary": "#553986",

        "accent": "#8E53FE",
        
        "complement": '#f4f0fa',

        "neutral": "#2C2C3B",

        "base-100": "#FFFFFF",

        "info": "#3ABFF8",

        "success": "#36D399",

        "warning": "#FBBD23",

        "error": "#F87272",
      }
    },
  },
  plugins: [],
}
