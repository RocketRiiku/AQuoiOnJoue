"""Génère les polices web servies par le site.

Part des sources libres (assets-source/fonts/) et produit des .woff2 restreints
au jeu latin/français dans public/fonts/.

Les trois polices sont sous licence SIL Open Font License : elles peuvent être
auto-hébergées sans restriction, contrairement aux polices commerciales
employées auparavant (Berlin Sans FB, Monotype Corsiva, Acumin).

Deux d'entre elles sont variables alors que le site n'utilise qu'un seul poids :
figer l'instance retire toutes les données d'interpolation, ce qui représente
l'essentiel du gain de taille.

Prérequis (hors npm) :
    python -m pip install fonttools brotli

Utilisation :
    npm run build:fonts
"""

import os
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets-source', 'fonts')
OUT = os.path.join(ROOT, 'public', 'fonts')

# Latin de base + Latin-1 + œ/Œ/Ÿ + apostrophes typographiques, tirets,
# points de suspension, chevrons et euro.
UNICODES = (
    list(range(0x20, 0x7F))
    + list(range(0xA0, 0x100))
    + [
        0x0152, 0x0153, 0x0178,
        0x2018, 0x2019, 0x201C, 0x201D,
        0x2013, 0x2014, 0x2026, 0x20AC, 0x2039, 0x203A,
    ]
)

# (source, sortie, instance à figer si la police est variable)
#
# Jost à 500 plutôt qu'à 400 : les titres s'affichent en très grand, et le poids
# intermédiaire retrouve l'épaisseur de trait de l'ancienne Berlin Sans.
# Source Sans 3 à 300 pour rester fidèle au texte courant en graisse légère.
JOBS = [
    ('Jost-Variable.ttf', 'titre.woff2', {'wght': 500}),
    ('PetitFormalScript-Regular.ttf', 'manuscrit.woff2', None),
    ('SourceSans3-Variable.ttf', 'texte.woff2', {'wght': 300}),
]


def build():
    os.makedirs(OUT, exist_ok=True)
    total_before = total_after = 0

    for src_name, out_name, location in JOBS:
        src = os.path.join(SRC, src_name)
        dst = os.path.join(OUT, out_name)

        font = TTFont(src)
        if location:
            font = instantiateVariableFont(font, location, updateFontNames=False)

        options = Options()
        options.layout_features = ['*']  # conserve kerning et ligatures
        options.notdef_outline = True
        options.drop_tables = ['DSIG']
        options.flavor = 'woff2'

        subsetter = Subsetter(options=options)
        subsetter.populate(unicodes=[u for u in UNICODES if u in font.getBestCmap()])
        subsetter.subset(font)

        font.flavor = 'woff2'
        font.save(dst)
        font.close()

        before = os.path.getsize(src) / 1024
        after = os.path.getsize(dst) / 1024
        total_before += before
        total_after += after
        print(
            f"{src_name:<32} {before:7.1f} ko -> {out_name:<16} {after:6.1f} ko  "
            f"(-{100 * (1 - after / before):4.1f} %)"
        )

    print(
        f"{'TOTAL':<32} {total_before:7.1f} ko -> {'':<16} {total_after:6.1f} ko  "
        f"(-{100 * (1 - total_after / total_before):4.1f} %)"
    )


if __name__ == '__main__':
    build()
