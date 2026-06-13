/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#3b82f6', dark: '#2563eb', light: '#60a5fa' },
        accent: { DEFAULT: '#f59e0b', dark: '#d97706', light: '#fbbf24' },
        dark: { 100: '#1e293b', 200: '#0f172a', 300: '#334155' }
      }
    }
  },
  plugins: []
}
