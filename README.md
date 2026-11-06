# Carnet de bord

Un calendrier PWA en français pour noter ses repas, son humeur et ses rires,
ses médicaments, ses crèmes, ses activités (avec détails par activité), son
sommeil, son cycle, son intimité, sa consommation d’alcool et sa digestion.
Tous les champs sont facultatifs. Cliquez sur un jour pour ouvrir sa fiche ;
les boutons permettent plusieurs choix, sauf les réponses exclusives.
Un deuxième clic désélectionne un choix.

## Lancer le site

Pas de dépendances ni de compilation. Depuis la racine du dépôt :

```sh
python3 -m http.server 8000
```

Ouvrez <http://localhost:8000>. Chaque push sur `main` publie ces fichiers
statiques sur GitHub Pages via le workflow du dépôt. Les chemins relatifs
permettent aussi un hébergement dans un sous-répertoire.

## Installer et utiliser hors ligne

Après une première visite en ligne, le service worker met l’application en
cache. HTTPS ou `localhost` est nécessaire. Utilisez « Installer
l’application » lorsque le navigateur le propose, ou son menu d’installation.
Sur iOS : Safari → Partager → Sur l’écran d’accueil. Les possibilités
d’installation dépendent du navigateur.

## Données personnelles

Les fiches sont automatiquement enregistrées dans le `localStorage` du
navigateur, sans compte, télémétrie ni serveur de données. Chaque navigateur
garde ses propres données : les visiteurs du site public ne peuvent pas lire
vos fiches. Un point indique les jours renseignés. « Effacer cette journée »
supprime la fiche après confirmation. En cas d’échec de sauvegarde, un
avertissement s’affiche.

Les données ne sont **pas chiffrées** ni synchronisées : toute personne ayant
accès à ce profil de navigateur peut les consulter. Évitez les appareils
partagés. Effacer les données du navigateur supprime les fiches ; changer
d’appareil, de navigateur ou d’adresse du site ne les transfère pas.
Ce carnet ne fournit pas de conseils médicaux.

Pour publier une mise à jour des fichiers mis en cache, changez la version
`CACHE` dans `sw.js`. La nouvelle version devient active après fermeture
des anciens onglets de l’application.