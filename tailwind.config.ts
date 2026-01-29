import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: "#4e283a",
        gold: "#98823a",
        due: "#f2a65a",
        background: "#fbfaf8",
        card: "#ffffff",
        muted: "#6c6c6c",
        line: "#e7e2dc",
      },
      fontFamily: {
        display: ["var(--font-playfair)"],
      },
      borderRadius: {
        card: "18px",
      },
    },
  },
  plugins: [],
};

export default config;
