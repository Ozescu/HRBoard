# HRBoard

Description
-
HRBoard est une interface front-end légère pour la gestion RH (tableaux, KPI, graphiques).
L'application stocke les données en local via localStorage et fournit des vues pour :
- Dashboard (KPIs, graphiques, listes)
- Employees (liste, status, donut chart)
- Departments (liste, KPI, donut chart)
- Statistics (récapitulatif et graphiques)

Structure du projet
-
- index.html — page principale (sidebar + sections + modal)
- style.css — styles globaux pour l'interface (layout, cartes, tableaux, modal)
- script.js — logique générale : navigation, modal, gestion des interactions globales
- script/dashboard.js — graphiques et rendu des listes globales (interviews, tasks)
- script/employees.js — gestion des employés (stockage, rendu, KPI, chart)
- script/departemets.js — gestion des départements (stockage, rendu, KPI, chart)
- script/stats.js — vues statistiques et graphiques récapitulatifs
- img/ — ressources d'images (logo, icônes custom si présentes)

Données et stockage
-
Les données sont persistées côté client via `localStorage` (clefs : `hrboard_employees`, `hrboard_departments`, `hrboard_interviews`, `hrboard_tasks`, `hrboard_meetings`, ...). Les modules JS initialisent des jeux de données de démonstration si le stockage est vide.

Utilisation
-
1. Ouvrir `index.html` dans un navigateur moderne (Chrome, Edge, Firefox).
2. Utiliser la barre latérale pour naviguer entre les sections.
3. Ajouter des éléments via le bouton `+ Add` qui ouvre un modal.
4. Les modifications sont automatiquement sauvegardées dans `localStorage`.

Remarques pour les développeurs
-
- Chaque fichier source JS/CSS contient désormais un commentaire en tête expliquant son rôle.
- Les commentaires inline ont été supprimés pour alléger les fichiers ; se référer à ce README pour la vue d'ensemble.
- Les graphiques sont réalisés via Chart.js (CDN inclus dans `index.html`).

Prochaines améliorations possibles
-
- Ajouter validation de formulaire et retours utilisateur.
- Ajouter filtrage et recherche sur les listes.
- Permettre export/import JSON des données.

Licence
-
Projet d'exemple.
