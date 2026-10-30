// ==UserScript==
// @name         Miraculous.to — Anti-spoil
// @namespace    https://miraculous.to/anti-spoil-local/
// @version      1.0.0
// @description  Masque les titres, les miniatures et l'image d'attente du lecteur. Conserve les numéros des épisodes et les boutons de lecture.
// @match        *://miraculous.to/*
// @match        *://www.miraculous.to/*
// @run-at       document-start
// @sandbox      DOM
// @grant        GM_addStyle
// ==/UserScript==

(() => {
    'use strict';

    // Protection renforcée : remplace true par false pour garder une rubrique.
    const MASQUER_SYNOPSIS = true;
    const MASQUER_COMMENTAIRES = true;
    const MASQUER_ACTUALITES = true;

    const TITRE_ONGLET = 'Miraculous — Anti-spoil';
    const POSTER_NEUTRE = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90">' +
        '<rect width="100%" height="100%" fill="#171720"/></svg>'
    );

    const TITRES = [
        '.mto-episode-title',
        '.episode .entry__title',
        '.mto-search-card-title',
        '.mto-upcoming__title',
        '.mto-upcoming__title-toggle',
        '.mto-upcoming__mini-title',
        '.mto-watch-heading .page-title',
        '#nav-ep-title',
        '#mto-watch-prev-title',
        '#mto-watch-next-title',
        '.mto-watch-next-title',
        '.mto-mini-title'
    ].join(',');

    const IMAGES = [
        '.mto-episode-image',
        '.episode .entry__img',
        '.mto-search-image',
        '.mto-upcoming__poster',
        '.mto-upcoming__mini-image',
        '.mto-watch-next-media img',
        '.mto-player-presentation-cover img',
        '.vjs-poster img'
    ].join(',');

    const CARTES = [
        '.mto-card-link',
        '.mto-episode-card',
        '.mto-search-card',
        '.mto-upcoming__mini',
        '.mto-upcoming__hero',
        '.mto-upcoming__button--watch',
        '.mto-watch-next-action',
        '.mto-watch-next-option',
        '.episode-nav-btn'
    ].join(',');

    let css = `
        ${TITRES} { display: none !important; }
        ${IMAGES} { visibility: hidden !important; opacity: 0 !important; }

        .mto-episode-media,
        .mto-upcoming__hero,
        .mto-upcoming__mini-media,
        .mto-watch-next-media,
        .mto-player-presentation-cover,
        .vjs-poster {
            background-image: none !important;
            background-color: #171720 !important;
        }
    `;

    if (MASQUER_SYNOPSIS) {
        css += `
            .mto-search-description,
            #mto-watch-synopsis,
            #mto-watch-description-title,
            #mto-watch-description-toggle,
            .mto-upcoming__expandable:not(.mto-upcoming__expandable--delay),
            .mto-upcoming__text-toggle { display: none !important; }
        `;
    }
    if (MASQUER_COMMENTAIRES) {
        css += '.mto-watch-comments { display: none !important; }';
    }
    if (MASQUER_ACTUALITES) {
        css += '.mto-newsflash-banner { display: none !important; }';
    }

    // Le CSS s'applique aussi aux éléments ajoutés ensuite, sans attendre un scan.
    GM_addStyle(css);

    function modifierAttribut(element, nom, valeur) {
        if (element.getAttribute(nom) !== valeur) {
            element.setAttribute(nom, valeur);
        }
    }

    function supprimerInfobulle(element) {
        if (element.hasAttribute('title')) element.removeAttribute('title');
    }

    function parcourir(racine, selecteur, action) {
        if (racine.nodeType === 1 && racine.matches(selecteur)) action(racine);
        racine.querySelectorAll?.(selecteur).forEach(action);
    }

    function protegerCarte(carte) {
        const lien = carte.matches('a,button') ? carte : carte.closest('a');
        const meta = carte.querySelector(
            '.mto-episode-meta, .mto-search-meta, ' +
            '.mto-upcoming__mini-code, .mto-watch-next-meta'
        );
        let libelle = meta?.textContent.trim().replace(/\s+/g, ' ') || 'Épisode — anti-spoil';
        if (carte.matches('.prev-episode')) libelle = 'Épisode précédent';
        if (carte.matches('.next-episode')) libelle = 'Épisode suivant';

        supprimerInfobulle(carte);
        carte.querySelectorAll('[title]').forEach(supprimerInfobulle);
        if (carte.hasAttribute('aria-label')) modifierAttribut(carte, 'aria-label', libelle);
        if (lien) {
            supprimerInfobulle(lien);
            modifierAttribut(lien, 'aria-label', libelle);
        }
    }

    function proteger(racine) {
        // Un poster neutre conserve les contrôles vidéo natifs et l'image en lecture.
        parcourir(racine, 'video', video => modifierAttribut(video, 'poster', POSTER_NEUTRE));
        parcourir(racine, IMAGES, image => {
            if (image.tagName === 'IMG') modifierAttribut(image, 'alt', '');
            supprimerInfobulle(image);
        });
        parcourir(racine, CARTES, protegerCarte);
        if (racine.nodeType === 1) {
            const carte = racine.closest(CARTES);
            if (carte) protegerCarte(carte);
        }
    }

    function protegerOnglet() {
        if (document.querySelector('title') && document.title !== TITRE_ONGLET) {
            document.title = TITRE_ONGLET;
        }
    }

    // Surveille les ajouts, les navigations internes et les changements de poster.
    // Ne réécrit un attribut que s'il change, pour éviter les boucles d'observation.
    const observateur = new MutationObserver(modifications => {
        const racines = new Set();
        for (const modification of modifications) {
            if (modification.type === 'childList') {
                for (const noeud of modification.addedNodes) {
                    if (noeud.nodeType === 1) racines.add(noeud);
                }
                const parent = modification.target.nodeType === 1
                    ? modification.target : modification.target.parentElement;
                const carte = parent?.closest(CARTES);
                if (carte) racines.add(carte);
            } else if (modification.type === 'attributes') {
                racines.add(modification.target);
            } else {
                const carte = modification.target.parentElement?.closest(CARTES);
                if (carte) racines.add(carte);
            }
        }
        for (const racine of racines) {
            if (racine.isConnected) proteger(racine);
        }
        protegerOnglet();
    });

    observateur.observe(document, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['poster', 'title', 'aria-label', 'alt']
    });
    proteger(document);
    protegerOnglet();
})();