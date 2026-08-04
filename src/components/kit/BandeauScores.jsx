import { useState } from 'react';
import { Crown, PencilLine, Table2 } from 'lucide-react';
import { BarreActionsSecondaire, Bouton } from '../Bouton';
import Dialogue from '../Dialogue';
import TableauScores from './TableauScores';

/**
 * Brique : les scores en une ligne, le tableau à la demande.
 *
 * Le tableau complet occupait la moitié de l'écran en permanence — cinq lignes,
 * trois commandes chacune — pour une correction qui sert une fois sur vingt. Il
 * passe donc derrière un bandeau d'une ligne : qui mène, et de combien. C'est ce
 * que la table regarde entre deux tours ; le détail, elle le demande.
 *
 * **La correction est un mode, pas un décor.** Les `−`, `+` et `↺` n'existent
 * que dans la modale, et seulement après avoir demandé « Corriger ». Ils étaient
 * collés les uns aux autres sur chaque ligne, et le `↺` — remise à zéro — se
 * confondait avec le `+` juste à côté.
 *
 * @param lignes    ce que `TableauScores` attend, déjà calculé par le jeu
 * @param resume    la ligne à lire : `{ texte, couronne }`. C'est le jeu qui la
 *                  compose, parce que lui seul sait dans quel sens on gagne — un
 *                  jeu à élimination annonce qui est le plus près de sortir, là
 *                  où un jeu à points annonce qui mène
 * @param onAjuster passé seulement si le jeu accepte la correction
 */
function BandeauScores({ lignes, resume, legende, onAjuster, onReinitialiser }) {
  const [ouvert, setOuvert] = useState(false);
  const [corrige, setCorrige] = useState(false);

  const fermer = () => {
    setOuvert(false);
    setCorrige(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-full bg-paille/60 pl-4 pr-1.5 py-1.5">
        <p className="flex-1 min-w-0 truncate text-sm">
          {resume.couronne && (
            <Crown
              className="w-4 h-4 inline-block align-[-2px] mr-1.5 text-orange"
              aria-hidden="true"
            />
          )}
          <span className={resume.couronne ? 'text-encre' : 'text-ardoise/80'}>
            {resume.texte}
          </span>
        </p>
        <Bouton variante="discret" icone={Table2} onClick={() => setOuvert(true)}>
          Voir les scores
        </Bouton>
      </div>

      {ouvert && (
        <Dialogue
          titre="Les scores"
          onFermer={fermer}
          pied={
            onAjuster && (
              <BarreActionsSecondaire className="mt-0">
                <Bouton
                  variante="discret"
                  icone={PencilLine}
                  onClick={() => setCorrige((v) => !v)}
                  aria-pressed={corrige}
                >
                  {corrige ? 'Terminer la correction' : 'Corriger un score'}
                </Bouton>
              </BarreActionsSecondaire>
            )
          }
        >
          <div className="overflow-x-auto">
            <TableauScores
              lignes={lignes}
              legende={legende}
              onAjuster={corrige ? onAjuster : undefined}
              onReinitialiser={corrige ? onReinitialiser : undefined}
            />
          </div>
          {corrige && (
            <p className="text-ardoise/60 text-xs mt-3">
              Un point de trop&nbsp;? Corrigez-le ici, la partie continue.
            </p>
          )}
        </Dialogue>
      )}
    </>
  );
}

export default BandeauScores;
