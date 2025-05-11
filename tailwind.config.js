import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        // Primary color
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316', // orange-500
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        // Dark mode colors
        dark: {
          background: '#0F0F12',
          foreground: '#F1F1F3',
          content1: '#18181B',
          content2: '#27272A',
          content3: '#3F3F46',
          content4: '#52525B',
          divider: '#27272A',
          focus: '#F97316',
        },
        // Light mode colors
        light: {
          background: '#FFFFFF',
          foreground: '#18181B',
          content1: '#F9FAFB',
          content2: '#F3F4F6',
          content3: '#E5E7EB',
          content4: '#D1D5DB',
          divider: '#E5E7EB',
          focus: '#F97316',
        }
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

module.exports = config;