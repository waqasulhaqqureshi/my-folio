/** @type {import('tailwindcss').Config} */
/*
 * Global design-token bridge.
 * The canonical values live in app/globals.css (:root — "nm" design system
 * extracted from the Hero section). These Tailwind extensions simply expose
 * the same tokens as utilities (bg-canvas, text-ink, bg-accent, font-display…)
 * so section components can stay declarative without introducing new values.
 */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#d5cfbe", // page background (hero canvas)
        ink: "#000000", // primary text / separators
        cream: "#f8f7f3", // light text on dark imagery
        accent: "#ffff23", // electric yellow CTA/numbers
        glass: "rgba(194, 184, 172, 0.30)", // #c2b8ac4d — glass cards
        glasspane: "rgba(223, 222, 206, 0.8)", // #dfdececc — nav/panes
        chip: "#ebeada", // solid chip surface
        raised: "#e4e0ce", // raised card surface
        sand: "#c9c8ba", // hover state for chips
        mist: "#99907880", // muted strokes
      },
      fontFamily: {
        display: ['"Tr 3 A"', "Arial", "sans-serif"],
        body: ['"Ppneuemontreal Book"', "Arial", "sans-serif"],
        bodymd: ['"Ppneuemontreal"', "Arial", "sans-serif"],
      },
      borderRadius: {
        card: "0.83vw", // component radius (source: .56vw–.83vw system)
        pill: "4.86vw", // label pills
      },
      screens: {
        "3xl": "1600px",
      },
    },
  },
  plugins: [require("tailwind-scrollbar"), require("@tailwindcss/line-clamp")],
};
