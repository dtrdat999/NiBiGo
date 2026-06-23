import type { Config } from "tailwindcss";

/**
 * Design tokens travel-premium gợi du lịch Ninh Bình:
 * xanh thiên nhiên · vàng ấm · trắng/be · xanh đen.
 * Xem docs/SYSTEM_ARCHITECTURE.md §9.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#20684C",
          "green-dark": "#14503A",
          "green-soft": "#E7F0EB",
          gold: "#E0A13A",
          "gold-soft": "#F8EFD9",
          cream: "#FAF6EE",
          ink: "#14261F",
          muted: "#5B6B63",
        },
        status: {
          available: "#2F8F5B",
          limited: "#D98A2B",
          soldout: "#B04A4A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,38,31,0.04), 0 8px 24px rgba(20,38,31,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
