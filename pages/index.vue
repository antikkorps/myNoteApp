<template>
  <div class="flex h-full relative">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="-translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="-translate-x-full opacity-0"
    >
      <NoteSidebar
        v-show="sidebarOpen"
        :notes="noteList"
        :active-note-id="activeNoteId"
        :active-tag="activeTag"
        :folders="folderList"
        :active-folder-id="activeFolderId"
        :show-all-notes="showLibrary"
        @create="createNote"
        @select="selectNote"
        @filter-tag="handleFilterTag"
        @select-folder="activeFolderId = $event"
        @move-note="moveNoteToFolder"
        @show-library="showLibrary = true"
        @refresh-folders="refreshFolders"
      />
    </Transition>
    <ClientOnly>
      <NoteLibrary
        v-if="showLibrary"
        :notes="noteList"
        :folders="folderList"
        @select-note="selectNote"
      />
      <NoteEditor
        v-else
        :note="activeNote"
        :folders="folderList"
        @save="saveNote"
        @delete="deleteNote"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = inject("sidebarOpen", ref(true))
const toast = useToast()

interface Note {
  id: number
  title: string
  content: string
  tags: string | null
  userId: string
  folderId: number | null
  createdAt: string
  updatedAt: string
}

const { data: noteList, refresh } = await useFetch<Note[]>("/api/notes", {
  key: "notes-list",
  default: () => [] as Note[],
})

interface Folder {
  id: number
  name: string
  parentId: number | null
  userId: string
  createdAt: string
  updatedAt: string
}

const { data: folderList, refresh: refreshFolders } = await useFetch<Folder[]>(
  "/api/folders",
  {
    key: "folders-list",
    default: () => [] as Folder[],
  },
)

const activeNoteId = ref<number | null>(null)
const activeNote = ref<Note | null>(null)
const activeTag = ref<string | null>(null)
const activeFolderId = ref<number | null>(null)
const showLibrary = ref(false)

function handleFilterTag(tag: string | null) {
  activeTag.value = tag
  if (tag && activeNote.value && !parseTags(activeNote.value.tags).includes(tag)) {
    activeNoteId.value = null
    activeNote.value = null
  }
}

async function selectNote(id: number) {
  showLibrary.value = false
  activeNoteId.value = id
  if (import.meta.client && window.innerWidth < 768) {
    sidebarOpen.value = false
  }
  const found = noteList.value.find((n) => n.id === id)
  if (found) {
    activeNote.value = { ...found }
  }
}

async function createNote() {
  showLibrary.value = false
  const note = await $fetch("/api/notes", {
    method: "POST",
    body: { title: "", content: "" },
  })
  await refresh()
  if (note) selectNote(note.id)
}

async function saveNote(payload: {
  id: number
  title: string
  content: string
  folderId: number | null
  tags: string
}) {
  await $fetch(`/api/notes/${payload.id}`, {
    method: "PUT",
    body: {
      title: payload.title || "Untitled",
      content: payload.content,
      tags: payload.tags,
      folderId: payload.folderId,
    },
  })
  await refresh()
}

async function moveNoteToFolder({ noteId, folderId }: { noteId: number; folderId: number | null }) {
  await $fetch(`/api/notes/${noteId}`, {
    method: "PUT",
    body: { folderId },
  })
  await refresh()
  // Update activeNote if it's the one being moved
  if (activeNote.value?.id === noteId) {
    activeNote.value = { ...activeNote.value, folderId }
  }
}

async function deleteNote(id: number) {
  const noteToDelete = noteList.value.find((n) => n.id === id)
  if (!noteToDelete) return

  noteList.value = noteList.value.filter((n) => n.id !== id)
  if (activeNoteId.value === id) {
    activeNoteId.value = null
    activeNote.value = null
  }

  let cancelled = false
  const timer = setTimeout(async () => {
    if (!cancelled) {
      await $fetch(`/api/notes/${id}`, { method: "DELETE" })
      await refresh()
    }
  }, 5000)

  toast.add({
    title: "Note supprimée",
    color: "neutral",
    actions: [
      {
        label: "Undo",
        color: "primary",
        variant: "outline",
        onClick: () => {
          cancelled = true
          clearTimeout(timer)
          noteList.value = [...noteList.value, noteToDelete].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )
          if (!activeNoteId.value) {
            selectNote(noteToDelete.id)
          }
        },
      },
    ],
  })
}

// Auto-select first note
watch(
  noteList,
  (list) => {
    if (list.length > 0 && !activeNoteId.value && !showLibrary.value) {
      selectNote(list[0]!.id)
    }
  },
  { immediate: true },
)
</script>
