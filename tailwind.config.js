/** @type {import('tailwindcss').Config} */
module.exports = {
  // content: [],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./Screens/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "clr-bglight": "#131F2A",
        "clr-bgdark": "#080F14",
        "clr-light": "#eeeeee",
        "clr-link": "#60a5fa",
        "clr-gray-light": "#D9D9D9",
        "clr-gray-dark": "#505050",
        "clr-green": "#58AE69",
        "clr-emphasize": "#C8FF00",
        "clr-emphasize-light": "#F5FFCE",
        "clr-error-red": "#FF0000",
        "clr-button-dark": "#131F2A",
      },
    },
  },
  plugins: [],
};
