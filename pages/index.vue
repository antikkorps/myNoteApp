<template>
  <div class="flex h-full">
    <NoteSidebar
      :notes="noteList"
      :active-note-id="activeNoteId"
      @create="createNote"
      @select="selectNote"
    />
    <NoteEditor :note="activeNote" @save="saveNote" @delete="deleteNote" />
  </div>
</template>

<script setup lang="ts">
interface Note {
  id: number
  title: string
  content: string
  tags: string
  createdAt: string
  updatedAt: string
}

const { data: notesResponse, refresh } = await useFetch("/api/notes")
const noteList = computed(() => notesResponse.value?.data ?? [])

const activeNoteId = ref<number | null>(null)
const activeNote = ref<Note | null>(null)

async function selectNote(id: number) {
  activeNoteId.value = id
  const found = noteList.value.find((n: Note) => n.id === id)
  if (found) {
    activeNote.value = { ...found }
  }
}

async function createNote() {
  const response = await $fetch("/api/notes", {
    method: "POST",
    body: { title: "", content: "" },
  })
  if (response.data) {
    await refresh()
    selectNote(response.data.id)
  }
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
    if (list.length > 0 && !activeNoteId.value) {
      selectNote(list[0].id)
    }
  },
  { immediate: true },
)
</script>
