import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101114",
        charcoal: "#17181b",
        paper: "#f4f2ed",
        chalk: "#ffffff",
        copper: "#b56d42",
        copperLight: "#d39a73",
        line: "#dedbd3",
        mist: "#8b8a86"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(16, 17, 20, 0.12)",
        card: "0 10px 30px rgba(16, 17, 20, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
