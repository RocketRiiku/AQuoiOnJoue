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
        paille: '#fae9b4',
        // Le vert de l'herbe du décor, relevé sur nature_background.png — uni
        // sur toute la moitié basse de l'image. La bande de pied de page en
        // reprend la teinte, assombrie : elle se détache sans trancher.
        //
        // Cet écart n'est pas qu'affaire de goût. Un vert plus proche encore de
        // l'herbe ne portait le texte crème qu'à 3,3:1, sous le seuil AA de
        // 4,5:1 ; à ce ton, le contraste atteint 4,8:1. Ne pas éclaircir.
        herbe: '#6e9652',
        'herbe-sombre': '#51733a'
      }
    },
  },
  // line-clamp est natif depuis Tailwind 3.3 : le plugin dédié n'est plus requis.
  plugins: [],
};
