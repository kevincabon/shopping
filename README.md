# Ma Liste de Courses 🛒

Une application web moderne pour gérer vos listes de courses et suivre l'évolution des prix de vos produits préférés.

## Fonctionnalités ✨

- 📱 Interface responsive et intuitive
- 🏪 Gestion de plusieurs magasins
- 📝 Création et gestion de listes de courses
- 📊 Suivi de l'historique des prix
- 🔍 Recherche de produits via code-barres
- 📸 Scanner de codes-barres (sur appareils compatibles)
- 🌙 Mode sombre/clair
- 📄 Export des listes en PDF
- 🔄 Synchronisation en temps réel
- 🔌 Mode hors-ligne disponible

## Technologies utilisées 🛠️

- React + TypeScript
- Supabase (Base de données et authentification)
- Tailwind CSS
- Chart.js (Graphiques)
- ZXing (Scanner de codes-barres)
- jsPDF (Génération de PDF)
- Lucide Icons
- Vite

## Installation 🚀

1. Clonez le dépôt :

bash
git clone https://github.com/votre-username/ma-liste-de-courses.git

2. Installez les dépendances :

bash
cd ma-liste-de-courses
npm install

3. Créez un fichier `.env` à la racine du projet :

env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase

4. Lancez l'application en mode développement :

bash
npm run dev

## Structure du projet 📁

src/
├── components/ # Composants React réutilisables
├── contexts/ # Contextes React
├── hooks/ # Hooks personnalisés
├── layouts/ # Layouts de l'application
├── lib/ # Configuration et types
├── pages/ # Pages de l'application
├── services/ # Services (API, etc.)
├── stores/ # Stores globaux (Zustand)
├── types/ # Types TypeScript
└── utils/ # Fonctions 


## Base de données 📊

### Tables principales :
- `stores` : Magasins
- `products` : Produits
- `price_history` : Historique des prix
- `shopping_lists` : Listes de courses
- `shopping_list_items` : Éléments des listes

## Fonctionnalités détaillées 🔍

### Gestion des magasins
- Création, modification et suppression de magasins
- Association des produits à des magasins spécifiques

### Gestion des produits
- Ajout de produits avec code-barres et image
- Scan de codes-barres via la caméra
- Suivi de l'historique des prix
- Statistiques d'achat

### Listes de courses
- Création de listes par magasin
- Gestion des quantités
- Export en PDF
- Historique des listes

## Déploiement 🌐

L'application est configurée pour être déployée sur Netlify :
- Build command : `npm run build`
- Publish directory : `dist`
- Variables d'environnement requises :
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Contribution 🤝

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence 📄

MIT

## Auteur ✍️

Kévin Cabon

---