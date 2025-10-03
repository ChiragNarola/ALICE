module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
      'fade-in': {
        '0%': { opacity: 0, transform: 'translateY(-5px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
      },
    },
    animation: {
      'fade-in': 'fade-in 0.25s ease-out forwards',
    },
      colors: {
        'alice-teal': '#008080',
        'alice-peach': '#FEF3E4',
        'alice-black': '#1B1B1B',
        'alice-gray': '#1B1B1B1A',
        'alice-darkgray': '#5E5E5E',
      },
    },
  },
  plugins: [],
};