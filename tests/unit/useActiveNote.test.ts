import { describe, it, expect } from "vitest"
import { useActiveNote, registerNoteActions, useNoteActions } from "~/composables/useActiveNote"

describe("useActiveNote", () => {
  it("starts with no active note", () => {
    const { activeNote } = useActiveNote()
    expect(activeNote.value).toBeNull()
  })

  it("starts with library and trash hidden", () => {
    const { showLibrary, showTrash } = useActiveNote()
    expect(showLibrary.value).toBe(false)
    expect(showTrash.value).toBe(false)
  })

  it("starts with empty folder list", () => {
    const { folderList } = useActiveNote()
    expect(folderList.value).toEqual([])
  })

  it("shares state across calls (useState)", () => {
    const first = useActiveNote()
    const second = useActiveNote()
    first.showLibrary.value = true
    expect(second.showLibrary.value).toBe(true)
  })
})

describe("noteActions registry", () => {
  it("starts with no actions registered", () => {
    const actions = useNoteActions()
    expect(actions.value).toBeNull()
  })

  it("registers and retrieves note actions", () => {
    const mockActions = {
      duplicate: async () => {},
      delete: () => {},
      save: () => {},
      moveToFolder: async () => {},
    }

    registerNoteActions(mockActions)
    const actions = useNoteActions()
    expect(actions.value).toBe(mockActions)
  })
})
