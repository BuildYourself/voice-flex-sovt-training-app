import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#001733",
          900: "#002247",
          800: "#053367"
        },
        electric: {
          50: "#eff7ff",
          100: "#dbeeff",
          500: "#176bff",
          600: "#0957e5",
          700: "#0645bd"
        },
        mint: "#37c994",
        aqua: "#46d7e8",
        ink: "#07111f"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 14px 45px rgba(15, 23, 42, 0.08)",
        card: "0 10px 30px rgba(2, 17, 40, 0.07)"
      },
      borderRadius: {
        "2xl": "1.35rem"
      }
    }
  },
  plugins: [animate]
};

export default config;
