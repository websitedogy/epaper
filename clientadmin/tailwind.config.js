/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        facebook: '#1877f2',
        'facebook-hover': '#0d65d9',
        twitter: '#1da1f2',
        'twitter-hover': '#0d8bd9',
        instagram: '#e1306c',
        'instagram-hover': '#c42357',
        linkedin: '#0a66c2',
        'linkedin-hover': '#004182',
        youtube: '#ff0000',
        'youtube-hover': '#cc0000',
      },
    },
  },
  plugins: [],
}