export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#00f0ff', dark: '#00c4d4', light: '#5effff' },
        accent: { DEFAULT: '#ff00ff', dark: '#cc00cc', light: '#ff5eff' },
        neon: { cyan: '#00f0ff', pink: '#ff2d95', purple: '#b700ff', green: '#39ff14', yellow: '#ffe600' },
        dark: { 100: '#1a1a2e', 200: '#0d0d1a', 300: '#16213e', 400: '#0a0a14' }
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #00f0ff, 0 0 20px #00f0ff40',
        'neon-pink': '0 0 5px #ff2d95, 0 0 20px #ff2d9540',
        'neon-purple': '0 0 5px #b700ff, 0 0 20px #b700ff40',
      }
    }
  },
  plugins: []
}
