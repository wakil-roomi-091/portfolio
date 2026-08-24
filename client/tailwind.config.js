/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Backed by CSS variables set at runtime by applyAccent() (utils/
        // appearance.js). The `<alpha-value>` placeholder lets opacity
        // utilities (accent/30, bg-accent/10, …) work natively, and because
        // the value is a var, every accent surface recolours live the instant
        // the variable changes — no reload, on every page.
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        "accent-end": "rgb(var(--accent-end-rgb) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      animation: {
        float: "float 18s ease-in-out infinite alternate",
        floaty: "floaty 6s ease-in-out infinite",
        "floaty-delay-1": "floaty 6s ease-in-out infinite 1.2s",
        "floaty-delay-2": "floaty 6s ease-in-out infinite 2.4s",
        "scroll-left": "scroll-left 30s linear infinite",
        slide: "slide 12s linear infinite",
        "slide-slow": "slide 20s linear infinite",
        fadeIn: "fadeIn 0.2s ease",
        popIn: "popIn 0.25s ease",
        dropdownIn: "dropdownIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
        dropdownItemIn: "dropdownItemIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        float: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(-30px, 40px) scale(1.08)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "scroll-left": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        slide: {
          from: { transform: "translate(-25%, -25%) rotate(0deg)" },
          to: { transform: "translate(-25%, -25%) rotate(360deg)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        popIn: {
          from: { opacity: "0", transform: "scale(0.96) translateY(8px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        dropdownIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        dropdownItemIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
