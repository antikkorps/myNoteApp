export function parseTags(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.map(normalizeTag).filter(Boolean)
  } catch {
    // fallback: comma-separated
  }
  return raw
    .split(",")
    .map(normalizeTag)
    .filter(Boolean)
}

export function serializeTags(tags: string[]): string {
  return JSON.stringify(tags)
}

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase()
}

export function collectAllTags(notes: Array<{ tags: string | null }>): Map<string, number> {
  const counts = new Map<string, number>()
  for (const note of notes) {
    for (const tag of parseTags(note.tags)) {
      counts.set(tag, (counts.get(tag) || 0) + 1)
    }
  }
  return counts
}
