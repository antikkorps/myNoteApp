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
        :notes="filteredNotes"
        :all-notes="noteList"
        :active-note-id="activeNoteId"
        :active-tag="activeTag"
        @create="createNote"
        @select="selectNote"
        @filter-tag="handleFilterTag"
      />
    </Transition>
    <ClientOnly>
      <NoteEditor :note="activeNote" @save="saveNote" @delete="deleteNote" />
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
  createdAt: string
  updatedAt: string
}

const { data: noteList, refresh } = await useFetch("/api/notes", {
  key: "notes-list",
  default: () => [] as Note[],
})

const activeNoteId = ref<number | null>(null)
const activeNote = ref<Note | null>(null)
const activeTag = ref<string | null>(null)

const filteredNotes = computed(() => {
  if (!activeTag.value) return noteList.value
  return noteList.value.filter((note) =>
    parseTags(note.tags).includes(activeTag.value!),
  )
})

function handleFilterTag(tag: string | null) {
  activeTag.value = tag
  // Deselect active note if it doesn't match the new filter
  if (tag && activeNote.value && !parseTags(activeNote.value.tags).includes(tag)) {
    activeNoteId.value = null
    activeNote.value = null
  }
}

async function selectNote(id: number) {
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
  activeTag.value = null
  const note = await $fetch("/api/notes", {
    method: "POST",
    body: { title: "", content: "" },
  })
  await refresh()
  if (note) selectNote(note.id)
}

async function saveNote(payload: { id: number; title: string; content: string; tags: string }) {
  await $fetch(`/api/notes/${payload.id}`, {
    method: "PUT",
    body: {
      title: payload.title || "Untitled",
      content: payload.content,
      tags: payload.tags,
    },
  })
  await refresh()
}

async function deleteNote(id: number) {
  const noteToDelete = noteList.value.find((n) => n.id === id)
  if (!noteToDelete) return

  //Visually remove the note immediately
  noteList.value = noteList.value.filter((n) => n.id !== id)
  if (activeNoteId.value === id) {
    activeNoteId.value = null
    activeNote.value = null
  }

  // Timer before actual deletion
  let cancelled = false
  const timer = setTimeout(async () => {
    if (!cancelled) {
      await $fetch(`/api/notes/${id}`, { method: "DELETE" })
      await refresh()
    }
  }, 5000)

  // Toast avec undo
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

// Auto-select first note or deselect if active note disappears from filtered list
watch(
  filteredNotes,
  (list) => {
    if (activeNoteId.value && !list.find((n) => n.id === activeNoteId.value)) {
      // Active note no longer in filtered list
      if (list.length > 0) {
        selectNote(list[0]!.id)
      } else {
        activeNoteId.value = null
        activeNote.value = null
      }
    } else if (list.length > 0 && !activeNoteId.value) {
      selectNote(list[0]!.id)
    }
  },
  { immediate: true },
)
</script>
