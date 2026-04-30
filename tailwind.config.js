/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg0: 'var(--bg0)',
        bg1: 'var(--bg1)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        'app-border': 'var(--border)',
        'app-borderL': 'var(--borderL)',
        accent: 'var(--accent)',
        accentD: 'var(--accentD)',
        accentL: 'var(--accentL)',
        accentMuted: 'var(--accentMuted)',
        'app-green': 'var(--green)',
        'app-amber': 'var(--amber)',
        'app-red': 'var(--red)',
        'app-blue': 'var(--blue)',
        'app-teal': 'var(--teal)',
        text0: 'var(--text0)',
        text1: 'var(--text1)',
        text2: 'var(--text2)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
