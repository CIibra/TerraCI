/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ebene: { 950: "#15130F", 900: "#1D1A14", 800: "#2A2620", 700: "#3A342A" },
        latex: { 50: "#FBF7EF", 100: "#F3EBD8" },
        laterite: { 400: "#D97A4E", 500: "#BE5A2E", 600: "#9F4622", 700: "#7C3519" },
        palmeraie: { 400: "#5C8368", 500: "#3E6349", 600: "#2C4A35" },
        or: { 400: "#D6A94F", 500: "#BE9235" },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Work Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        contour: "radial-gradient(circle at 1px 1px, rgba(190,90,46,0.15) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
