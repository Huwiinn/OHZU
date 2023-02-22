/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6161",
        second: "#FFF0F0",
        hover: "#D2373F",
        iconDefault: "#CCCCCC",
        iconHover: "#666666",
        textGray: "#8E8E93",
        phGray: "#ACACAC",
        borderGray: "#E6E6E6",
      },
    },
  },
  plugins: [require("tailwind-scrollbar"), require("@tailwindcss/line-clamp")],
};
