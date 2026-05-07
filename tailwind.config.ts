import type { Config } from "tailwindcss";
import { heroui } from "@heroui/theme";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./features/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  plugins: [
    heroui({
      defaultTheme: "dark",
      themes: {
        dark: {
          colors: {
            background: "#111827",       // rgb(17, 24, 39)
            foreground: "#ffffff",
            content1: "#1f2937",          // rgb(31, 41, 55) — cards, table wrapper
            content2: "#283141",          // slightly lighter for hover/alt rows
            content3: "#374151",          // rgb(55, 65, 81) — borders, muted surfaces
            content4: "#4b5563",          // rgb(75, 85, 99) — hover borders
            divider: "#374151",           // rgb(55, 65, 81)
            focus: "#00f2ff",             // cyan accent
            primary: {
              50: "#e6feff",
              100: "#b3fcff",
              200: "#80faff",
              300: "#4df8ff",
              400: "#1af6ff",
              500: "#00f2ff",             // main cyan accent
              600: "#00c2cc",
              700: "#009199",
              800: "#006166",
              900: "#003033",
              DEFAULT: "#00f2ff",
              foreground: "#000000",
            },
            default: {
              50: "#f9fafb",
              100: "#d1d5db",             // rgb(209, 213, 219) — secondary text
              200: "#9ca3af",             // rgb(156, 163, 175) — muted text
              300: "#6b7280",             // rgb(107, 114, 128) — dimmed text
              400: "#4b5563",             // rgb(75, 85, 99)
              500: "#374151",             // rgb(55, 65, 81) — borders
              600: "#1f2937",             // rgb(31, 41, 55) — card bg
              700: "#111827",             // rgb(17, 24, 39) — page bg
              800: "#0d1117",
              900: "#090c10",
              DEFAULT: "#374151",
              foreground: "#d1d5db",
            },
          },
        },
      },
    }),
  ],
};

export default config;
