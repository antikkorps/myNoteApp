import type { Note, Folder } from "~/types"

interface NoteActions {
  duplicate: () => Promise<void>
  delete: () => void
  save: () => void
  moveToFolder: (folderId: number | null) => Promise<void>
}

const noteActionsRegistry = shallowRef<NoteActions | null>(null)

export function useActiveNote() {
  const activeNote = useState<Note | null>("activeNote", () => null)
  const showLibrary = useState<boolean>("showLibrary", () => false)
  const showTrash = useState<boolean>("showTrash", () => false)
  const folderList = useState<Folder[]>("folderList", () => [])

  return { activeNote, showLibrary, showTrash, folderList }
}

export function registerNoteActions(actions: NoteActions) {
  noteActionsRegistry.value = actions
}

export function useNoteActions() {
  return noteActionsRegistry
}
