# Instructions Claude — myNote-app

## Recherche de code : utiliser ai-ctx

L'outil `ai-ctx` est disponible dans le PATH (`~/bin/ai-ctx`). Il optimise les recherches en réduisant la consommation de tokens par rapport aux outils natifs (Read, Grep, Glob).

**Workflow de recherche (du moins cher au plus cher) :**

1. `ai-ctx <mot> --summary` → dans quels dossiers ça apparaît ? (~150 tokens)
2. `ai-ctx <mot> --tree` → structure des fichiers concernés (~600 tokens)
3. `ai-ctx <mot>` → scan : liste fichier:ligne:extrait (~500 tokens)
4. `ai-ctx <mot> --def -d` → définition avec contexte (~500 tokens)
5. Read / Grep natif → seulement si le ciblage précédent ne suffit pas

**Quand utiliser ai-ctx plutôt que les outils natifs :**

- Exploration large ("où est utilisé X ?") → `ai-ctx X --summary` puis `--tree`
- Comprendre un concept/module → `ai-ctx X --tree -m 5`
- Trouver une définition → `ai-ctx X --def -d`

**Quand utiliser les outils natifs :**

- Lecture d'un fichier déjà identifié → Read
- Recherche dans 1-2 fichiers précis → Grep
- Recherche de fichiers par nom → Glob

**Options utiles :**

- `-t js` / `-t vue` : filtrer par type de fichier
- `-g "*.composable.*"` : filtrer par glob
- `-d N` : contexte de N lignes (défaut: 10)
- `-m N` : limiter le nombre de résultats
- `-p ./src` : chercher dans un sous-dossier
- `--def` : cibler les définitions (function, class, const, export...)
