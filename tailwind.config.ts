import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FEFCF8",
          100: "#FAF3E7",
          200: "#F4E7D3",
        },
        paper: "#FBF6EC",
        ink: "#3B2F26",
        clay: {
          400: "#E0997B",
          500: "#D2764F",
          600: "#B85C38",
          700: "#8F4327",
        },
        sage: {
          400: "#9CB380",
          500: "#7F9A63",
          600: "#647E4A",
        },
      },
      fontFamily: {
        hand: ["var(--font-hand)", "cursive"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "notebook-lines":
          "repeating-linear-gradient(transparent, transparent 27px, #E7DAC4 27px, #E7DAC4 28px)",
      },
    },
  },
  plugins: [],
};
export default config;
