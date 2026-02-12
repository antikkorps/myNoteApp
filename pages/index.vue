<template>
  <div>
    <div class="w-full flex justify-end">
      <UButton @click="Open = true" class="m-4">Create Notes</UButton>
    </div>
    <UModal v-model:open="Open">
      <template #title> Create a new note </template>
      <template #content>
        <NoteForm @noteCreated="onNoteCreated" />
      </template>
    </UModal>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-3">
      <NoteCard v-for="note in notes.data" :key="note.id" :note="note" />
    </div>
    <p>Endpoints API disponibles :</p>
    <ul>
      <li>GET /api/notes - Liste toutes les notes</li>
      <li>POST /api/notes - Crée une note</li>
      <li>PUT /api/notes/:id - Met à jour une note</li>
      <li>DELETE /api/notes/:id - Supprime une note</li>
    </ul>
  </div>
</template>

<script setup>
const Open = ref(false)
const { data: notes, refresh } = await useFetch("/api/notes")

const fetchNotes = async () => {
  await refresh()
}

const onNoteCreated = () => {
  refresh()
  Open.value = false
}
</script>
