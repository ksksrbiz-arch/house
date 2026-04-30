/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cathedral: {
          navy: {
            DEFAULT: '#0d1b2a',
            50: '#e8edf3',
            100: '#c5d0de',
            200: '#9fb0c7',
            300: '#7990b0',
            400: '#5e789f',
            500: '#436090',
            600: '#3a5481',
            700: '#2f456e',
            800: '#25375c',
            900: '#0d1b2a',
          },
          teal: {
            DEFAULT: '#1a7f7f',
            50: '#e6f4f4',
            100: '#c0e3e3',
            200: '#96d1d1',
            300: '#6bbfbf',
            400: '#4eb1b1',
            500: '#31a3a3',
            600: '#2a9292',
            700: '#217e7e',
            800: '#1a7f7f',
            900: '#0d4040',
          },
          gold: {
            DEFAULT: '#c8a84b',
            50: '#fdf8ec',
            100: '#f9edd0',
            200: '#f4e1b0',
            300: '#eed490',
            400: '#e6c976',
            500: '#debb60',
            600: '#c8a84b',
            700: '#a88b35',
            800: '#876f25',
            900: '#614f14',
          },
        },
      },
    },
  },
  plugins: [],
};
