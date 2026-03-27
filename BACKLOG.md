# Backlog Note App

## Fonctionnalités

### Images & Fichiers

- [x] Stockage des fichiers (local filesystem, abstraction pour S3 futur)
- [x] API upload/download/delete + table attachments en DB
- [x] Upload d'images dans l'éditeur (drag & drop + paste + bouton toolbar)
- [x] Bubble toolbar image (download / delete au clic sur une image)
- [ ] Redimensionnement d'images dans l'éditeur (resize TipTap — à investiguer)
- [ ] Pièces jointes non-image (PDF, fichiers) — upload OK mais insertion lien dans l'éditeur KO
- [ ] Panneau pièces jointes sous l'éditeur (liste des fichiers attachés à une note)

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

- [ ] Export Markdown / JSON
- [ ] Import Markdown (migration depuis d'autres apps)

### Historique & Versions

- [ ] Historique de versions (snapshots automatiques à chaque save)
- [ ] Diff view entre versions

### Templates

- [ ] Templates de notes (meeting, todo, journal...)

### Raccourcis clavier

- [ ] Raccourcis globaux (Ctrl+N nouvelle note, Ctrl+Shift+F recherche...)
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

### Notifications

- [ ] Rappels / notifications sur une note à une date donnée
