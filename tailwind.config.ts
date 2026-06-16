import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        evernote: {
          green: "#00A82D",
          dark: "#2DBE60",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
