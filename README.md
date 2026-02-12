# Note App - Projet de pratique

Stack : Nuxt 3 + SQLite

## Installation

```bash
cd note-app
npm install
npm run dev
```

## Structure API

- `GET /api/notes` - Récupère toutes les notes
- `POST /api/notes` - Crée une note (body: {title, content, tags})
- `PUT /api/notes/:id` - Met à jour une note
- `DELETE /api/notes/:id` - Supprime une note

## Schéma DB

```sql
notes:
- id (INTEGER)
- title (TEXT)
- content (TEXT)
- tags (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
```

Alors, tu veux créer quoi comme features ?
- Liste des notes
- Formulaire création
- Edition en ligne
- Mise en forme (gras/italique)
- Tags/categories
- Recherche
- Tout ça ?