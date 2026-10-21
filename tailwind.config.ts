import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "-apple-system", "sans-serif"],
      },
      colors: {
        canvas: {
          light: "#F9F8F5",
          dark: "#0F1012",
        },
        ink: {
          light: "#16171A",
          dark: "#ECEBE8",
          mutedLight: "#6B6E77",
          mutedDark: "#838690",
        },
        borderSubtle: {
          light: "#E5E3DC",
          dark: "#232529",
        },
        brass: {
          light: "#8C6D37",
          dark: "#C5A059",
        },
      },
    },
  },
  plugins: [],
};
export default config;
