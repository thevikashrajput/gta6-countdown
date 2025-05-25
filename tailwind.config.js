// tailwind.config.js
/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        inter: ["var(--font-inter)"],
        pricedown: ["Pricedown", "sans-serif"],
        myfont: ["MyFont", "sans-serif"],
      },
      colors: {
        "gta-pink": "#FF00C1",
        "gta-purple": "#9D00FF",
        "gta-cyan": "#00FFD5",
        "gta-orange": "#FFA500",
        "gta-red": "#F44336", // For errors or "Wasted"
        "gta-green": "#4CAF50", // For success or "Passed"
        "glass-border": "rgba(255, 255, 255, 0.15)", // Darker for more contrast
        "glass-border-hover": "rgba(255, 255, 255, 0.35)",
        "dark-overlay": "rgba(0,0,0,0.75)", // For modal backdrop
      },
      boxShadow: {
        "neon-pink": "0 0 5px #FF00C1, 0 0 10px #FF00C1, 0 0 15px #FF00C1",
        "neon-cyan": "0 0 5px #00FFD5, 0 0 10px #00FFD5, 0 0 15px #00FFD5",
        // This is the value we need to copy
        "button-glow":
          "0 0 10px rgba(255, 255, 255, 0.2), 0 0 15px rgba(255, 0, 193, 0.4), inset 0 0 5px rgba(255,255,255,0.1)",
        // And this one
        "button-glow-hover":
          "0 0 15px rgba(255, 255, 255, 0.4), 0 0 25px rgba(255, 0, 193, 0.6), inset 0 0 8px rgba(255,255,255,0.2)",
        "card-hover": "0 10px 30px rgba(0,0,0,0.5)",
      },
      animation: {
        gradientBG: "gradientBG 20s ease infinite",
        spin: "spin 0.8s linear infinite",
        pulseGlow: "pulseGlow 1.8s infinite ease-in-out",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        slideUp: "slideUp 0.5s ease-out forwards",
        glitch: "glitchAnim 0.6s linear forwards",
        marquee: "marquee 40s linear infinite", // Added marquee animation definition
      },
      keyframes: {
        gradientBG: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulseGlow: {
          // Refined pulse
          "0%, 100%": {
            // --- CORRECTED ---
            boxShadow:
              "0 0 10px rgba(255, 255, 255, 0.2), 0 0 15px rgba(255, 0, 193, 0.4), inset 0 0 5px rgba(255,255,255,0.1)",
            transform: "scale(1)",
          },
          "50%": {
            // --- CORRECTED ---
            boxShadow:
              "0 0 15px rgba(255, 255, 255, 0.4), 0 0 25px rgba(255, 0, 193, 0.6), inset 0 0 8px rgba(255,255,255,0.2)",
            transform: "scale(1.03)",
          },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        glitchAnim: {
          "0%": { transform: "translate(0)", opacity: 1 },
          "10%": {
            transform: "translate(-3px, 2px) skewX(-5deg)",
            opacity: 0.8,
          },
          "20%": { transform: "translate(2px, -3px) skewX(3deg)", opacity: 1 },
          "30%": {
            transform: "translate(-2px, 2px) skewX(-2deg)",
            opacity: 0.9,
          },
          "40%": { transform: "translate(3px, -2px) skewX(4deg)", opacity: 1 },
          "50%": {
            transform: "translate(-1px, 1px) skewX(-1deg)",
            opacity: 0.85,
          },
          "60%": { transform: "translate(1px, -1px) skewX(1deg)", opacity: 1 },
          "70%": {
            transform: "translate(-2px, 3px) skewX(-3deg)",
            opacity: 0.9,
          },
          "80%": { transform: "translate(3px, -2px) skewX(2deg)", opacity: 1 },
          "90%": {
            transform: "translate(-1px, 2px) skewX(-1deg)",
            opacity: 0.95,
          },
          "100%": { transform: "translate(0)", opacity: 1 },
        },
        marquee: {
          // Added marquee keyframes
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" }, // Assuming content repeats once
        },
      },
      backgroundImage: {
        "noise-texture": "url('/assets/textures/noise-overlay.png')",
      },
    },
  },
  plugins: [],
};
