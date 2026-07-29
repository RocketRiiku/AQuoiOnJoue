import { useEffect, useRef } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { BarreActions, Bouton } from './Bouton';
import { ADRESSE_CONTACT, lienMailto } from '../utils/contact';

/**
 * Mentions légales.
 *
 * Le site est édité par un particulier, à titre non professionnel : l'article 6
 * III-2 de la LCEN permet alors de ne publier que le nom de l'hébergeur, à
 * condition de lui avoir communiqué son identité. Le nom de l'éditeur est tout
 * de même affiché ; l'adresse postale, elle, ne l'est pas — elle n'est pas
 * exigée dans ce cas, et rien ne justifie de l'exposer.
 *
 * La section sur les données dit ce que fait réellement le site : rien n'y est
 * mesuré, rien n'y est chargé depuis un tiers, et la sélection de soirée ne
 * quitte pas l'appareil.
 */
function Bloc({ titre, children }) {
  return (
    <section className="mt-6 first:mt-0">
      <h3 className="font-titre text-xl text-encre">{titre}</h3>
      <div className="text-ardoise font-texte leading-relaxed mt-1 space-y-2">
        {children}
      </div>
    </section>
  );
}

function MentionsLegales({ onRetour }) {
  const titreRef = useRef(null);

  useEffect(() => {
    titreRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onRetour();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onRetour]);

  return (
    <section
      aria-labelledby="titre-mentions"
      className="anim-panneau bg-creme rounded-2xl shadow-xl w-full max-w-2xl px-6 py-6 sm:px-8 sm:py-8"
    >
      <h2
        id="titre-mentions"
        ref={titreRef}
        tabIndex={-1}
        className="text-3xl sm:text-4xl font-titre text-brique leading-tight focus:outline-none"
      >
        Mentions légales
      </h2>

      <div className="mt-5">
        <Bloc titre="Éditeur">
          <p>
            <span className="text-encre">Nathan Boumadjer</span>, particulier,
            éditant ce site à titre non professionnel et sans but lucratif.
            Également directeur de la publication.
          </p>
          <p>
            Contact&nbsp;:{' '}
            <a
              href={lienMailto({ sujet: 'À quoi on joue — un mot' })}
              className="text-brique underline underline-offset-2 hover:text-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded"
            >
              {ADRESSE_CONTACT}
            </a>
          </p>
        </Bloc>

        <Bloc titre="Hébergeur">
          <p>
            Cloudflare, Inc. — 101 Townsend Street, San Francisco, CA 94107,
            États-Unis. Téléphone&nbsp;: +1 (650) 319-8930.
          </p>
        </Bloc>

        <Bloc titre="Données personnelles">
          <p>
            Ce site ne demande aucun compte, ne dépose aucun cookie et ne mesure
            pas son audience. Aucune police ni aucune image n’est chargée depuis
            un service tiers.
          </p>
          <p>
            Le programme de soirée que vous composez est conservé dans le
            stockage local de votre navigateur, sur votre appareil seulement. Il
            n’est transmis à personne, et vous l’effacez en vidant les données du
            site depuis votre navigateur.
          </p>
          <p>
            Un message envoyé depuis « Contact » ou « Suggestions » passe par
            votre logiciel de messagerie&nbsp;: il nous transmet votre adresse,
            que nous n’utilisons que pour vous répondre.
          </p>
        </Bloc>

        <Bloc titre="Contenus">
          <p>
            Les illustrations sont dessinées à la main pour ce site. Les textes
            décrivant les jeux y sont rédigés&nbsp;; les règles de ces jeux
            appartiennent au répertoire commun et sont librement racontées.
          </p>
          <p>
            Les trois polices employées — Fredoka, Petit Formal Script et Source
            Sans 3 — sont sous licence SIL Open Font, et les icônes sous licence
            ISC (Lucide).
          </p>
          <p>
            Un jeu vous appartient et vous souhaitez qu’il n’y figure pas&nbsp;?
            Écrivez-nous, il sera retiré.
          </p>
        </Bloc>

        <Bloc titre="Responsabilité">
          <p>
            Les règles publiées ici sont des versions de table, résumées de
            mémoire&nbsp;: elles peuvent différer de celles d’un éditeur. Le site
            est proposé en l’état, sans garantie de disponibilité.
          </p>
        </Bloc>
      </div>

      <BarreActions>
        <Bouton variante="principal" icone={ArrowLeft} onClick={onRetour}>
          Retour aux jeux
        </Bouton>

        <Bouton
          variante="secondaire"
          icone={Mail}
          href={lienMailto({ sujet: 'À quoi on joue — un mot' })}
        >
          Nous écrire
        </Bouton>
      </BarreActions>
    </section>
  );
}

export default MentionsLegales;
