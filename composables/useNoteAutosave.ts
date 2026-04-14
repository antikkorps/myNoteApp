import type { Ref } from "vue"
import type { Note } from "~/types"

interface AutosavePayload {
  id: number
  title: string
  content: string
  tags: string
  folderId: number | null
}

export function useNoteAutosave(
  note: Ref<Note | null>,
  onSave: (payload: AutosavePayload) => void,
  delay = 1000,
) {
  const localTitle = ref("")
  const localContent = ref("")
  const localTags = ref<string[]>([])
  const localFolderId = ref<number | null>(null)
  const saving = ref(false)
  const lastSaved = ref(false)

  let saveTimer: ReturnType<typeof setTimeout> | null = null
  let isLoadingNote = false

  watch(
    () => note.value?.id,
    (newId, oldId) => {
      if (newId !== oldId && note.value) {
        isLoadingNote = true
        localTitle.value = note.value.title
        localContent.value = note.value.content
        localTags.value = parseTags(note.value.tags)
        localFolderId.value = note.value.folderId
        lastSaved.value = false
        nextTick(() => {
          isLoadingNote = false
        })
      }
    },
    { immediate: true },
  )

  watch(localContent, () => {
    if (!isLoadingNote) scheduleSave()
  })

  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      if (note.value) {
        onSave({
          id: note.value.id,
          title: localTitle.value,
          content: localContent.value,
          tags: serializeTags(localTags.value),
          folderId: localFolderId.value,
        })
        lastSaved.value = true
        saving.value = false
      }
    }, delay)
  }

  return {
    localTitle,
    localContent,
    localTags,
    localFolderId,
    saving,
    lastSaved,
    scheduleSave,
  }
}
