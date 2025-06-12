/* tailwind.config.js */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'stars': "url('/etoiles_fond.png')",
        'nature': "url('/nature_background.png')"
      },
      fontFamily: {
        title: ['"Averia Serif Libre"', 'serif'],
        subtitle: ['Kalam', 'cursive']
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    // d'autres plugins éventuels
  ],
};
