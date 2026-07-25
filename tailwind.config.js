/* tailwind.config.js */
export default {
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
      // Noms d'usage, pas noms de fonderie : cf. src/index.css.
      fontFamily: {
        titre: ['titre', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        manuscrit: ['manuscrit', 'ui-serif', 'Georgia', 'serif'],
        texte: ['texte', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        encre: '#133f50',
        ardoise: '#205262',
        brique: '#a64331',
        orange: '#db4f22',
        creme: '#f4efe6',
        paille: '#fae9b4'
      }
    },
  },
  // line-clamp est natif depuis Tailwind 3.3 : le plugin dédié n'est plus requis.
  plugins: [],
};
