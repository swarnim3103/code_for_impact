/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        customBrown: '#705C53',
        customBrown2:"#B7B7B7",
        customBrown3:"#F5F5F7",
        customBrown4:"#EDDFE0",
        custom:"#FFCFB3",
        custom2:"#E78F81"
      },
    },
  },
  plugins: [],
}

