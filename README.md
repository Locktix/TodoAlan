# 📅 Agenda Personnel & Professionnel

Un agenda web simple, élégant et fonctionnel pour organiser vos journées avec des tâches et des notes.

## ✨ Fonctionnalités

### 📋 Gestion des tâches
- ✅ To-do list quotidienne avec persistance automatique
- 🎯 Système de priorités (Basse, Normale, Haute)
- 🔄 Report automatique des tâches incomplètes vers le lendemain
- 📊 Statistiques en temps réel (total, complétées, progression)
- 🔍 Filtres : Toutes / Actives / Complétées
- 🗑️ Suppression et modification des tâches

### 📝 Gestion des notes
- 📄 Notes multiples par jour
- 🔍 Recherche en temps réel dans les notes
- ✏️ Édition directe des notes
- 🗑️ Suppression des notes

### 🎨 Interface
- 🌓 Thème clair/sombre avec sauvegarde de préférence
- 📱 Design responsive (mobile, tablette, desktop)
- ⌨️ Raccourcis clavier pour une navigation rapide
- 🎯 Interface intuitive et moderne

### ⌨️ Raccourcis clavier
- `N` : Ajouter une nouvelle tâche
- `Ctrl/Cmd + N` : Nouvelle tâche (même dans un champ)
- `←` / `→` : Navigation entre les jours
- `1` : Aller à la section Agenda
- `2` : Aller à la section Notes

## 🚀 Déploiement sur GitHub Pages

### Méthode 1 : Via GitHub Desktop (Recommandé - Plus simple !)

1. **Ouvrir GitHub Desktop**
   - Si vous ne l'avez pas encore : [Téléchargez GitHub Desktop](https://desktop.github.com/)
   - Connectez-vous avec votre compte GitHub

2. **Ajouter votre dossier local**
   - Dans GitHub Desktop : **File** → **Add Local Repository**
   - Cliquez sur **Choose...** et sélectionnez le dossier `TodoAlan`
   - Si le dossier n'apparaît pas, cliquez sur **Create a New Repository** :
     - Name : `mon-agenda` (ou le nom que vous voulez)
     - Local Path : Sélectionnez le dossier parent
     - Cochez "Initialize this repository with a README" (optionnel)
     - Cliquez sur **Create Repository**

3. **Faire le premier commit**
   - Dans GitHub Desktop, vous verrez tous vos fichiers dans la colonne de gauche
   - En bas à gauche, dans "Summary", tapez : `Initial commit - Agenda personnel`
   - Cliquez sur **Commit to main** (ou **Commit to master**)

4. **Publier sur GitHub**
   - Cliquez sur le bouton **Publish repository** en haut à droite
   - Choisissez si vous voulez un dépôt **Public** (gratuit) ou **Private**
   - Décochez "Keep this code private" si vous voulez qu'il soit public
   - Cliquez sur **Publish Repository**

5. **Activer GitHub Pages**
   - Allez sur [github.com](https://github.com) dans votre navigateur
   - Ouvrez votre nouveau dépôt (ex: `VOTRE-USERNAME/mon-agenda`)
   - Cliquez sur **Settings** (Paramètres) en haut du dépôt
   - Dans le menu de gauche, cliquez sur **Pages**
   - Sous "Source", sélectionnez **main** (ou **master** selon votre branche)
   - Cliquez sur **Save**

6. **Accéder à votre site**
   - Votre site sera disponible à : `https://VOTRE-USERNAME.github.io/mon-agenda/`
   - ⏱️ GitHub peut prendre 1-2 minutes pour déployer la première fois
   - Vous verrez l'URL dans la section Pages après activation

### 🔄 Mettre à jour votre site (avec GitHub Desktop)

Quand vous modifiez vos fichiers localement :

1. **Ouvrir GitHub Desktop**
   - Vos modifications apparaîtront automatiquement dans la colonne de gauche

2. **Faire un commit**
   - En bas à gauche, dans "Summary", tapez un message (ex: `Ajout de nouvelles fonctionnalités`)
   - Cliquez sur **Commit to main**

3. **Pousser les changements**
   - Cliquez sur **Push origin** en haut à droite
   - GitHub Pages mettra à jour votre site automatiquement (1-2 minutes)

### Méthode 2 : Via la ligne de commande

Si vous préférez utiliser le terminal :

1. **Créer un nouveau dépôt** sur GitHub
   - Allez sur [github.com](https://github.com)
   - Cliquez sur "New repository"
   - Nommez-le (ex: `mon-agenda`)
   - Ne cochez PAS "Initialize with README"

2. **Pousser vos fichiers**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Agenda personnel"
   git branch -M main
   git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git
   git push -u origin main
   ```

3. **Activer GitHub Pages** (même procédure que ci-dessus, étape 5)

## 📁 Structure du projet

```
TodoAlan/
├── index.html      # Page principale
├── style.css       # Styles et thèmes
├── script.js       # Logique de l'application
└── README.md       # Ce fichier
```

## 💾 Stockage des données

Les données sont stockées localement dans le navigateur via **localStorage** :
- ✅ Fonctionne en local (`file://`)
- ✅ Fonctionne sur GitHub Pages (`https://`)
- ✅ Les données restent privées (sur votre ordinateur)
- ✅ Pas besoin de serveur ou de base de données

**Note** : Les données sont stockées par navigateur. Si vous changez de navigateur, vous devrez recréer vos tâches.

## 🔧 Personnalisation

### Modifier les couleurs
Éditez les variables CSS dans `style.css` :
```css
:root {
  --primary: #4c6ef5;    /* Couleur principale */
  --accent: #82c0ff;     /* Couleur d'accent */
  --success: #2f9e44;    /* Couleur de succès */
  /* ... */
}
```

### Modifier les clés de stockage
Dans `script.js`, modifiez `STORAGE_KEYS` si nécessaire.

## 🌐 Compatibilité

- ✅ Chrome/Edge (recommandé)
- ✅ Firefox
- ✅ Safari
- ✅ Opéra
- ✅ Navigateurs mobiles modernes

## 📝 Licence

Libre d'utilisation pour usage personnel et professionnel.

## 🐛 Problèmes connus

- Les données sont stockées par navigateur (Chrome ≠ Firefox)
- Le quota localStorage est limité (~5-10 MB selon le navigateur)
- Les données anciennes (>30 jours) sont automatiquement nettoyées si le quota est dépassé

## 💡 Astuces

- Utilisez les raccourcis clavier pour gagner du temps
- Les tâches à priorité haute apparaissent en premier
- Le thème sombre est idéal pour travailler le soir
- La recherche dans les notes fonctionne en temps réel

---

**Créé avec ❤️ pour organiser vos journées efficacement**

