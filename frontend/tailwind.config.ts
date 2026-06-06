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
        // WTL brand colors — warm, hopeful, approachable
        wtl: {
          coral: "#FF6B6B",       // primary CTA
          "coral-dark": "#E55A5A",
          gold: "#FFD93D",        // accents, badges
          sage: "#6BCB77",        // success, adopted
          sky: "#4D96FF",         // links, info
          navy: "#1A1A2E",        // headings
          cream: "#FFF8F0",       // page background
          warm: "#F5EDE3",        // card backgrounds
          muted: "#8B8B8B",       // secondary text
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
