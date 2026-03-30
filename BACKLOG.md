# Backlog Note App

## Fonctionnalités

### Images & Fichiers

- [x] Stockage des fichiers (local filesystem, abstraction pour S3 futur)
- [x] API upload/download/delete + table attachments en DB
- [x] Upload d'images dans l'éditeur (drag & drop + paste + bouton toolbar)
- [x] Bubble toolbar image (download / delete au clic sur une image)
- [x] Redimensionnement d'images dans l'éditeur (resize TipTap — handles aux coins)
- [x] Pièces jointes non-image (PDF, fichiers) — lien cliquable inséré dans l'éditeur
- [x] Panneau pièces jointes sous l'éditeur (liste des fichiers attachés à une note)

### Recherche

- [x] Barre de recherche dans la sidebar pour du général et dans le noteContextMenu pour une recherche dans le document
- [x] Recherche full-text sur titre + contenu
- [x] Résultats en temps réel (filtrage au fur et à mesure)

### Tags

- [x] Interface d'ajout/suppression de tags sur une note
- [x] Nuage de tags dans la sidebar
- [x] Filtrer les notes par tag

### Dossiers

- [x] Créer/renommer/supprimer des dossiers
- [x] Déplacer une note dans un dossier
- [x] Arborescence de dossiers dans la sidebar
- [x] Dossiers imbriqués (sous-dossiers)

### Responsive

- [x] Sidebar rétractable en mobile
- [x] Bouton hamburger pour ouvrir/fermer la sidebar
- [x] Vue éditeur plein écran sur mobile
- [ ] Swipe pour naviguer entre sidebar et éditeur (voir `@vueuse/gesture`)

### light dark mode

- [x] Toggle light/dark mode (UColorModeButton dans le header)

### Favoris & Organisation

- [ ] Favoris / épinglage de notes (accès rapide)
- [ ] Tri des notes (date, titre, alphabétique)
- [ ] Notes archivées (état intermédiaire entre actif et corbeille)

### Export & Import

- [x] Export Markdown / JSON
- [ ] Import Markdown (migration depuis d'autres apps)

### Historique & Versions

- [ ] Historique de versions (snapshots automatiques à chaque save)
- [ ] Diff view entre versions

### Templates

- [ ] Templates de notes (meeting, todo, journal...)

### Raccourcis clavier

- [x] Raccourcis globaux (Alt+N nouvelle note, Ctrl+Shift+F recherche)
- [ ] Raccourcis Markdown live dans l'éditeur (#, -, > convertis automatiquement)

### Éditeur avancé

- [ ] Tableaux (extension TipTap Table)
- [ ] Checklists / task lists (extension TipTap TaskList)

### Collaboration

- [ ] Notes partagées par lien public
- [ ] Partage entre utilisateurs

### Offline & PWA

- [ ] Service worker + cache offline
- [ ] Sync queue pour les changements hors-ligne

### Internationalisation (i18n)

- [ ] Support multilingue (FR / EN)
- [ ] Détection automatique de la langue du navigateur
- [ ] Sélecteur de langue dans les settings

### Sécurité & Validation

- [ ] Validation des inputs API avec zod/valibot (tous les endpoints)
- [ ] Vérification d'email au signup
- [ ] Confirmation avant suppression définitive (trash)

### Base de données

- [ ] Ajout des index manquants (notes.userId, notes.deletedAt, notes.folderId, folders.userId, attachments.userId)
- [ ] Foreign key sur folders.parentId → folders.id
- [ ] Contrainte d'unicité sur (userId, parentId, name) pour les dossiers

### Accessibilité (a11y)

- [ ] Labels et aria-label sur tous les inputs (sidebar search, file picker, tag input...)
- [ ] Navigation clavier dans l'arbre de dossiers
- [ ] Rôles ARIA sur les éléments interactifs
- [ ] Association des messages d'erreur avec les champs (login/signup)

### Qualité de code

- [ ] Supprimer les casts `as any` (useImageUpload, NoteEditor toolbar)
- [ ] Découper NoteEditor.vue (560+ lignes) en sous-composants
- [ ] Constantes API centralisées (remplacer les URLs en dur)
- [ ] Standardiser les réponses API (format uniforme)
- [ ] Gestion d'erreurs réseau dans index.vue (try/catch sur les fetch)

### Tests

- [ ] Setup vitest
- [ ] Tests unitaires composables (useImageUpload, useAuth, useFindInNote...)
- [ ] Tests d'intégration API (CRUD notes, folders, uploads, trash)

### Observabilité

- [ ] Logging serveur (pino ou similaire)
- [ ] Error tracking (Sentry ou similaire)
- [ ] Request ID pour le tracing

### Optimisations

- [ ] Génération de thumbnails pour les images uploadées
- [ ] Pagination des notes (si volume important)
- [ ] Lazy loading de l'éditeur TipTap

### Notifications

- [ ] Rappels / notifications sur une note à une date donnée
