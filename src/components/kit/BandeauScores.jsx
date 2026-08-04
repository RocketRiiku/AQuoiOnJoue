import { useState } from 'react';
import { Crown, PencilLine, Table2 } from 'lucide-react';
import { BarreActionsSecondaire, Bouton } from '../Bouton';
import Dialogue from '../Dialogue';
import TableauScores from './TableauScores';

/**
 * Les scores en une ligne.
 *
 * Le tableau complet occupait la moitié de l'écran en permanence — cinq lignes,
 * trois commandes chacune — pour une correction qui sert une fois sur vingt. Il
 * passe donc derrière ce bandeau : qui mène, et de combien. C'est ce que la table
 * regarde entre deux tours ; le détail, elle le demande.
 *
 * `resume` est composé **par le jeu**, parce que le sens de la victoire lui
 * appartient : un jeu à points annonce qui mène, un jeu à élimination annonce qui
 * est le plus près de sortir. Annoncer le meneur y donnait « Égalité, 0
 * avertissement », qui n'informe de rien.
 *
 * `onVoir` est facultatif, et son absence est une décision : chez un jeu dont
 * l'écran affiche déjà tous les joueurs et leurs scores, déplier un tableau
 * montrerait deux fois la même chose.
 */
function BandeauScores({ resume, onVoir }) {
  return (
    // À la largeur de son texte, et non de l'écran : une pastille pleine largeur
    // pour cinq mots d'information pesait autant qu'un titre.
    <div className="self-start inline-flex items-center gap-3 max-w-full rounded-full bg-paille/60 pl-4 pr-1.5 py-1.5">
      <p className="min-w-0 truncate text-sm">
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
      {onVoir && (
        <Bouton variante="discret" icone={Table2} onClick={onVoir}>
          Voir les scores
        </Bouton>
      )}
    </div>
  );
}

/**
 * Le tableau des scores, et son mode correction.
 *
 * **La correction est un mode, pas un décor.** Les `−`, `+` et la gomme
 * n'existent qu'ici, et seulement une fois demandés. Ils étaient collés les uns
 * aux autres sur chaque ligne de l'écran principal, où la remise à zéro se
 * confondait avec le `+` juste à côté.
 *
 * @param corrigeAuDepart ouvre directement en correction, quand on est venu pour
 *                        ça par le menu de la partie
 */
export function DialogueScores({
  lignes,
  legende,
  corrigeAuDepart = false,
  onFermer,
  onAjuster,
  onReinitialiser
}) {
  const [corrige, setCorrige] = useState(corrigeAuDepart);

  return (
    <Dialogue
      titre="Les scores"
      onFermer={onFermer}
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
  );
}

export default BandeauScores;
