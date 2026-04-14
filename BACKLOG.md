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

- [x] Tableaux (extension TipTap Table) — insertion via toolbar, bubble menu contextuel (add row/col, merge/split filtré via editor.can(), delete), roundtrip markdown OK
- [ ] Checklists / task lists (extension TipTap TaskList)
- [x] Diagrammes Mermaid — bloc code-block custom (language=mermaid) avec NodeView Vue : preview SVG, toggle source/preview, templates (flowchart/sequence/class/state/ER/gantt/pie/mindmap), lien doc. Roundtrip markdown via fenced code block.
- [ ] Schémas libres Excalidraw (dessin libre, complément de Mermaid)

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
- [~] Découper NoteEditor.vue — toolbar extraite dans `utils/editorToolbar.ts` (-222 lignes). Reste à découper davantage.
- [ ] Constantes API centralisées (remplacer les URLs en dur)
- [ ] Standardiser les réponses API (format uniforme)
- [ ] Gestion d'erreurs réseau dans index.vue (try/catch sur les fetch)

### Tests

- [x] Setup vitest (config `@nuxt/test-utils` + happy-dom, script `npm test`)
- [x] Tests unitaires composables — useActiveNote, useFindInNote, useImageUpload, useAuth
- [~] Tests serveur — `wouldCreateCycle` (folderCycle), `validateId`/`validateBody`. Reste : tests d'intégration HTTP des endpoints CRUD (nécessite DB de test)

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

---

## Audit sécurité (2026-03-31)

### CRITICAL

- [x] `.env` commité dans Git — vérifié : déjà dans .gitignore et non tracké
- [x] `destroy.delete.ts` : vérifié : ownership check déjà présent
- [x] `uploads/index.post.ts` : ajout vérification que la note appartient au user connecté
- [x] `uploads/note/[noteId].get.ts` : ajout vérification ownership de la note
- [x] Tokens OAuth en clair en DB — `encryptOAuthTokens: true` dans better-auth

### HIGH

- [x] Validation inputs API avec zod (title/content/tags/folders) + validateId sur tous les endpoints
- [x] `folders.parentId` sans FK ni vérification userId — FK ajoutée (migration 0007, ON DELETE SET NULL) + détection de cycles dans `PUT /api/folders/[id]`
- [x] Rate limiting sur signin/signup (10 tentatives / 15 min par IP)
- [x] Trash cleanup ne supprime pas les fichiers sur disque (`server/tasks/trash/cleanup.ts`)
- [ ] 6 vulnérabilités npm modérées (esbuild, brace-expansion, yaml via drizzle-kit)
- [x] Quota stockage par utilisateur — configurable par super admin (quotas granulaires, page admin, app_settings)

### MEDIUM

- [x] Index DB manquants (notes(userId,deletedAt), notes(folderId), folders(userId), attachments(userId,noteId))
- [x] Devtools conditionnel (`process.env.NODE_ENV === "development"`)
- [x] Headers de sécurité (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- [x] Path traversal potentiel dans `server/utils/storage.ts` — resolve + startsWith check
- [x] Conversion ID faible — remplacé par `validateId()` avec vérif int positif
- [x] Docker-compose : credentials via variables d'env avec fallback
- [x] Sessions sans maxAge/timeout configuré — `expiresIn: 7j`, `updateAge: 24h`

### LOW

- [ ] Tags et preferences stockés en text (pas normalisés)
- [ ] Pas de validation d'env au démarrage
- [ ] Pas de logging/monitoring serveur

### Qualité de code (audit)

- [~] Découper NoteEditor.vue — toolbar extraite dans `utils/editorToolbar.ts`. Reste à découper davantage (bubble menu image, panneau attachments).
- [x] Interface `Folder` dupliquée — centralisée (import depuis `types/index.ts` dans FolderBadge, FolderPickerNode, FolderTree, FolderTreeNode, NoteLibrary) + ajout type `UploadResponse`
- [ ] Refactorer FolderTree.vue (263 lignes) et FolderTreeNode.vue (247 lignes)
- [ ] Refactorer pages/index.vue (293 lignes) — séparer état global et affichage
