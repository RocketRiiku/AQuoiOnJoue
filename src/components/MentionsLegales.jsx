import { useEffect, useRef } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { BarreActions, Bouton } from './Bouton';
import { ADRESSE_CONTACT, lienMailto } from '../utils/contact';

/**
 * Mentions légales.
 *
 * Le texte est fourni par l'éditeur : il engage sa responsabilité, on ne le
 * réécrit pas au fil des refontes d'interface. Ce composant ne fait que lui
 * donner la charte du site et une hiérarchie lisible — trois niveaux de titre,
 * les sous-sections regroupées derrière un filet paille.
 *
 * **Il décrit ce que le site fait réellement.** Plusieurs paragraphes
 * (mesure d'audience, dons, mode hors connexion, prénoms du kit de jeu) portent
 * sur des fonctions qui n'existent pas encore dans le code : les retirer ou les
 * confirmer relève de l'éditeur, pas d'une relecture technique.
 */
const LIEN =
  'text-brique underline underline-offset-2 hover:text-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded';

function Bloc({ titre, children }) {
  return (
    <section className="mt-7 first:mt-0">
      <h3 className="font-titre text-xl text-encre">{titre}</h3>
      <div className="text-ardoise font-texte leading-relaxed mt-1 space-y-2">
        {children}
      </div>
    </section>
  );
}

/**
 * Sous-section : le filet dit d'un coup d'œil ce qui dépend de quoi.
 *
 * En paille, il disparaissait — la couleur est trop proche du crème du panneau
 * pour marquer une limite. L'orange atténué tient le rôle sans crier.
 */
function SousBloc({ titre, children }) {
  return (
    <section className="mt-4 border-l-2 border-orange/30 pl-4">
      <h4 className="font-titre text-base text-encre/80">{titre}</h4>
      <div className="space-y-2 mt-1">{children}</div>
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

      <p className="text-sm text-ardoise/80 font-texte leading-relaxed mt-2">
        Conformément à l’article 1-1 de la loi n°&nbsp;2004-575 du 21 juin 2004
        pour la confiance dans l’économie numérique (LCEN), modifié par la loi
        n°&nbsp;2024-449 du 21 mai 2024 visant à sécuriser et réguler l’espace
        numérique (SREN).
      </p>

      <div className="mt-6">
        <Bloc titre="Éditeur">
          <p>
            <span className="text-encre">Nathan Boumadjer</span>, particulier,
            éditant ce site à titre non professionnel et sans but lucratif.
            Également directeur de la publication.
          </p>
          <p>
            Contact&nbsp;:{' '}
            <a href={lienMailto({ sujet: 'À quoi on joue — un mot' })} className={LIEN}>
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

        <Bloc titre="Données personnelles et traceurs">
          <SousBloc titre="Ce que ce site ne fait pas">
            <p>
              Ce site ne demande aucun compte, ne dépose aucun cookie et ne
              procède à aucun profilage.
            </p>
          </SousBloc>

          <SousBloc titre="Stockage local (localStorage)">
            <p>
              Le programme de soirée que vous composez, ainsi que les prénoms
              saisis lors d’une partie (kit de jeu), sont conservés dans le
              stockage local de votre navigateur, sur votre appareil uniquement.
              Ces données ne sont transmises à personne. Vous les effacez en
              vidant les données du site depuis votre navigateur.
            </p>
            <p>
              Ce stockage est un traceur strictement nécessaire au fonctionnement
              du service que vous demandez&nbsp;; il est exempt de consentement
              au titre de l’article 82 de la loi Informatique et Libertés.
            </p>
          </SousBloc>

          <SousBloc titre="Mesure d’audience">
            <p>
              Ce site utilise Cloudflare Web Analytics, un outil de mesure
              d’audience qui ne dépose aucun cookie et n’utilise aucun stockage
              côté client. Il collecte des données agrégées (pages consultées,
              provenance, type d’appareil) afin d’améliorer le site. L’adresse IP
              des visiteurs est traitée par Cloudflare, Inc. dans le cadre de ce
              service&nbsp;; elle n’est pas recoupée avec d’autres traitements.
            </p>
            <p>
              Cloudflare, Inc. est une société américaine. Le transfert de
              données hors de l’Union européenne est encadré par les clauses
              contractuelles types (CCT) de la Commission européenne. Pour en
              savoir plus&nbsp;:{' '}
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
                className={LIEN}
              >
                politique de confidentialité de Cloudflare
              </a>
              .
            </p>
          </SousBloc>

          <SousBloc titre="Contact et suggestions">
            <p>
              Un message envoyé depuis «&nbsp;Contact&nbsp;» ou
              «&nbsp;Suggestions&nbsp;» passe par votre logiciel de
              messagerie&nbsp;: il me transmet votre adresse e-mail, que je
              n’utilise que pour vous répondre. Aucun fichier de contacts n’est
              constitué.
            </p>
          </SousBloc>

          <SousBloc titre="Dons">
            <p>
              Le bouton «&nbsp;Buy Me a Coffee&nbsp;» renvoie vers le service
              tiers buymeacoffee.com, qui traite ses propres données (adresse
              e-mail, informations de paiement) selon sa propre politique de
              confidentialité. Je ne reçois que la notification du don et
              l’identifiant choisi par le donateur. Les dons reçus servent
              exclusivement à couvrir les frais de fonctionnement du site (nom de
              domaine, hébergement)&nbsp;; ils ne confèrent au site aucun
              caractère commercial.
            </p>
          </SousBloc>

          <SousBloc titre="Mode hors connexion">
            <p>
              Ce site peut être installé comme application (PWA). Un service
              worker met en cache les fichiers du site sur votre appareil pour en
              permettre l’utilisation hors connexion. Aucune donnée personnelle
              n’est collectée par ce mécanisme.
            </p>
          </SousBloc>
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
            ISC (Lucide). Aucune police ni aucune image n’est chargée depuis un
            service tiers.
          </p>
          <p>
            Un jeu vous appartient et vous souhaitez qu’il n’y figure
            pas&nbsp;? Écrivez-moi, il sera retiré.
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
          M’écrire
        </Bouton>
      </BarreActions>
    </section>
  );
}

export default MentionsLegales;
