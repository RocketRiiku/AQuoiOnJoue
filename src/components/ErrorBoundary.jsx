import { Component } from 'react';
import { Bouton } from './Bouton';

/**
 * Filet de sécurité contre l'écran blanc.
 *
 * Le catalogue est saisi à la main : une entrée malformée (champ manquant,
 * virgule oubliée) faisait planter tout le rendu React sans le moindre message,
 * en production comme en développement. On affiche à la place un écran à la
 * charte, avec le détail de l'erreur replié pour le débogage.
 *
 * Doit rester un composant de classe : React n'expose pas encore d'équivalent
 * à componentDidCatch sous forme de hook.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Erreur non rattrapée :', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
    // La sélection ou le jeu en cours peuvent être la cause : on repart propre.
    window.location.assign(window.location.pathname);
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-nature bg-repeat-y bg-top flex items-center justify-center p-4">
        <div className="bg-creme rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
          <p className="text-5xl mb-3" aria-hidden="true">
            🎲
          </p>
          <h1 className="font-titre text-3xl text-brique">Oups, la partie s&apos;est arrêtée</h1>
          <p className="text-ardoise font-texte text-lg mt-2">
            Un problème inattendu empêche l&apos;affichage. Rien n&apos;est perdu :
            rechargez la page pour repartir de zéro.
          </p>

          <Bouton variante="principal" className="mt-6" onClick={this.handleReset}>
            Revenir à la liste des jeux
          </Bouton>

          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-ardoise/80">
              Détail technique
            </summary>
            <pre className="mt-2 text-xs bg-white/70 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap text-ardoise">
              {String(error?.stack || error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
