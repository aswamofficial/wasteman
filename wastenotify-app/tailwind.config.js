/** @type {import('tailwindcss').Config} */
/*
 * Wasteman design tokens.
 *
 * The palette is blue + green on a cool near-white canvas. The Material-role
 * names below (primary / secondary / surface-*) are kept because the imported
 * Stitch screens in pages/generated reference them by name — they're remapped
 * onto this palette so those screens inherit the new look instead of keeping
 * the old teal one. New work should prefer the plain names: brand, grass,
 * ink, canvas, line.
 */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ---------------------------------------------------- new palette */
        brand: {
          DEFAULT: "#1A73E8",
          dark: "#0B57D0",
          light: "#4C9AFF",
          surface: "#E8F0FE",
          tint: "#F4F8FF",
        },
        grass: {
          DEFAULT: "#34A853",
          dark: "#1E8E3E",
          surface: "#E6F4EA",
          tint: "#F3FAF5",
        },
        sea: {
          DEFAULT: "#00897B",
          surface: "#E0F2F1",
          tint: "#F2FAF9",
        },
        iris: {
          DEFAULT: "#5B6ADA",
          surface: "#EEF0FE",
          tint: "#F6F7FF",
        },
        flag: {
          DEFAULT: "#F59E0B",
          surface: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#DC2626",
          surface: "#FEE2E2",
        },

        ink: "#0D1B2A",
        "ink-soft": "#5A6B84",
        "ink-faint": "#8A99AE",
        canvas: "#F7F9FC",
        card: "#FFFFFF",
        line: "#E6EBF2",

        /* ------------------------------- legacy role names, remapped */
        primary: "#0D1B2A",
        "on-primary": "#FFFFFF",
        "primary-container": "#1A73E8",
        "on-primary-container": "#FFFFFF",
        "primary-fixed": "#E8F0FE",
        "primary-fixed-dim": "#C6DCFB",
        "on-primary-fixed": "#0D1B2A",

        secondary: "#1A73E8",
        "on-secondary": "#FFFFFF",
        "secondary-container": "#E8F0FE",
        "on-secondary-container": "#0B57D0",

        tertiary: "#00897B",
        "on-tertiary": "#FFFFFF",
        "tertiary-container": "#E0F2F1",
        "on-tertiary-container": "#00695C",

        error: "#DC2626",
        "on-error": "#FFFFFF",
        "error-container": "#FEE2E2",
        "on-error-container": "#991B1B",

        background: "#F7F9FC",
        "on-background": "#0D1B2A",
        surface: "#F7F9FC",
        "surface-dim": "#E9EEF6",
        "surface-bright": "#FFFFFF",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F3F6FB",
        "surface-container": "#EDF2F9",
        "surface-container-high": "#E6EDF7",
        "surface-container-highest": "#DFE7F3",
        "surface-variant": "#E6EDF7",
        "on-surface": "#0D1B2A",
        "on-surface-variant": "#5A6B84",
        "inverse-surface": "#0D1B2A",
        "inverse-on-surface": "#F7F9FC",

        outline: "#8A99AE",
        "outline-variant": "#E6EBF2",

        "warm-taupe": "#E6EBF2",
        amber: "#F59E0B",
        "secondary-text": "#5A6B84",

        /* Plain brand names some Stitch screens use directly. */
        "deep-teal": "#0B57D0",
        turquoise: "#1A73E8",
        "pale-aqua": "#E8F0FE",
        "warm-ivory": "#FFFFFF",
      },
      /*
       * The brand gradient, defined once.
       *
       * It was previously written out as `bg-gradient-to-b from-brand-dark
       * via-brand to-grass` at every call site, so the identity drifted
       * whenever one of them was edited. Named tokens mean the sidebar, the
       * headers and the primary buttons are provably the same ramp.
       *
       * Blue → green is directional, not decorative: reports enter blue
       * (reported) and leave green (resolved), which is the same pairing the
       * status pills and the trend chart use.
       */
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0B57D0 0%, #1A73E8 52%, #34A853 100%)",
        "brand-gradient-b": "linear-gradient(180deg, #0B57D0 0%, #1A73E8 52%, #34A853 100%)",
        "brand-gradient-r": "linear-gradient(90deg, #0B57D0 0%, #1A73E8 52%, #34A853 100%)",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      spacing: {
        base: "4px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "20px",
        xl: "24px",
        gutter: "12px",
        margin: "20px",
      },
      fontFamily: {
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "title-sm": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        caption: ["Inter", "sans-serif"],
        "micro-label": ["Inter", "sans-serif"],
        display: ["Plus Jakarta Sans", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "headline-lg": ["28px", { lineHeight: "32px", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "28px", fontWeight: "700" }],
        "title-sm": ["20px", { lineHeight: "24px", fontWeight: "600" }],
        "body-md": ["15px", { lineHeight: "22px", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "micro-label": [
          "11px",
          { lineHeight: "16px", letterSpacing: "0.08em", fontWeight: "700" },
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(13,27,42,.04), 0 6px 16px -8px rgba(13,27,42,.12)",
        lift: "0 2px 6px rgba(13,27,42,.06), 0 14px 30px -12px rgba(13,27,42,.18)",
        nav: "0 -2px 10px rgba(13,27,42,.06), 0 8px 30px -10px rgba(13,27,42,.16)",
        fab: "0 6px 16px rgba(26,115,232,.4)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")],
};
