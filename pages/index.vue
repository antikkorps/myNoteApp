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
        @create="createNote"
        @select="selectNote"
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
  const note = await $fetch("/api/notes", {
    method: "POST",
    body: { title: "", content: "" },
  })
  await refresh()
  if (note) selectNote(note.id)
}

async function saveNote(payload: { id: number; title: string; content: string }) {
  await $fetch(`/api/notes/${payload.id}`, {
    method: "PUT",
    body: {
      title: payload.title || "Untitled",
      content: payload.content,
      tags: "",
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

// Auto-sélectionner la première note au chargement
watch(
  noteList,
  (list) => {
    if (list && list.length > 0 && !activeNoteId.value) {
      selectNote(list[0]!.id)
    }
  },
  { immediate: true },
)
</script>
