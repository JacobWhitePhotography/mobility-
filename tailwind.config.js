export default {
  content: ['./index.html', './src/**/*.{jsx,js}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        fg: '#e8e4dc',
        accent: '#d4ff3a',
        muted: '#4a4845',
        dim: '#a09b92',
        surface: '#141414',
        border: '#242420',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '2px',
        md: '2px',
        lg: '4px',
        xl: '4px',
        '2xl': '4px',
      },
    },
  },
  plugins: [],
}
