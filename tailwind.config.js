/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        /* Light Blue palette - Noguchi Design */
        lightblue: {
          50: '#bfc0d1',
          100: '#c4cfd6',
          500: '#00c6e6',
          700: '#253045',
          900: '#191e2b'
        },
        primary: {
          50: '#bfc0d1',
          100: '#c4cfd6',
          500: '#00c6e6',
          600: '#00c6e6',
          700: '#253045',
          900: '#191e2b'
        }
      },
      boxShadow: {
        soft: '0 18px 45px rgba(25, 30, 43, 0.12)'
      }
    }
  },
  plugins: []
};
