<template>
  <div class="flex h-full">
    <NoteSidebar
      v-show="sidebarOpen"
      :notes="noteList"
      :active-note-id="activeNoteId"
      @create="createNote"
      @select="selectNote"
    />
    <ClientOnly>
      <NoteEditor :note="activeNote" @save="saveNote" @delete="deleteNote" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(true)
provide("sidebarOpen", sidebarOpen)

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
  await $fetch(`/api/notes/${id}`, { method: "DELETE" })
  if (activeNoteId.value === id) {
    activeNoteId.value = null
    activeNote.value = null
  }
  await refresh()
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
