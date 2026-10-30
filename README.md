# Miraculous.to — Anti-spoil

Un script Tampermonkey pour naviguer sur [Miraculous.to](https://miraculous.to/) en masquant les titres d’épisodes et les images susceptibles de révéler leur contenu.

## Fonctionnalités

- Masque les titres dans les cartes d’épisodes, les résultats de recherche et les suggestions.
- Masque les miniatures et l’image d’attente du lecteur vidéo.
- Conserve les numéros de saison et d’épisode.
- Conserve les boutons de lecture et de navigation.
- Prend en compte les éléments ajoutés dynamiquement.
- Remplace le titre de l’onglet par un intitulé neutre.
- Masque également les synopsis, commentaires et actualités par défaut.

## Installation sur Firefox

1. Installe [Tampermonkey](https://www.tampermonkey.net/) si nécessaire.
2. Ouvre le fichier [`miraculous-anti-spoil.user.js`](./miraculous_anti_spoil.user.js) et copie tout son contenu.
3. Dans le menu Tampermonkey, sélectionne **Créer un nouveau script**.
4. Remplace entièrement le code proposé par le contenu copié.
5. Enregistre avec **Ctrl+S**.
6. Ouvre ou recharge [Miraculous.to](https://miraculous.to/).

## Configuration

Les options suivantes se trouvent en haut du script :

```javascript
const MASQUER_SYNOPSIS = true;
const MASQUER_COMMENTAIRES = true;
const MASQUER_ACTUALITES = true;
```

Remplace `true` par `false` pour conserver la rubrique correspondante, puis enregistre et recharge la page.

Pour désactiver complètement le filtre, désactive le script dans Tampermonkey et recharge le site.

## Confidentialité

Le script ne collecte ni ne transmet de données. Il ne charge aucune bibliothèque externe.

## Limites

- Les noms d’épisodes peuvent rester visibles dans les URL.
- Le filtrage dépend de la structure du site et peut nécessiter une mise à jour si celle-ci change.
- Le script masque les images de présentation ; la vidéo reste visible pendant la lecture.
- Les sélecteurs de cette première version ont été vérifiés sur le HTML du site. Le fonctionnement réel dans Firefox reste à valider.

## Signaler un problème

Ouvre une issue en précisant :

- la page concernée ;
- les versions de Firefox et de Tampermonkey ;
- le comportement constaté.

## Licence

Ce projet est distribué sous licence [MIT](./LICENSE).
