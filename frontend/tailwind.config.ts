import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wtl: {
          coral: "#E11D48",
          "coral-dark": "#BE123C",
          gold: "#FACC15",
          sage: "#15803D",
          sky: "#2563EB",
          navy: "#09090B",
          cream: "#FAFAFA",
          warm: "#E5E5E5",
          muted: "#737373",
        },
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
